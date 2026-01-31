import { ref } from 'vue'
import type { Ref } from 'vue'

type LogEntry = {
  timestamp: number
  type: string
  data: any
}

const STORAGE_KEY = 'gromka.deviceId'

const generateId = (): string => {
  const rand = Math.random().toString(36).slice(2, 10)
  const t = Date.now().toString(36).slice(-6)
  return `device_${rand}${t}`
}

/**
 * Упрощённое логирование для страницы `/svetlo`.
 * В этом проекте нет серверного эндпойнта для логов → `sendLogs()` это no-op.
 */
export function useLogging() {
  const deviceId: Ref<string | null> = ref(null)
  const logs: Ref<LogEntry[]> = ref([])
  const soundChangeCount = ref(0)
  const lastSoundState: Ref<boolean | null> = ref(null)
  const isLoggingEnabled = ref(false)

  const ensureDeviceId = () => {
    if (!import.meta.client) return null
    if (deviceId.value) return deviceId.value

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        deviceId.value = stored
        return deviceId.value
      }
      const next = generateId()
      window.localStorage.setItem(STORAGE_KEY, next)
      deviceId.value = next
      return deviceId.value
    } catch {
      deviceId.value = generateId()
      return deviceId.value
    }
  }

  const addLog = (type: string, data: any) => {
    if (!import.meta.client) return
    if (!isLoggingEnabled.value) return
    logs.value.push({ timestamp: Date.now(), type, data })
  }

  const enableLogging = () => {
    if (!import.meta.client) return
    if (isLoggingEnabled.value) return
    ensureDeviceId()
    isLoggingEnabled.value = true
  }

  const sendLogs = async () => {
    // no-op: нет эндпойнта в текущем проекте
  }

  const logMicrophonePermission = (success: boolean, error: any = null, source: string | null = null) => {
    addLog('microphone_permission', { success, error: error?.message ?? null, source })
  }

  const logAudioSettings = (audioSettings: any) => {
    addLog('audio_settings', audioSettings)
  }

  const logFirstSoundSignal = (signalData: any) => {
    addLog('first_sound_signal', signalData)
  }

  const trackSoundChange = (newSoundState: boolean) => {
    const prev = lastSoundState.value
    soundChangeCount.value += 1
    lastSoundState.value = newSoundState
    addLog('sound_change', { state: newSoundState, previousState: prev, changeCount: soundChangeCount.value })
  }

  const trackFlashlightChange = (isOn: boolean, method: string | null = null) => {
    addLog('flashlight_change', { isOn, method })
  }

  const logCameraInfo = (cameras: any[], selectedMethod: any) => {
    addLog('camera_info', { cameras, selectedMethod })
  }

  const logFlashlightSupport = (isSupported: boolean, method: string | null = null, error: any = null) => {
    addLog('flashlight_support', { isSupported, method, error: error?.message ?? null })
  }

  const logCameraAttempt = (data: any) => {
    addLog('camera_attempt', data)
  }

  const logPlatformInfo = (data: any) => {
    addLog('platform_info', data)
  }

  const logDeviceInfo = async () => {
    if (!import.meta.client) return
    addLog('device_info', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: window.screen?.width ?? null,
      screenHeight: window.screen?.height ?? null,
      devicePixelRatio: window.devicePixelRatio ?? 1
    })
  }

  return {
    deviceId,
    sendLogs,
    enableLogging,
    logMicrophonePermission,
    logAudioSettings,
    logFirstSoundSignal,
    trackSoundChange,
    trackFlashlightChange,
    logCameraInfo,
    logFlashlightSupport,
    logCameraAttempt,
    logPlatformInfo,
    logDeviceInfo,
    logs
  }
}

