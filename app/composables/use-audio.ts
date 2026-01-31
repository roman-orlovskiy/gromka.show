import { ref } from 'vue'
import type { Ref } from 'vue'

type FrequencyRange = { min: number; max: number }

type UltrasonicMeta = {
  authStartAt: number
  authStartEpochMs: number
  receivedAt: number
}

type UltrasonicSignalCallback = (flag: number, profileKey: string | null, meta: UltrasonicMeta) => void

type AudioLoggingCallbacks = {
  logMicrophonePermission?: (success: boolean, error?: any, source?: string) => void
  logAudioSettings?: (settings: any) => void
  logFirstSoundSignal?: (payload: any) => void
}

export function useAudio() {
  const isListening = ref(false)
  const hasPermission = ref(false)
  const currentFrequency = ref(0)
  const lastSignal: Ref<any> = ref(null)
  const isFirstSignal = ref(true)
  const frequencyData: Ref<Uint8Array | null> = ref(null)
  const frequencyRange: Ref<FrequencyRange> = ref({ min: 0, max: 22050 })
  const pauseAnalysis = ref(false)

  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let microphone: MediaStreamAudioSourceNode | null = null
  let dataArray: Uint8Array | null = null
  let animationId: number | null = null
  let signalHistory: number[] = []
  let minIndex: number | null = null
  let maxIndex: number | null = null
  let frequencyResolution: number | null = null

  const SIGNAL_PROFILES = Object.freeze([
    { key: 'beat', frequency: 18850, tolerance: 120 },
    { key: 'command', frequency: 18700, tolerance: 110 },
    { key: 'off', frequency: 18550, tolerance: 110 },
    { key: 'flicker', frequency: 18300, tolerance: 120 },
    { key: 'moderate', frequency: 18100, tolerance: 110 }
  ] as const)

  const SIGNAL_AUTH = Object.freeze({
    f1: 19120,
    f2: 19020,
    tolerance: 150,
    STEP_WINDOW_MS: 240,
    AUTH_TO_PREAMBLE_WINDOW_MS: 340
  })

  const SIGNAL_CONSTANTS = {
    PREAMBLE_THRESHOLD_MIN: 40,
    PREAMBLE_THRESHOLD_DELTA: 20,
    BIT_LOW_THRESHOLD_MIN: 25,
    BIT_LOW_THRESHOLD_DELTA: 12,

    PAYLOAD_MIN_RATIO: 0.15,
    PAYLOAD_WINDOW_MS: 220,
    STABLE_SAMPLE_COUNT: 1,
    RATIO_FLAG_ON_MIN: 0.8,
    RATIO_FLAG_OFF_MAX: 0.65,

    MIN_COMMIT_INTERVAL_MS: 220,
    MIN_SAME_FLAG_REPEAT_MS: 1300,

    PEAK_TO_MEAN_RATIO_MIN: 2.2,
    PEAK_MINUS_MEAN_MIN: 45,
    PREAMBLE_FREQ_TOLERANCE_STRICT: 0.7,
    PREAMBLE_AMPLITUDE_MIN: 70,
    PREAMBLE_PEAK_TO_MEAN_RATIO_MIN: 2.4,
    PREAMBLE_PEAK_MINUS_MEAN_MIN: 55,

    COMMAND_CONFIRM_WINDOW_MS: 900,
    COMMAND_CONFIRM_REQUIRED: 1,

    FREQ_STABILITY_MAX_DEVIATION_HZ: 28,
    FREQ_STABILITY_REQUIRED_SAMPLES: 3,
    STRONG_SIGNAL_THRESHOLD: 95,
    WEAK_SIGNAL_FREQ_TOLERANCE_MULTIPLIER: 0.55
  } as const

  const authWindow = {
    stage: 0,
    deadline: 0,
    authorizedUntil: 0,
    authStartAt: 0
  }

  const payloadWindow = {
    isOpen: false,
    samples: [] as Array<{ frequency: number; amplitude: number; profileKey: string }>,
    deadline: 0,
    referenceAmplitude: 0,
    referenceFrequency: 0,
    profileKey: null as string | null,
    authStartAt: 0
  }

  let confirmBuffer: Array<{ profileKey: string; flag: number; timestamp: number }> = []

  const getNowMs = () =>
    (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now())

  const resetPayloadWindow = () => {
    payloadWindow.isOpen = false
    payloadWindow.samples = []
    payloadWindow.deadline = 0
    payloadWindow.referenceAmplitude = 0
    payloadWindow.referenceFrequency = 0
    payloadWindow.profileKey = null
    payloadWindow.authStartAt = 0
  }

  const resetPendingConfirm = () => {
    confirmBuffer = []
  }

  const resetAuthWindow = () => {
    authWindow.stage = 0
    authWindow.deadline = 0
    authWindow.authorizedUntil = 0
    authWindow.authStartAt = 0
  }

  const openPayloadWindow = (
    currentTimestamp: number,
    referenceAmplitude: number,
    referenceFrequency: number,
    profileKey: string | null,
    authStartAt = 0
  ) => {
    payloadWindow.isOpen = true
    payloadWindow.samples = []
    payloadWindow.deadline = currentTimestamp + SIGNAL_CONSTANTS.PAYLOAD_WINDOW_MS
    payloadWindow.referenceAmplitude = referenceAmplitude
    payloadWindow.referenceFrequency = referenceFrequency
    payloadWindow.profileKey = profileKey || null
    payloadWindow.authStartAt = authStartAt || 0
  }

  const isWithinRange = (value: number, target: number, tolerance: number) => Math.abs(value - target) <= tolerance

  const getDynamicThresholds = (bandMean: number) => {
    const safeMean = Number.isFinite(bandMean) ? bandMean : 0
    return {
      preamble: Math.max(SIGNAL_CONSTANTS.PREAMBLE_THRESHOLD_MIN, safeMean + SIGNAL_CONSTANTS.PREAMBLE_THRESHOLD_DELTA),
      bitLow: Math.max(SIGNAL_CONSTANTS.BIT_LOW_THRESHOLD_MIN, safeMean + SIGNAL_CONSTANTS.BIT_LOW_THRESHOLD_DELTA)
    }
  }

  const isPeakStrongEnough = (peakValue: number, bandMean: number) => {
    const safePeak = Number.isFinite(peakValue) ? peakValue : 0
    const safeMean = Number.isFinite(bandMean) ? bandMean : 0
    if (safePeak <= 0) return false
    if (safePeak - safeMean < SIGNAL_CONSTANTS.PEAK_MINUS_MEAN_MIN) return false
    const ratio = safeMean > 0 ? safePeak / safeMean : safePeak
    return ratio >= SIGNAL_CONSTANTS.PEAK_TO_MEAN_RATIO_MIN
  }

  const findProfileMatch = (frequency: number, expectedProfileKey: string | null = null, strictTolerance = false) => {
    for (const profile of SIGNAL_PROFILES) {
      if (expectedProfileKey && profile.key !== expectedProfileKey) continue
      const tolerance = strictTolerance
        ? profile.tolerance * SIGNAL_CONSTANTS.PREAMBLE_FREQ_TOLERANCE_STRICT
        : profile.tolerance
      if (isWithinRange(frequency, profile.frequency, tolerance)) return profile
    }
    return null
  }

  const isAuthToneMatch = (frequency: number, stage: number) => {
    if (stage === 0) return isWithinRange(frequency, SIGNAL_AUTH.f1, SIGNAL_AUTH.tolerance)
    if (stage === 1) return isWithinRange(frequency, SIGNAL_AUTH.f2, SIGNAL_AUTH.tolerance)
    return false
  }

  const processAuthWindow = (frequency: number, amplitude: number, bandMean: number) => {
    const t = getNowMs()

    if (authWindow.stage === 2) {
      if (t > authWindow.authorizedUntil) resetAuthWindow()
      return
    }

    if (authWindow.stage !== 0 && t > authWindow.deadline) {
      resetAuthWindow()
    }

    if (!isPeakStrongEnough(amplitude, bandMean)) return

    if (authWindow.stage === 0) {
      if (isAuthToneMatch(frequency, 0)) {
        authWindow.stage = 1
        authWindow.authStartAt = t
        authWindow.deadline = t + SIGNAL_AUTH.STEP_WINDOW_MS
      }
      return
    }

    if (authWindow.stage === 1) {
      if (isAuthToneMatch(frequency, 1)) {
        authWindow.stage = 2
        authWindow.authorizedUntil = t + SIGNAL_AUTH.AUTH_TO_PREAMBLE_WINDOW_MS
        authWindow.deadline = 0
      }
    }
  }

  const getPreambleProfile = (frequency: number, amplitude: number, bandMean: number) => {
    const profile = findProfileMatch(frequency, null, true)
    if (!profile) return null

    if (amplitude < SIGNAL_CONSTANTS.PREAMBLE_AMPLITUDE_MIN) return null
    const thresholds = getDynamicThresholds(bandMean)
    if (amplitude < thresholds.preamble) return null

    const safePeak = Number.isFinite(amplitude) ? amplitude : 0
    const safeMean = Number.isFinite(bandMean) ? bandMean : 0
    if (safePeak <= 0) return null
    if (safePeak - safeMean < SIGNAL_CONSTANTS.PREAMBLE_PEAK_MINUS_MEAN_MIN) return null
    const ratio = safeMean > 0 ? safePeak / safeMean : safePeak
    if (ratio < SIGNAL_CONSTANTS.PREAMBLE_PEAK_TO_MEAN_RATIO_MIN) return null

    return profile
  }

  const getProfileByKey = (profileKey: string | null) => SIGNAL_PROFILES.find((p) => p.key === profileKey) || null

  const getPayloadHit = (frequency: number, profileKey: string) => {
    const profile = getProfileByKey(profileKey)
    if (!profile) return null
    if (isWithinRange(frequency, profile.frequency, profile.tolerance)) return profile
    return null
  }

  const isPayloadAmplitudeValid = (amplitude: number, bandMean: number) => {
    const thresholds = getDynamicThresholds(bandMean)
    if (amplitude < thresholds.bitLow) return false
    if (!payloadWindow.referenceAmplitude) return true
    const ratio = amplitude / payloadWindow.referenceAmplitude
    return ratio >= SIGNAL_CONSTANTS.PAYLOAD_MIN_RATIO
  }

  const getAverageFromSamples = (selector: (s: any) => number) => {
    if (!payloadWindow.samples.length) return 0
    const sum = payloadWindow.samples.reduce((acc, sample) => acc + selector(sample), 0)
    return sum / payloadWindow.samples.length
  }

  const classifyFlagByRatio = (profileKey: string) => {
    const profile = getProfileByKey(profileKey)
    if (!profile) return null
    if (!payloadWindow.referenceAmplitude || payloadWindow.referenceAmplitude <= 0) return null

    const avgRatio = getAverageFromSamples((sample) => (
      payloadWindow.referenceAmplitude > 0 ? sample.amplitude / payloadWindow.referenceAmplitude : 0
    ))

    if (avgRatio >= SIGNAL_CONSTANTS.RATIO_FLAG_ON_MIN) return 1
    if (avgRatio <= SIGNAL_CONSTANTS.RATIO_FLAG_OFF_MAX) return 0
    return null
  }

  const isFrequencyStable = (freq: number) => {
    if (!payloadWindow.referenceFrequency || payloadWindow.referenceFrequency <= 0) return true

    const isStrongSignal = payloadWindow.referenceAmplitude >= SIGNAL_CONSTANTS.STRONG_SIGNAL_THRESHOLD
    const maxDeviation = isStrongSignal
      ? SIGNAL_CONSTANTS.FREQ_STABILITY_MAX_DEVIATION_HZ
      : SIGNAL_CONSTANTS.FREQ_STABILITY_MAX_DEVIATION_HZ * SIGNAL_CONSTANTS.WEAK_SIGNAL_FREQ_TOLERANCE_MULTIPLIER

    const deviation = Math.abs(freq - payloadWindow.referenceFrequency)
    if (deviation > maxDeviation) return false

    if (payloadWindow.samples.length >= SIGNAL_CONSTANTS.FREQ_STABILITY_REQUIRED_SAMPLES) {
      const frequencies = payloadWindow.samples.map(s => s.frequency)
      frequencies.push(freq)
      const avgFreq = frequencies.reduce((sum, f) => sum + f, 0) / frequencies.length
      const variance = frequencies.reduce((sum, f) => sum + (f - avgFreq) ** 2, 0) / frequencies.length
      const stdDev = Math.sqrt(variance)
      const maxStdDev = isStrongSignal ? 30 : 20
      if (stdDev > maxStdDev) return false
    }

    return true
  }

  const setupWithExistingStream = (
    audioStream: MediaStream,
    loggingCallback: AudioLoggingCallbacks | null = null,
    signalCallback: UltrasonicSignalCallback | null = null
  ) => {
    if (isListening.value) return true
    if (!audioStream || audioStream.getAudioTracks().length === 0) return false

    hasPermission.value = true

    const audioSettings = {
      sampleRate: 44100,
      channelCount: 1,
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false
    }

    loggingCallback?.logMicrophonePermission?.(true, null, 'combined_request')
    loggingCallback?.logAudioSettings?.(audioSettings)

    setupAudioAnalysis(audioStream, loggingCallback, signalCallback)
    return true
  }

  const requestMicrophonePermission = async (
    loggingCallback: AudioLoggingCallbacks | null = null,
    signalCallback: UltrasonicSignalCallback | null = null,
    existingStream: MediaStream | null = null
  ) => {
    const audioSettings = {
      sampleRate: 44100,
      channelCount: 1,
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false
    }

    if (isListening.value) {
      loggingCallback?.logMicrophonePermission?.(true)
      loggingCallback?.logAudioSettings?.(audioSettings)
      return existingStream || true
    }

    if (existingStream && existingStream.getAudioTracks().length > 0) {
      loggingCallback?.logMicrophonePermission?.(true)
      loggingCallback?.logAudioSettings?.(audioSettings)
      return setupWithExistingStream(existingStream, loggingCallback, signalCallback) ? existingStream : null
    }

    if (!import.meta.client || !navigator.mediaDevices?.getUserMedia) {
      const error = new Error('MediaDevices API не поддерживается')
      hasPermission.value = false
      loggingCallback?.logMicrophonePermission?.(false, error)
      return null
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioSettings })
      hasPermission.value = true
      loggingCallback?.logMicrophonePermission?.(true)
      loggingCallback?.logAudioSettings?.(audioSettings)
      setupAudioAnalysis(stream, loggingCallback, signalCallback)
      return stream
    } catch (error) {
      hasPermission.value = false
      loggingCallback?.logMicrophonePermission?.(false, error)
      return null
    }
  }

  const setupAudioAnalysis = (
    stream: MediaStream,
    loggingCallback: AudioLoggingCallbacks | null = null,
    signalCallback: UltrasonicSignalCallback | null = null
  ) => {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    microphone = audioContext.createMediaStreamSource(stream)

    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0

    const micGain = audioContext.createGain()
    micGain.gain.value = 3.0

    microphone.connect(micGain)
    micGain.connect(analyser)

    const bufferLength = analyser.frequencyBinCount
    dataArray = new Uint8Array(bufferLength)

    const MIN_FREQ = 18000
    const MAX_FREQ = 19300
    minIndex = Math.floor((MIN_FREQ * analyser.fftSize) / audioContext.sampleRate)
    maxIndex = Math.min(
      Math.ceil((MAX_FREQ * analyser.fftSize) / audioContext.sampleRate),
      bufferLength
    )
    frequencyResolution = audioContext.sampleRate / analyser.fftSize

    frequencyRange.value = { min: 0, max: audioContext.sampleRate / 2 }

    isListening.value = true
    startListening(minIndex, maxIndex, frequencyResolution, loggingCallback, signalCallback)
  }

  const shouldRequireDoubleConfirm = (profileKey: string) => profileKey === 'command' || profileKey === 'flicker'

  const shouldAcceptSignalNow = (flag: number, profileKey: string) => {
    if (!shouldRequireDoubleConfirm(profileKey) && profileKey !== 'off') {
      resetPendingConfirm()
      return true
    }

    const nowTs = Date.now()
    const cutoff = nowTs - SIGNAL_CONSTANTS.COMMAND_CONFIRM_WINDOW_MS
    confirmBuffer = confirmBuffer.filter((x) => x.timestamp >= cutoff)
    confirmBuffer.push({ profileKey, flag, timestamp: nowTs })

    const required = SIGNAL_CONSTANTS.COMMAND_CONFIRM_REQUIRED
    const matches = confirmBuffer.filter((x) => x.profileKey === profileKey && x.flag === flag)
    if (matches.length >= required) {
      resetPendingConfirm()
      return true
    }

    return false
  }

  const commitSignal = (
    flag: number,
    frequency: number,
    amplitude: number,
    profileKey: string,
    loggingCallback: AudioLoggingCallbacks | null = null,
    signalCallback: UltrasonicSignalCallback | null = null
  ) => {
    const lastTimestamp = lastSignal.value?.timestamp || 0
    const lastFlag = lastSignal.value?.flag
    const nowTs = Date.now()

    if (nowTs - lastTimestamp < SIGNAL_CONSTANTS.MIN_COMMIT_INTERVAL_MS) return
    if (lastFlag === flag && nowTs - lastTimestamp < SIGNAL_CONSTANTS.MIN_SAME_FLAG_REPEAT_MS) return
    if (!shouldAcceptSignalNow(flag, profileKey)) return

    signalHistory.push(flag)
    signalHistory = signalHistory.slice(-5)

    const roundedFreq = frequency | 0
    const roundedAmplitude = Math.round(amplitude)

    lastSignal.value = {
      flag,
      profileKey,
      frequency: roundedFreq,
      amplitude: roundedAmplitude,
      timestamp: nowTs
    }

    if (signalCallback) {
      const perfNow = getNowMs()
      const epochNow = Date.now()
      const authStartAt = payloadWindow.authStartAt || 0
      const authStartEpochMs =
        typeof authStartAt === 'number' && authStartAt > 0
          ? Math.round(epochNow - (perfNow - authStartAt))
          : 0

      signalCallback(flag, profileKey, {
        authStartAt,
        authStartEpochMs,
        receivedAt: perfNow
      })
    }

    if (isFirstSignal.value && loggingCallback) {
      loggingCallback.logFirstSoundSignal?.({
        frequency: roundedFreq,
        amplitude: roundedAmplitude,
        flag,
        profileKey
      })
      isFirstSignal.value = false
    }
  }

  const startListening = (
    minIdx: number,
    maxIdx: number,
    freqResolution: number,
    loggingCallback: AudioLoggingCallbacks | null = null,
    signalCallback: UltrasonicSignalCallback | null = null
  ) => {
    const detectFrequency = () => {
      if (!analyser || !dataArray) return

      if (pauseAnalysis.value) {
        animationId = requestAnimationFrame(detectFrequency)
        return
      }

      analyser.getByteFrequencyData(dataArray)
      frequencyData.value = new Uint8Array(dataArray)

      let maxValue = 0
      let maxValueIndex = 0
      let sum = 0

      for (let i = minIdx; i < maxIdx; i++) {
        const value = dataArray[i]!
        sum += value
        if (value > maxValue) {
          maxValue = value
          maxValueIndex = i
        }
      }

      const bandMean = (maxIdx - minIdx) > 0 ? sum / (maxIdx - minIdx) : 0
      const nowTimestamp = getNowMs()

      if (payloadWindow.isOpen && nowTimestamp > payloadWindow.deadline) {
        resetPayloadWindow()
      }

      if (maxValue === 0) {
        currentFrequency.value = 0
        animationId = requestAnimationFrame(detectFrequency)
        return
      }

      const frequency = maxValueIndex * freqResolution
      currentFrequency.value = frequency | 0

      if (!payloadWindow.isOpen) {
        processAuthWindow(frequency, maxValue, bandMean)

        if (authWindow.stage === 2 && nowTimestamp <= authWindow.authorizedUntil) {
          const preambleProfile = getPreambleProfile(frequency, maxValue, bandMean)
          if (preambleProfile) {
            openPayloadWindow(nowTimestamp, maxValue, frequency, preambleProfile.key, authWindow.authStartAt)
            resetAuthWindow()
          }
        }
      } else {
        const activeProfile = getProfileByKey(payloadWindow.profileKey)
        if (!activeProfile) {
          resetPayloadWindow()
          animationId = requestAnimationFrame(detectFrequency)
          return
        }

        const payloadHitProfile = getPayloadHit(frequency, activeProfile.key)

        if (
          payloadHitProfile &&
          isPayloadAmplitudeValid(maxValue, bandMean) &&
          isPeakStrongEnough(maxValue, bandMean)
        ) {
          if (!isFrequencyStable(frequency)) {
            resetPayloadWindow()
            animationId = requestAnimationFrame(detectFrequency)
            return
          }

          payloadWindow.samples.push({ frequency, amplitude: maxValue, profileKey: activeProfile.key })

          if (payloadWindow.samples.length >= SIGNAL_CONSTANTS.STABLE_SAMPLE_COUNT) {
            const flag = classifyFlagByRatio(activeProfile.key)
            if (flag !== null) {
              const avgFrequency = getAverageFromSamples((sample) => sample.frequency)
              const avgAmplitude = getAverageFromSamples((sample) => sample.amplitude)
              commitSignal(flag, avgFrequency, avgAmplitude, activeProfile.key, loggingCallback, signalCallback)
            }

            resetPayloadWindow()
          }
        }
      }

      animationId = requestAnimationFrame(detectFrequency)
    }

    detectFrequency()
  }

  const cleanup = () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }

    if (microphone) {
      microphone.disconnect()
      microphone = null
    }

    if (audioContext) {
      void audioContext.close()
      audioContext = null
    }

    signalHistory = []
    resetPayloadWindow()
    resetPendingConfirm()
    resetAuthWindow()
    isListening.value = false
  }

  return {
    isListening,
    hasPermission,
    currentFrequency,
    lastSignal,
    frequencyData,
    frequencyRange,
    pauseAnalysis,
    requestMicrophonePermission,
    setupWithExistingStream,
    cleanup
  }
}

