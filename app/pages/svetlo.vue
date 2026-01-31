<template>
  <div class="svetlo-view">
    <div
      class="svetlo-view__top-bar"
      :style="{ opacity: elementsOpacity, transition: 'opacity 0.3s ease' }"
    >
      <div class="svetlo-view__top-bar-left">
        <div class="svetlo-view__brand">
          <div
            v-if="isStarted && isListening"
            class="svetlo-view__brand-layer"
            :class="brandLayerClasses"
          />
          <span class="svetlo-view__brand-text">{{ t('svetlo.brand') }}</span>
        </div>
        <button
          v-if="displayDeviceId"
          type="button"
          class="svetlo-view__device-id"
          @click="copyDeviceId"
        >
          <div
            v-if="isStarted && isListening"
            class="svetlo-view__device-id-layer"
            :class="deviceIdLayerClasses"
          />
          <span class="svetlo-view__device-id-text">{{ t('svetlo.deviceIdPrefix') }} {{ displayDeviceId }}</span>
        </button>
      </div>
    </div>

    <!-- Круги-эффекты -->
    <div
      class="svetlo-view__ripples-layer"
      :style="{ opacity: elementsOpacity, transition: 'opacity 0.3s ease' }"
    >
      <div
        v-for="ripple in ripples"
        :key="ripple.id"
        class="svetlo-view__ripple"
        :style="{
          left: `${ripple.x}px`,
          top: `${ripple.y}px`,
          width: `${ripple.size}px`,
          height: `${ripple.size}px`
        }"
      />
    </div>

    <!-- Контейнер с квадратом и QR -->
    <div
      class="svetlo-view__container"
      :style="{ opacity: elementsOpacity, transition: 'opacity 0.3s ease' }"
    >
      <div
        v-if="isFlashlightSupported === false"
        class="svetlo-view__flashlight-warning"
      >
        {{ t('svetlo.flashlightNotSupportedNote') }}
      </div>

      <div
        ref="svetloSquareEl"
        class="svetlo-view__logo-square"
        :class="svetloSquareClasses"
        @click="handleSquareClick"
      >
        <div
          v-if="isStarted"
          class="svetlo-view__color-layer"
          :class="colorLayerClasses"
        />

        <div class="svetlo-view__logo-text">
          <template v-if="!isStarted">{{ t('svetlo.start') }}</template>
          <template v-else-if="isStarted && !isListening && !hadMicrophoneAccess">
            {{ t('svetlo.permissionsHint') }}
          </template>
          <template v-else-if="isStarted && !isListening && hadMicrophoneAccess && textMode === 0">
            GR<span class="svetlo-view__logo-letter-o svetlo-view__logo-letter-o--loading">O</span>MKA
          </template>
          <template v-else-if="textMode === 0">{{ t('svetlo.brand') }}</template>
          <template v-else-if="textMode === 1">
            {{ t('svetlo.modes.svetloLine1') }}<br>
            {{ t('svetlo.modes.svetloLine2') }}
          </template>
          <template v-else-if="textMode === 2">
            {{ t('svetlo.modes.cvetnoLine1') }}<br>
            {{ t('svetlo.modes.cvetnoLine2') }}
          </template>
        </div>
      </div>

      <div
        v-if="showQr"
        class="svetlo-view__qr"
        :class="{ 'svetlo-view__qr--collapsing': isCollapsing }"
      >
        <div class="svetlo-view__qr-placeholder">
          {{ t('svetlo.qrPlaceholder') }}
        </div>
      </div>
    </div>

    <!-- Визуализация частот -->
    <div
      v-if="isStarted && isListening"
      class="svetlo-view__spectrum svetlo-view__spectrum--entering"
      :style="{ opacity: elementsOpacity, transition: 'opacity 0.3s ease' }"
    >
      <FrequencySpectrum
        :frequency-data="frequencyData"
        :frequency-range="frequencyRange"
      />
    </div>

    <!-- Слой мерцания экрана (если фонарик не поддерживается) -->
    <div
      class="svetlo-view__screen-flicker"
      :class="screenFlickerClasses"
      :style="screenFlickerStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import FrequencySpectrum from '@/components/frequency-spectrum.vue'
import { useAudio } from '@/composables/use-audio'
import { useCamera } from '@/composables/use-camera'
import { useWakeLock } from '@/composables/use-wake-lock'
import { useLogging } from '@/composables/use-logging'
import { GROMKA_STORAGE_BASE_URL } from '@/constants/storage'

const { t } = useI18n()
const mainStore = useMainStore()
const { isLightOn } = storeToRefs(mainStore)

const isStarted = ref(false)
const isInitializing = ref(false)

let screenDelayTimeout: ReturnType<typeof setTimeout> | null = null
let slowFlickerTimeoutId: ReturnType<typeof setTimeout> | null = null
let moderateFlickerTimeoutId: ReturnType<typeof setTimeout> | null = null
let fastFlickerIntervalId: ReturnType<typeof setInterval> | null = null

const mode = ref<'idle' | 'slowFlicker' | 'moderateFlicker' | 'command' | 'fastFlicker'>('idle')

const SCREEN_DELAY_MS = 15
const SLOW_FLICKER_INTERVAL_MS = 800
const MODERATE_FLICKER_INTERVAL_MS = 500
const FAST_FLICKER_INTERVAL_MS = 80

let torchLoopActive = false
const desiredTorchOn = ref<boolean | null>(null)

const isPulsing = ref(false)
const isCollapsing = ref(false)
const showQr = ref(true)
const isFirstListening = ref(true)
const isFillingUp = ref(false)
const isTopBarFilling = ref(false)
const hadMicrophoneAccess = ref(false)
const textMode = ref(0)
const svetloSquareEl = ref<HTMLElement | null>(null)
const ripples = ref<Array<{ id: number; x: number; y: number; size: number }>>([])
let rippleIdCounter = 0

const startSound = ref<HTMLAudioElement | null>(null)

const {
  isListening,
  frequencyData,
  frequencyRange,
  requestMicrophonePermission,
  cleanup
} = useAudio()

const {
  cameraMethod,
  isFlashlightSupported,
  devices,
  turnOnFlashlight,
  turnOffFlashlight,
  checkFlashlightSupport,
  refreshDevices,
  cachedAudioStream,
  isFlashlightOn,
  callToTorchOnMs,
  callToTorchOffMs,
  lastTorchTransition
} = useCamera()

const { requestWakeLock, releaseWakeLock } = useWakeLock()

const {
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
} = useLogging()

const cameraLogCallbacks = {
  trackFlashlightChange,
  logCameraAttempt,
  logPlatformInfo
}

const shouldHideElements = ref(false)
const showScreenFlicker = ref(false)

const elementsOpacity = computed(() => {
  if (isFlashlightSupported.value === false && shouldHideElements.value) return 0
  return 1
})

const screenFlickerClasses = computed(() => ({
  'svetlo-view__screen-flicker--white': isLightOn.value,
  'svetlo-view__screen-flicker--black': !isLightOn.value
}))

const screenFlickerStyle = computed(() => ({
  opacity: showScreenFlicker.value ? 1 : 0
}))

const svetloSquareClasses = computed(() => {
  const classes: Record<string, boolean> = {}
  classes['svetlo-view__logo-square--black'] = true
  if (!isStarted.value) {
    classes['svetlo-view__logo-square--clickable'] = true
    return classes
  }
  if (isPulsing.value) classes['svetlo-view__logo-square--pulse'] = true
  return classes
})

const colorLayerClasses = computed(() => {
  const classes: Record<string, boolean> = {}

  if (isFillingUp.value) classes['svetlo-view__color-layer--entering'] = true
  else if (isStarted.value) classes['svetlo-view__color-layer--visible'] = true

  if (isLightOn.value === null) {
    classes['svetlo-view__color-layer--black'] = true
  } else {
    classes['svetlo-view__color-layer--pink'] = !!isLightOn.value
    classes['svetlo-view__color-layer--black'] = !isLightOn.value
  }

  return classes
})

const brandLayerClasses = computed(() => ({
  'svetlo-view__brand-layer--entering': isTopBarFilling.value,
  'svetlo-view__brand-layer--visible': !isTopBarFilling.value
}))

const deviceIdLayerClasses = computed(() => ({
  'svetlo-view__device-id-layer--entering': isTopBarFilling.value,
  'svetlo-view__device-id-layer--visible': !isTopBarFilling.value
}))

const displayDeviceId = computed(() => {
  if (!deviceId.value) return null
  return deviceId.value.replace(/^device_/, '')
})

const copyDeviceId = async () => {
  if (!deviceId.value) return
  try {
    await navigator.clipboard.writeText(deviceId.value)
  } catch {
    // ignore
  }
}

const stopAllFlickers = () => {
  if (slowFlickerTimeoutId) clearTimeout(slowFlickerTimeoutId)
  slowFlickerTimeoutId = null
  if (moderateFlickerTimeoutId) clearTimeout(moderateFlickerTimeoutId)
  moderateFlickerTimeoutId = null
  if (fastFlickerIntervalId) clearInterval(fastFlickerIntervalId)
  fastFlickerIntervalId = null
}

const applyScreenStateDelayed = (nextIsOn: boolean) => {
  if (screenDelayTimeout) clearTimeout(screenDelayTimeout)
  screenDelayTimeout = setTimeout(() => {
    mainStore.isLightOn = !!nextIsOn
    screenDelayTimeout = null
  }, SCREEN_DELAY_MS)
}

const requestTorchState = (nextIsOn: boolean) => {
  desiredTorchOn.value = !!nextIsOn
  if (torchLoopActive) return
  torchLoopActive = true

  const run = async () => {
    try {
      while (desiredTorchOn.value !== null && desiredTorchOn.value !== isFlashlightOn.value) {
        const target = desiredTorchOn.value

        if (isFlashlightSupported.value === false) {
          trackFlashlightChange(!!target, null)
          logCameraAttempt({ stage: 'flashlight_not_supported', requestedState: target })
          break
        }

        try {
          if (target) await turnOnFlashlight(cameraLogCallbacks)
          else await turnOffFlashlight(cameraLogCallbacks)
        } catch (error: any) {
          trackFlashlightChange(!!target, cameraMethod.value)
          logFlashlightSupport(false, cameraMethod.value, error)
          break
        }
      }
    } finally {
      torchLoopActive = false
    }
  }

  void run()
}

const handleStateChange = (nextIsOn: boolean, options: { shouldTrackSoundChange?: boolean; skipTorchRequest?: boolean } = {}) => {
  const { shouldTrackSoundChange = true, skipTorchRequest = false } = options

  if (isFlashlightSupported.value === false) {
    if (screenDelayTimeout) clearTimeout(screenDelayTimeout)
    screenDelayTimeout = null
    mainStore.isLightOn = !!nextIsOn
  } else {
    if (!nextIsOn) {
      if (screenDelayTimeout) clearTimeout(screenDelayTimeout)
      screenDelayTimeout = null
      mainStore.isLightOn = false
    } else {
      applyScreenStateDelayed(true)
    }
  }

  if (isStarted.value && !isInitializing.value && mode.value !== 'fastFlicker') {
    isPulsing.value = true
    createRipple()
    setTimeout(() => {
      isPulsing.value = false
    }, 200)
  }

  if (shouldTrackSoundChange) trackSoundChange(!!nextIsOn)
  if (!skipTorchRequest) requestTorchState(nextIsOn)
}

const handleUltrasonicSignal = async (flag: number, profileKey: string | null = null) => {
  if (!isStarted.value || isInitializing.value) return

  if (profileKey === 'off') {
    stopAllFlickers()
    mode.value = 'command'
    handleStateChange(false, { shouldTrackSoundChange: true })
    return
  }

  if (profileKey === 'command') {
    stopAllFlickers()
    mode.value = 'command'
    handleStateChange(flag === 1, { shouldTrackSoundChange: true })
    return
  }

  if (profileKey === 'beat') {
    if (flag !== 1) return
    stopAllFlickers()
    mode.value = 'slowFlicker'

    const start = () => {
      if (!isStarted.value || isInitializing.value) return
      if (mode.value !== 'slowFlicker') return
      const nextIsOn = !isLightOn.value
      handleStateChange(!!nextIsOn, { shouldTrackSoundChange: false })
      slowFlickerTimeoutId = setTimeout(start, SLOW_FLICKER_INTERVAL_MS)
    }

    start()
    return
  }

  if (profileKey === 'moderate') {
    if (flag !== 1) return
    stopAllFlickers()
    mode.value = 'moderateFlicker'

    const start = () => {
      if (!isStarted.value || isInitializing.value) return
      if (mode.value !== 'moderateFlicker') return
      const nextIsOn = !isLightOn.value
      handleStateChange(!!nextIsOn, { shouldTrackSoundChange: false })
      moderateFlickerTimeoutId = setTimeout(start, MODERATE_FLICKER_INTERVAL_MS)
    }

    start()
    return
  }

  if (profileKey === 'flicker') {
    if (flag !== 1) return
    stopAllFlickers()
    mode.value = 'fastFlicker'

    let phase = 0
    fastFlickerIntervalId = setInterval(() => {
      if (!isStarted.value || isInitializing.value) return
      if (mode.value !== 'fastFlicker') return
      const nextIsOn = phase % 2 === 0
      phase += 1
      handleStateChange(nextIsOn, { shouldTrackSoundChange: false })
    }, FAST_FLICKER_INTERVAL_MS)
  }
}

const audioLogCallbacks = {
  logMicrophonePermission,
  logAudioSettings,
  logFirstSoundSignal
}

watch(isListening, (newValue) => {
  if (newValue && isStarted.value) {
    hadMicrophoneAccess.value = true
    isCollapsing.value = true
    setTimeout(() => {
      showQr.value = false
    }, 650)

    if (isFirstListening.value) {
      isFirstListening.value = false
      isFillingUp.value = true
      isTopBarFilling.value = true
      mainStore.isLightOn = true
      void playStartSound()

      setTimeout(() => {
        isFillingUp.value = false
        isTopBarFilling.value = false
        shouldHideElements.value = true
        if (isFlashlightSupported.value === false) {
          setTimeout(() => {
            showScreenFlicker.value = true
          }, 500)
        }
      }, 650)
    } else {
      setTimeout(() => {
        shouldHideElements.value = true
        if (isFlashlightSupported.value === false) {
          setTimeout(() => {
            showScreenFlicker.value = true
          }, 500)
        }
      }, 1000)
    }
  }
})

const createRipple = () => {
  const rect = svetloSquareEl.value?.getBoundingClientRect?.()
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
  const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
  const size = rect ? Math.max(rect.width, rect.height) * 1.25 : 320
  const id = rippleIdCounter++
  ripples.value.push({ id, x, y, size })
  setTimeout(() => {
    const index = ripples.value.findIndex((item) => item.id === id)
    if (index >= 0) ripples.value.splice(index, 1)
  }, 300)
}

const handleSquareClick = async () => {
  createRipple()

  if (isStarted.value && isListening.value) {
    textMode.value = (textMode.value + 1) % 3
    return
  }

  if (!isStarted.value) {
    await handleStart()
  }
}

const playStartSound = async () => {
  if (!import.meta.client) return
  if (!startSound.value) return
  try {
    startSound.value.currentTime = 0
  } catch {
    // ignore
  }
  try {
    await startSound.value.play()
  } catch {
    // autoplay может быть заблокирован — ignore
  }
}

const handleStart = async () => {
  isStarted.value = true
  enableLogging()
  await requestWakeLock()

  isInitializing.value = true
  mainStore.isLightOn = false

  let hasFlashlight = false
  let audioStream: MediaStream | null = null

  if (isFlashlightSupported.value === null) {
    try {
      const result = await checkFlashlightSupport(cameraLogCallbacks, {
        includeAudio: true,
        runWarmup: true,
        warmupMode: 'background',
        warmupCycles: 3,
        warmupHoldOnMs: 1000,
        warmupLabelPrefix: 'calib'
      })
      hasFlashlight = result.supported
      audioStream = result.audioStream || null
      if (hasFlashlight) logFlashlightSupport(true, cameraMethod.value)
      else logFlashlightSupport(false, null)
    } catch (error: any) {
      logFlashlightSupport(false, null, error)
    }
  } else {
    hasFlashlight = !!isFlashlightSupported.value
    if (hasFlashlight) {
      try {
        const result = await turnOnFlashlight(cameraLogCallbacks, {
          includeAudio: true,
          runWarmup: true,
          warmupMode: 'background',
          warmupCycles: 3,
          warmupHoldOnMs: 1000,
          warmupLabelPrefix: 'calib'
        })
        audioStream = result.audioStream || null
      } catch {
        // ignore
      }
    }
  }

  if (!audioStream) audioStream = cachedAudioStream.value
  isInitializing.value = false

  await refreshDevices()
  const hasCameraInfo = logs.value.some(log => log.type === 'camera_info')
  if (!hasCameraInfo) {
    logCameraInfo(devices.value, cameraMethod.value)
  }

  await requestMicrophonePermission(audioLogCallbacks, handleUltrasonicSignal as any, audioStream)

  setTimeout(() => {
    if (logs.value.length > 0) void sendLogs()
  }, 3000)
}

onMounted(async () => {
  enableLogging()
  try {
    if (navigator.permissions?.query) {
      // @ts-expect-error - permissions types
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' })
      hadMicrophoneAccess.value = permissionStatus.state === 'granted'
    }
  } catch {
    hadMicrophoneAccess.value = false
  }

  // Предзагрузка звука старта (лежит там же, где и видео)
  try {
    const audio = new Audio(`${GROMKA_STORAGE_BASE_URL}sounds/start.mp3`)
    audio.preload = 'auto'
    audio.load()
    startSound.value = audio
  } catch {
    startSound.value = null
  }

  await logDeviceInfo()
})

onUnmounted(async () => {
  cleanup()

  try {
    await turnOffFlashlight()
  } catch {
    // ignore
  }

  await releaseWakeLock()

  if (startSound.value) {
    try {
      startSound.value.pause()
    } catch {
      // ignore
    }
    startSound.value = null
  }

  if (screenDelayTimeout) clearTimeout(screenDelayTimeout)
  screenDelayTimeout = null

  stopAllFlickers()
})
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.svetlo-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: $color-white-light;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.svetlo-view__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 1300;
}

.svetlo-view__flashlight-warning {
  width: min(45.2vw, 33.9rem);
  color: $color-primary;
  font-size: 1.5rem;
  font-weight: $font-weight-regular;
  text-align: center;
}

.svetlo-view__ripples-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1200;
}

.svetlo-view__ripple {
  position: absolute;
  transform: translate(-50%, -50%) scale(0.65);
  border-radius: 999px;
  background: radial-gradient(
    circle,
    rgba($color-primary, 0.95) 0%,
    rgba($color-primary, 0.55) 28%,
    rgba($color-primary, 0.17) 55%,
    rgba($color-primary, 0) 78%
  );
  filter: blur(14px) saturate(1.35);
  opacity: 1;
  mix-blend-mode: screen;
  animation: ripple-expand 0.3s ease-out forwards;
}

.svetlo-view__top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1400;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 1.2rem 1.2rem;
  pointer-events: none;
}

.svetlo-view__top-bar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  pointer-events: auto;
}

.svetlo-view__brand {
  position: relative;
  font-size: 1.4rem;
  font-weight: $font-weight-extra-bold;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba($color-white-light, 0.92);
  background: rgba($color-black, 0.35);
  border-radius: 999px;
  padding: 0.6rem 1rem;
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.svetlo-view__brand-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  transform: translateY(-100%);
  background: $color-primary;
  backdrop-filter: blur(10px);

  &--entering {
    animation: top-bar-layer-slide-down 0.65s ease-in forwards;
  }

  &--visible {
    transform: translateY(0);
  }
}

.svetlo-view__brand-text {
  position: relative;
  z-index: 1;
}

.svetlo-view__device-id {
  position: relative;
  background: rgba($color-black, 0.35);
  color: rgba($color-white-light, 0.92);
  font-family: $font-default;
  font-size: 1.2rem;
  font-weight: $font-weight-semi-bold;
  border-radius: 999px;
  padding: 0.6rem 1rem;
  cursor: pointer;
  user-select: none;
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.svetlo-view__device-id-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  transform: translateY(-100%);
  background: $color-primary;
  backdrop-filter: blur(10px);

  &--entering {
    animation: top-bar-layer-slide-down 0.65s ease-in forwards;
  }

  &--visible {
    transform: translateY(0);
  }
}

.svetlo-view__device-id-text {
  position: relative;
  z-index: 1;
}

.svetlo-view__logo-square {
  width: min(45.2vw, 33.9rem);
  height: min(45.2vw, 33.9rem);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.8rem;
  position: relative;
  overflow: hidden;

  &--black {
    background: $color-black;
  }

  &--clickable {
    cursor: pointer;
  }

  &--pulse {
    animation: square-pulse 0.2s ease-out;
  }
}

.svetlo-view__color-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  transform: translateY(100%);
  transition: background-color 0.1s ease;

  &--entering {
    animation: color-layer-slide-up 0.65s ease-in forwards;
  }

  &--visible {
    transform: translateY(0);
  }

  &--pink {
    background: $color-primary;
  }

  &--black {
    background: $color-black;
  }
}

.svetlo-view__qr {
  width: min(45.2vw, 33.9rem);
  height: min(45.2vw, 33.9rem);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &--collapsing {
    animation: qr-collapse 0.65s ease-in forwards;
  }
}

.svetlo-view__qr-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.8rem;
  background: rgba($color-black, 0.12);
  color: rgba($color-black, 0.8);
  font-family: $font-default;
  font-weight: $font-weight-medium;
  font-size: 1.2rem;
  text-align: center;
  padding: 1.2rem;
}

.svetlo-view__spectrum {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(90vw, 60rem);
  height: 12rem;
  z-index: 1300;
  pointer-events: none;

  &--entering {
    animation: spectrum-slide-up 0.65s ease-in;
  }
}

.svetlo-view__logo-text {
  font-size: clamp(2.4rem, 8vw, 6rem);
  font-weight: $font-weight-extra-bold;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $color-white-light;
  text-align: center;
  position: relative;
  z-index: 1;
}

.svetlo-view__logo-letter-o {
  display: inline-block;

  &--loading {
    animation: letter-o-spin 1s ease-in-out infinite;
  }
}

.svetlo-view__screen-flicker {
  position: fixed;
  inset: 0;
  z-index: 1500;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.35s ease, background-color 0.1s ease;
  will-change: opacity, background-color;

  &--white {
    background: $color-white-light;
  }

  &--black {
    background: $color-black;
  }
}

@keyframes square-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes color-layer-slide-up {
  0% { transform: translateY(100%); }
  100% { transform: translateY(0); }
}

@keyframes top-bar-layer-slide-down {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(0); }
}

@keyframes qr-collapse {
  0% {
    width: min(45.2vw, 33.9rem);
    height: min(45.2vw, 33.9rem);
    opacity: 1;
  }
  100% {
    width: 0;
    height: 0;
    opacity: 0;
  }
}

@keyframes qr-collapse-mobile {
  0% {
    width: min(67.8vw, 28.25rem);
    height: min(67.8vw, 28.25rem);
    opacity: 1;
  }
  100% {
    width: 0;
    height: 0;
    opacity: 0;
  }
}

@keyframes spectrum-slide-up {
  0% {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

@keyframes ripple-expand {
  0% { transform: translate(-50%, -50%) scale(0.65); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(5); opacity: 0; }
}

@keyframes letter-o-spin {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@include layout-aspect-mobile {
  .svetlo-view__top-bar {
    padding: 1rem 1rem;
    gap: 0.8rem;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .svetlo-view__brand {
    font-size: 1.2rem;
    padding: 0.55rem 0.9rem;
  }

  .svetlo-view__device-id {
    font-size: 1.1rem;
    padding: 0.55rem 0.9rem;
  }

  .svetlo-view__flashlight-warning {
    width: min(67.8vw, 28.25rem);
    font-size: 1.5rem;
  }

  .svetlo-view__logo-square {
    width: min(67.8vw, 28.25rem);
    height: min(67.8vw, 28.25rem);
  }

  .svetlo-view__qr {
    width: min(67.8vw, 28.25rem);
    height: min(67.8vw, 28.25rem);

    &--collapsing {
      animation: qr-collapse-mobile 0.65s ease-in forwards;
    }
  }

  .svetlo-view__spectrum {
    width: min(95vw, 50rem);
    height: 10rem;
    bottom: 1rem;
  }
}
</style>

