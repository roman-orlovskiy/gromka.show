import { ref, computed } from 'vue'
import type { Ref } from 'vue'

type CameraAttemptLogger = (data: any) => void
type FlashlightTracker = (isOn: boolean, method?: string | null) => void
type PlatformLogger = (data: any) => void

type CameraLogCallbacks = {
  trackFlashlightChange?: FlashlightTracker
  logCameraAttempt?: CameraAttemptLogger
  logPlatformInfo?: PlatformLogger
}

type TorchTransition = {
  type: 'on' | 'off'
  confirmed: boolean
  elapsedMs: number
  confirmedAtMs: number | null
}

const noop = () => {}

export const useCamera = () => {
  const cameraMethod = ref<'environment' | string>('environment')
  const camera: Ref<MediaStream | null> = ref(null)
  const devices: Ref<MediaDeviceInfo[]> = ref([])
  const isFlashlightOn = ref(false)
  const isFlashlightSupported: Ref<boolean | null> = ref(null)
  const cachedStream: Ref<MediaStream | null> = ref(null)
  const cachedAudioStream: Ref<MediaStream | null> = ref(null)
  const cachedConstraints: Ref<{ on: MediaTrackConstraints | null; off: MediaTrackConstraints | null }> = ref({ on: null, off: null })
  const cachedCapabilities: Ref<any> = ref(null)
  const isPermissionRequested = ref(false)
  let track: MediaStreamTrack | null = null

  // Тайминги (для компенсации)
  const callToTorchOnMs: Ref<number | null> = ref(null)
  const callToTorchOffMs: Ref<number | null> = ref(null)
  const torchOnHistory: Ref<number[]> = ref([])
  const torchOffHistory: Ref<number[]> = ref([])
  const lastTorchTransition: Ref<TorchTransition | null> = ref(null)

  const flashlightTimingLogs: Ref<any[]> = ref([])
  const lastFlashlightOnMs = computed(() => {
    const last = [...flashlightTimingLogs.value].find(i => i?.label?.includes('on'))
    return last?.ms ?? null
  })
  let timingIdCounter = 0
  let warmupRunning = false

  const deviceInfo = ref({
    isIOS: false,
    isAndroid: false,
    isChrome: false,
    isSafari: false,
    isYaBrowser: false,
    isTelegramWebView: false,
    iosVersion: null as number | null,
    isOldIOS: false,
    supportsTorch: false,
    supportsFillLightMode: false,
    torchCapability: null as any
  })

  const detectDeviceAndBrowser = () => {
    if (!import.meta.client) return
    const userAgent = navigator.userAgent.toLowerCase()

    let iosVersion: number | null = null
    if (/iphone|ipad|ipod/.test(userAgent)) {
      const match = userAgent.match(/os (\d+)_(\d+)/)
      if (match) {
        iosVersion = parseInt(match[1]!, 10) + parseInt(match[2]!, 10) / 10
      }
    }

    const isTelegramWebView = /telegram/i.test(userAgent) ||
      // @ts-expect-error - Telegram WebApp может быть не типизирован
      ((window as any).Telegram && (window as any).Telegram.WebApp) ||
      window.location.hostname.includes('t.me') ||
      window.location.hostname.includes('telegram.org')

    deviceInfo.value = {
      isIOS: /iphone|ipad|ipod/.test(userAgent),
      isAndroid: /android/.test(userAgent),
      isChrome: /chrome/.test(userAgent) && !/edg/.test(userAgent),
      isSafari: /safari/.test(userAgent) && !/chrome/.test(userAgent),
      isYaBrowser: /yabrowser/.test(userAgent),
      isTelegramWebView,
      iosVersion,
      isOldIOS: !!iosVersion && iosVersion < 17,
      supportsTorch: false,
      supportsFillLightMode: false,
      torchCapability: null
    }
  }

  detectDeviceAndBrowser()

  const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

  const nowMs = () => {
    if (typeof performance !== 'undefined' && performance.now) return performance.now()
    return Date.now()
  }

  const getTorchSettings = () => {
    try {
      return track?.getSettings?.() || null
    } catch {
      return null
    }
  }

  const isTorchOnFromSettings = (settings: any) => {
    if (!settings) return null
    if (typeof settings.torch === 'boolean') return settings.torch
    return null
  }

  const waitForRealTorchState = async (expectedOn: boolean, { timeoutMs = 900, pollMs = 20, stableCount = 2 } = {}) => {
    const startedAt = nowMs()
    let stableHits = 0
    while (nowMs() - startedAt < timeoutMs) {
      const torchOn = isTorchOnFromSettings(getTorchSettings())
      if (torchOn === null) return { confirmed: false, confirmedAtMs: null as number | null }
      if (torchOn === expectedOn) {
        stableHits += 1
        if (stableHits >= stableCount) return { confirmed: true, confirmedAtMs: nowMs() }
      } else {
        stableHits = 0
      }
      await delay(pollMs)
    }
    return { confirmed: false, confirmedAtMs: null as number | null }
  }

  const pushTimingLog = (payload: any) => {
    flashlightTimingLogs.value.unshift({
      id: `${Date.now()}_${timingIdCounter++}`,
      at: Date.now(),
      ...payload
    })
    if (flashlightTimingLogs.value.length > 40) {
      flashlightTimingLogs.value = flashlightTimingLogs.value.slice(0, 40)
    }
  }

  const clampMs = (ms: number, min = 0, max = 250) => Math.max(min, Math.min(max, ms))

  const median = (arr: number[]) => {
    if (!arr || arr.length === 0) return null
    const sorted = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[mid]! : Math.round((sorted[mid - 1]! + sorted[mid]!) / 2)
  }

  const HISTORY_SIZE = 7
  const updateLagWithMedian = (historyRef: Ref<number[]>, resultRef: Ref<number | null>, nextMs: number) => {
    const v = clampMs(nextMs)
    historyRef.value.push(v)
    if (historyRef.value.length > HISTORY_SIZE) historyRef.value.shift()
    resultRef.value = median(historyRef.value)
  }

  const stopStream = (stream: MediaStream | null, keepAudio = false) => {
    if (!stream?.getTracks) return
    stream.getTracks().forEach((t) => {
      if (keepAudio && t.kind === 'audio') return
      t.stop()
    })
  }

  const cacheAudioFromStream = (stream: MediaStream | null) => {
    if (!stream) return null
    const audioTracks = stream.getAudioTracks()
    if (audioTracks.length > 0) {
      cachedAudioStream.value = new MediaStream(audioTracks)
      return cachedAudioStream.value
    }
    return null
  }

  let hiddenVideoEl: HTMLVideoElement | null = null
  const getHiddenVideoEl = () => {
    if (!import.meta.client) return null
    if (!hiddenVideoEl) {
      hiddenVideoEl = document.createElement('video')
      hiddenVideoEl.playsInline = true
      hiddenVideoEl.muted = true
      hiddenVideoEl.autoplay = true
      hiddenVideoEl.setAttribute('aria-hidden', 'true')
      hiddenVideoEl.style.position = 'absolute'
      hiddenVideoEl.style.top = '0'
      hiddenVideoEl.style.left = '0'
      hiddenVideoEl.style.width = '1px'
      hiddenVideoEl.style.height = '1px'
      hiddenVideoEl.style.opacity = '0'
      hiddenVideoEl.style.pointerEvents = 'none'
      document.body.appendChild(hiddenVideoEl)
    }
    return hiddenVideoEl
  }

  const waitForTorchSupport = async (mediaTrack: MediaStreamTrack, attempts = 8, delayMs = 120) => {
    let caps: any = null
    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        caps = (mediaTrack as any).getCapabilities?.()
      } catch {
        caps = null
      }
      if (caps && (caps.torch === true || (Array.isArray(caps.fillLightMode) && (caps.fillLightMode.includes('flash') || caps.fillLightMode.includes('torch'))))) {
        return caps
      }
      await delay(delayMs)
    }
    return caps || (mediaTrack as any).getCapabilities?.()
  }

  const getFlashlightConstraints = (turnOn: boolean) => {
    const constraints: MediaTrackConstraints[] = []

    if (deviceInfo.value.isOldIOS) {
      if (turnOn) {
        constraints.push(
          { advanced: [{ torch: true }] },
          { torch: true } as any,
          { advanced: [{ fillLightMode: 'flash' }] } as any,
          { fillLightMode: 'flash' } as any,
          { advanced: [{ fillLightMode: 'torch' }] } as any,
          { fillLightMode: 'torch' } as any,
          { advanced: [{ fillLightMode: 'on' }] } as any,
          { fillLightMode: 'on' } as any,
          { advanced: [{ flash: true }] } as any,
          { flash: true } as any
        )
      } else {
        constraints.push(
          { advanced: [{ torch: false }] },
          { torch: false } as any,
          { advanced: [{ fillLightMode: 'off' }] } as any,
          { fillLightMode: 'off' } as any,
          { advanced: [{ flash: false }] } as any,
          { flash: false } as any
        )
      }
      return constraints
    }

    if (deviceInfo.value.supportsTorch) {
      constraints.push({ advanced: [{ torch: turnOn }] }, { torch: turnOn } as any)
    }

    if (deviceInfo.value.supportsFillLightMode) {
      const mode = turnOn ? 'flash' : 'off'
      constraints.push({ advanced: [{ fillLightMode: mode }] } as any, { fillLightMode: mode } as any)
    }

    if (turnOn) {
      constraints.push(
        { advanced: [{ torch: true }] },
        { torch: true } as any,
        { advanced: [{ fillLightMode: 'flash' }] } as any,
        { fillLightMode: 'flash' } as any
      )
    } else {
      constraints.push(
        { advanced: [{ torch: false }] },
        { torch: false } as any,
        { advanced: [{ fillLightMode: 'off' }] } as any,
        { fillLightMode: 'off' } as any
      )
    }

    return constraints
  }

  const setFlashlightState = async (turnOn: boolean) => {
    if (!track) return false
    try {
      const cached = turnOn ? cachedConstraints.value.on : cachedConstraints.value.off
      if (cached) {
        try {
          await (track as any).applyConstraints(cached)
          isFlashlightOn.value = !!turnOn
          return true
        } catch {
          if (turnOn) cachedConstraints.value.on = null
          else cachedConstraints.value.off = null
        }
      }

      const constraints = getFlashlightConstraints(turnOn)
      for (const constraint of constraints) {
        try {
          await (track as any).applyConstraints(constraint)
          isFlashlightOn.value = !!turnOn
          if (turnOn) cachedConstraints.value.on = constraint
          else cachedConstraints.value.off = constraint
          return true
        } catch {
          // try next
        }
      }
    } catch {
      // ignore
    }
    return false
  }

  const requestCameraPermission = async (logCallbacks: CameraLogCallbacks | null = null) => {
    const logCameraAttempt = logCallbacks?.logCameraAttempt || (noop as CameraAttemptLogger)
    try {
      logCameraAttempt({ stage: 'requesting_permission' })
      const permissionStream = await navigator.mediaDevices.getUserMedia({ video: true })
      permissionStream.getTracks().forEach((t) => t.stop())
      logCameraAttempt({ stage: 'permission_granted' })
      return true
    } catch (error: any) {
      logCameraAttempt({ stage: 'permission_denied', error: error?.message })
      return false
    }
  }

  const startCamera = async (includeAudio = false, logCallbacks: CameraLogCallbacks | null = null) => {
    const logCameraAttempt = logCallbacks?.logCameraAttempt || (noop as CameraAttemptLogger)
    logCameraAttempt({ stage: 'starting_camera', includeAudio })

    const devicesList = await navigator.mediaDevices.enumerateDevices()
    const cameras = devicesList.filter((d) => d.kind === 'videoinput')
    logCameraAttempt({ stage: 'cameras_enumerated', count: cameras.length })
    if (cameras.length === 0) throw new Error('Камеры не найдены на устройстве')

    const selectedCamera = cameras[cameras.length - 1]!

    const audioConstraints = {
      sampleRate: 44100,
      channelCount: 1,
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false
    }

    let constraintsOptions: any[] = []

    if (deviceInfo.value.isIOS) {
      constraintsOptions = [
        {
          video: {
            deviceId: { exact: selectedCamera.deviceId },
            facingMode: 'environment',
            width: { ideal: 720, max: 1280 },
            height: { ideal: 1280, max: 1920 }
          },
          audio: includeAudio ? audioConstraints : false
        },
        { video: { facingMode: { ideal: 'environment' } }, audio: includeAudio ? audioConstraints : false },
        { video: { facingMode: 'environment' }, audio: includeAudio ? audioConstraints : false },
        { video: true, audio: includeAudio ? audioConstraints : false }
      ]
    } else {
      constraintsOptions = [
        {
          video: {
            deviceId: { exact: selectedCamera.deviceId },
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: includeAudio ? audioConstraints : false
        },
        { video: { facingMode: 'environment' }, audio: includeAudio ? audioConstraints : false },
        { video: true, audio: includeAudio ? audioConstraints : false }
      ]
    }

    let stream: MediaStream | null = null
    let lastError: any = null
    for (let i = 0; i < constraintsOptions.length; i++) {
      try {
        logCameraAttempt({ stage: 'trying_constraints', attempt: i + 1, total: constraintsOptions.length })
        stream = await navigator.mediaDevices.getUserMedia(constraintsOptions[i])
        logCameraAttempt({ stage: 'camera_started', attempt: i + 1, success: true })
        break
      } catch (error: any) {
        lastError = error
        logCameraAttempt({ stage: 'camera_start_failed', attempt: i + 1, error: error?.message })
      }
    }
    if (!stream) throw new Error(`Не удалось запустить камеру. Последняя ошибка: ${lastError?.message ?? 'unknown'}`)

    track = stream.getVideoTracks()[0] || null
    if (!track) throw new Error('Не найден видео трек в потоке')

    // Привязка к скрытому видео помогает корректно инициализировать трек
    const videoEl = getHiddenVideoEl()
    try {
      if (videoEl) {
        if (videoEl.srcObject !== stream) videoEl.srcObject = stream
        const playPromise = videoEl.play()
        if (playPromise && typeof (playPromise as any).then === 'function') {
          await (playPromise as any).catch(() => {})
        }
      }
    } catch {
      // ignore
    }

    await delay(150)

    const capabilities = await waitForTorchSupport(track)
    cachedCapabilities.value = capabilities
    deviceInfo.value.supportsTorch = capabilities?.torch === true
    deviceInfo.value.supportsFillLightMode = Array.isArray(capabilities?.fillLightMode) &&
      (capabilities.fillLightMode.includes('flash') || capabilities.fillLightMode.includes('torch'))
    deviceInfo.value.torchCapability = capabilities?.torch ?? null

    const audioStream = includeAudio ? cacheAudioFromStream(stream) : null
    return { stream, audioStream }
  }

  const runWarmupToggles = async (callbacks: CameraLogCallbacks | null, options: any = {}) => {
    const { warmupCycles = 3, warmupDelayMs = 90, includeAudio = false, warmupLabelPrefix = 'calib' } = options
    if (warmupRunning) return
    warmupRunning = true
    try {
      for (let i = 0; i < warmupCycles; i++) {
        const timingLabel = `${warmupLabelPrefix}-${i + 1}`
        await turnOffFlashlight(callbacks, { force: true, timingLabel })
        await delay(warmupDelayMs)
        await turnOnFlashlight(callbacks, { includeAudio, force: true, runWarmup: false, timingLabel })
        await delay(warmupDelayMs)
      }
    } finally {
      warmupRunning = false
    }
  }

  const turnOnFlashlight = async (logCallbacks: CameraLogCallbacks | null = null, options: any = {}) => {
    const callbacks = logCallbacks || {}
    const trackFlashlightChange = callbacks.trackFlashlightChange || (noop as FlashlightTracker)
    const logCameraAttempt = callbacks.logCameraAttempt || (noop as CameraAttemptLogger)
    const logPlatformInfo = callbacks.logPlatformInfo || (noop as PlatformLogger)

    const {
      includeAudio = false,
      runWarmup = false,
      warmupCycles = 3,
      warmupDelayMs = 90,
      warmupMode = 'background',
      warmupHoldOnMs = 1000,
      warmupLabelPrefix = 'calib',
      timingLabel = null,
      force = false
    } = options

    const timingStartedAt = nowMs()

    logPlatformInfo({
      isIOS: deviceInfo.value.isIOS,
      isAndroid: deviceInfo.value.isAndroid,
      isChrome: deviceInfo.value.isChrome,
      isSafari: deviceInfo.value.isSafari,
      isYaBrowser: deviceInfo.value.isYaBrowser,
      iosVersion: deviceInfo.value.iosVersion,
      isOldIOS: deviceInfo.value.isOldIOS
    })

    if (isFlashlightOn.value && !force) {
      trackFlashlightChange(true, 'cached')
      pushTimingLog({ label: `${timingLabel ? `${timingLabel}:` : ''}on (cached)`, ms: 0, method: 'cached', confirmed: true, includeAudio })
      return { success: true, method: 'cached', audioStream: cachedAudioStream.value }
    }

    let stream = cachedStream.value
    let usedMethod = 'cached'

    try {
      if (!stream) {
        logCameraAttempt({ stage: 'no_cached_stream', action: 'creating_new' })
        if (!isPermissionRequested.value) {
          const permissionGranted = await requestCameraPermission(callbacks)
          if (!permissionGranted) throw new Error('Разрешения на камеру не были предоставлены')
          isPermissionRequested.value = true
          await delay(600)
        }
        const result = await startCamera(includeAudio, callbacks)
        stream = result.stream
        usedMethod = 'startCamera'
        if (includeAudio && result.audioStream) cachedAudioStream.value = result.audioStream
      }

      const capabilities = cachedCapabilities.value || (track as any)?.getCapabilities?.()
      if (!cachedCapabilities.value) cachedCapabilities.value = capabilities

      const hasSupport = capabilities?.torch === true ||
        (capabilities?.fillLightMode && (capabilities.fillLightMode.includes('flash') || capabilities.fillLightMode.includes('torch')))

      if (!hasSupport) throw new Error('Устройство не поддерживает функцию фонарика')

      const success = await setFlashlightState(true)
      if (!success) throw new Error('Не удалось включить фонарик')

      const confirmResult = await waitForRealTorchState(true)
      const elapsedMs = Math.round(nowMs() - timingStartedAt)
      pushTimingLog({ label: `${timingLabel ? `${timingLabel}:` : ''}on`, ms: elapsedMs, method: usedMethod, confirmed: confirmResult.confirmed, includeAudio })
      if (confirmResult.confirmed) {
        updateLagWithMedian(torchOnHistory, callToTorchOnMs, elapsedMs)
        lastTorchTransition.value = { type: 'on', confirmed: true, elapsedMs, confirmedAtMs: confirmResult.confirmedAtMs }
      } else {
        lastTorchTransition.value = { type: 'on', confirmed: false, elapsedMs, confirmedAtMs: null }
      }

      cachedStream.value = stream
      camera.value = stream
      isFlashlightOn.value = true
      trackFlashlightChange(true, usedMethod)
      logCameraAttempt({ stage: 'torch_enabled', success: true, method: usedMethod })

      if (runWarmup && confirmResult.confirmed) {
        const runWarmupAfterHold = async () => {
          if (warmupHoldOnMs > 0) await delay(warmupHoldOnMs)
          await runWarmupToggles(callbacks, { includeAudio, warmupCycles, warmupDelayMs, warmupLabelPrefix })
        }
        if (warmupMode === 'blocking') await runWarmupAfterHold()
        else void runWarmupAfterHold()
      }

      return { success: true, method: usedMethod, audioStream: cachedAudioStream.value }
    } catch (error: any) {
      if (includeAudio && stream && !cachedAudioStream.value) cacheAudioFromStream(stream)
      if (stream && !cachedStream.value) stopStream(stream, includeAudio)
      trackFlashlightChange(false, usedMethod || 'unknown')
      logCameraAttempt({ stage: 'error', method: usedMethod || 'unknown', error: error?.message })
      throw error
    }
  }

  const turnOffFlashlight = async (logCallbacks: CameraLogCallbacks | null = null, options: any = {}) => {
    const callbacks = logCallbacks || {}
    const trackFlashlightChange = callbacks.trackFlashlightChange || (noop as FlashlightTracker)
    const logCameraAttempt = callbacks.logCameraAttempt || (noop as CameraAttemptLogger)
    const { force = false, timingLabel = null } = options

    if (!isFlashlightOn.value && !force) {
      logCameraAttempt({ stage: 'already_off' })
      return
    }

    logCameraAttempt({ stage: 'disabling_torch' })
    const timingStartedAt = nowMs()
    await setFlashlightState(false)
    const confirmResult = await waitForRealTorchState(false)
    const elapsedMs = Math.round(nowMs() - timingStartedAt)
    isFlashlightOn.value = false

    pushTimingLog({ label: `${timingLabel ? `${timingLabel}:` : ''}off`, ms: elapsedMs, method: 'turnOff', confirmed: confirmResult.confirmed, includeAudio: false })
    if (confirmResult.confirmed) {
      updateLagWithMedian(torchOffHistory, callToTorchOffMs, elapsedMs)
      lastTorchTransition.value = { type: 'off', confirmed: true, elapsedMs, confirmedAtMs: confirmResult.confirmedAtMs }
    } else {
      lastTorchTransition.value = { type: 'off', confirmed: false, elapsedMs, confirmedAtMs: null }
    }

    logCameraAttempt({ stage: 'torch_disabled', success: true })
    trackFlashlightChange(false, 'turnOff')
  }

  const checkFlashlightSupport = async (logCallbacks: CameraLogCallbacks | null = null, options: any = {}) => {
    const callbacks = logCallbacks || {}
    const trackFlashlightChange = callbacks.trackFlashlightChange || (noop as FlashlightTracker)
    const logCameraAttempt = callbacks.logCameraAttempt || (noop as CameraAttemptLogger)
    const { includeAudio = false } = options

    if (isFlashlightSupported.value !== null) {
      trackFlashlightChange(isFlashlightOn.value, 'cached')
      logCameraAttempt({ stage: 'already_checked', isSupported: isFlashlightSupported.value, isOn: isFlashlightOn.value })
      return { supported: isFlashlightSupported.value, audioStream: cachedAudioStream.value }
    }

    logCameraAttempt({ stage: 'checking_support', includeAudio })
    try {
      const result = await turnOnFlashlight(callbacks, { ...options, includeAudio })
      isFlashlightSupported.value = true
      logCameraAttempt({ stage: 'support_check_complete', isSupported: true, hasAudio: !!result.audioStream })
      return { supported: true, audioStream: result.audioStream }
    } catch {
      isFlashlightSupported.value = false
      trackFlashlightChange(false, 'unknown')
      logCameraAttempt({ stage: 'support_check_complete', isSupported: false })
      return { supported: false, audioStream: cachedAudioStream.value }
    }
  }

  const refreshDevices = async () => {
    const availableDevices = await navigator.mediaDevices.enumerateDevices()
    devices.value = availableDevices
    return availableDevices
  }

  const clearCache = () => {
    stopStream(cachedStream.value)
    cachedStream.value = null
    stopStream(cachedAudioStream.value)
    cachedAudioStream.value = null
    isFlashlightSupported.value = null
    cachedConstraints.value.on = null
    cachedConstraints.value.off = null
    cachedCapabilities.value = null
    isFlashlightOn.value = false
    track = null
    flashlightTimingLogs.value = []
    callToTorchOnMs.value = null
    callToTorchOffMs.value = null
    torchOnHistory.value = []
    torchOffHistory.value = []
    lastTorchTransition.value = null
  }

  return {
    cameraMethod,
    camera,
    devices,
    isFlashlightOn,
    isFlashlightSupported,
    cachedAudioStream,
    flashlightTimingLogs,
    lastFlashlightOnMs,
    callToTorchOnMs,
    callToTorchOffMs,
    lastTorchTransition,
    turnOnFlashlight,
    turnOffFlashlight,
    checkFlashlightSupport,
    clearCache,
    refreshDevices
  }
}

