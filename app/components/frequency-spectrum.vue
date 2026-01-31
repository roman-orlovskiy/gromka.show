<template>
  <div class="frequency-spectrum" :class="frequencySpectrumClasses">
    <canvas
      ref="canvasRef"
      class="frequency-spectrum__canvas"
    />
    <div class="frequency-spectrum__labels">
      <div class="frequency-spectrum__label frequency-spectrum__label--min">
        {{ minLabel }}
      </div>
      <div class="frequency-spectrum__label frequency-spectrum__label--max">
        {{ maxLabel }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps<{
  mod?: string | null
  frequencyData?: Uint8Array | null
  frequencyRange?: { min: number; max: number }
}>()

const { t } = useI18n()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationFrameId: number | null = null

const frequencySpectrumClasses = computed(() => {
  const classes: Record<string, boolean> = {}
  if (props.mod) classes[`frequency-spectrum--${props.mod}`] = true
  return classes
})

const minLabel = computed(() => {
  const range = props.frequencyRange || { min: 0, max: 0 }
  return `${range.min / 1000} ${t('svetlo.units.khz')}`
})

const maxLabel = computed(() => {
  const range = props.frequencyRange || { min: 0, max: 0 }
  return `${range.max / 1000} ${t('svetlo.units.khz')}`
})

const drawSpectrum = () => {
  const data = props.frequencyData
  if (!canvasRef.value || !data || data.length === 0) {
    animationFrameId = requestAnimationFrame(drawSpectrum)
    return
  }

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    animationFrameId = requestAnimationFrame(drawSpectrum)
    return
  }

  const container = canvas.parentElement
  if (!container) {
    animationFrameId = requestAnimationFrame(drawSpectrum)
    return
  }

  const rect = container.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  if (width === 0 || height === 0) {
    animationFrameId = requestAnimationFrame(drawSpectrum)
    return
  }

  // очищаем с лёгкой "инерцией"
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fillRect(0, 0, width, height)

  // сетка
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = 1

  for (let i = 0; i <= 4; i++) {
    const y = (height / 4) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  for (let i = 0; i <= 4; i++) {
    const x = (width / 4) * i
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  const barWidth = width / data.length

  const gradient = ctx.createLinearGradient(0, height, 0, 0)
  let accentColor = getComputedStyle(container).getPropertyValue('--frequency-spectrum-accent').trim()
  if (!accentColor) accentColor = '#FF00B6'

  gradient.addColorStop(0, accentColor)
  gradient.addColorStop(0.5, '#61AEDE')
  gradient.addColorStop(1, '#00FF00')

  ctx.fillStyle = gradient

  for (let i = 0; i < data.length; i++) {
    const barHeight = (data[i]! / 255) * height * 0.85
    const x = (i / data.length) * width
    if (barHeight > 0) {
      ctx.fillRect(x, height - barHeight, Math.max(1, barWidth), barHeight)
    }
  }

  animationFrameId = requestAnimationFrame(drawSpectrum)
}

const resizeCanvas = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const container = canvas.parentElement
  if (!container) return

  const dpr = window.devicePixelRatio || 1
  const rect = container.getBoundingClientRect()

  if (rect.width === 0 || rect.height === 0) {
    requestAnimationFrame(resizeCanvas)
    return
  }

  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr

  const ctx = canvas.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)

  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`
}

watch(() => props.frequencyData, () => {
  // данные перерисовываются в цикле drawSpectrum
}, { deep: true })

onMounted(() => {
  resizeCanvas()
  drawSpectrum()
  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.frequency-spectrum {
  --frequency-spectrum-accent: #{$color-primary};
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba($color-black, 0.3);
  border-radius: 0.8rem;
  overflow: hidden;
}

.frequency-spectrum__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.frequency-spectrum__labels {
  position: absolute;
  bottom: 0.8rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  pointer-events: none;
}

.frequency-spectrum__label {
  font-size: 1rem;
  font-weight: $font-weight-semi-bold;
  color: rgba($color-white-light, 0.7);
  font-family: $font-default;
}
</style>

