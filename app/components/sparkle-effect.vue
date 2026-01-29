<template>
  <div class="sparkle-effect">
    <div
      v-for="sparkle in sparkles"
      :key="sparkle.id"
      class="sparkle-effect__item"
      :style="sparkle.style"
    >
      ✦
    </div>
  </div>
</template>

<script setup lang="ts">
type SparkleMode = 'random' | 'cursor'

interface Sparkle {
  id: number
  style: {
    left: string
    top: string
    fontSize: string
    animationDelay: string
    animationDuration: string
  }
}

const props = defineProps<{
  mode?: SparkleMode
  // задержка старта (мс)
  startDelayMs?: number
  // радиус “фонарика” в rem (только для mode="cursor")
  radiusRem?: number
  // длительность плавного перехода между режимами (мс)
  transitionMs?: number
  // через сколько мс без движения “фонарик” начинает затухать (cursor)
  cursorIdleDelayMs?: number
  // длительность затухания “фонарика” (cursor)
  cursorIdleFadeMs?: number
}>()

const mode = computed<SparkleMode>(() => props.mode ?? 'random')
const startDelayMs = computed(() => props.startDelayMs ?? 2000)
const radiusRem = computed(() => props.radiusRem ?? 11)
const transitionMs = computed(() => props.transitionMs ?? 650)
const cursorIdleDelayMs = computed(() => props.cursorIdleDelayMs ?? 1500)
const cursorIdleFadeMs = computed(() => props.cursorIdleFadeMs ?? 550)

const sparkles = ref<Sparkle[]>([])
let sparkleId = 0
let startDelayTimeoutId: number | null = null
let loopTimeoutId: number | null = null
let isStopped = false

const mouse = ref<{ x: number; y: number } | null>(null)
const hasFinePointer = ref(false)
const lastMouseMoveAtMs = ref<number | null>(null)

const modeBlend = ref(0) // 0 = random, 1 = cursor
let blendRafId: number | null = null

const getRootRemPx = () => {
  const size = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  return Number.isFinite(size) && size > 0 ? size : 18
}

const randomInCircle = (radiusPx: number) => {
  // равномерно по площади круга
  const a = Math.random() * Math.PI * 2
  const r = Math.sqrt(Math.random()) * radiusPx
  return { dx: Math.cos(a) * r, dy: Math.sin(a) * r }
}

const easeInOut = (t: number) => {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

const getCursorCenter = () => ({
  x: window.innerWidth / 2,
  y: window.innerHeight / 2
})

const getCursorIdleFactor = () => {
  // 1 -> активно, 0 -> полностью погашено
  if (cursorIdleFadeMs.value <= 0) return 0
  const last = lastMouseMoveAtMs.value
  if (last === null) return 0

  const dt = performance.now() - last
  if (dt <= cursorIdleDelayMs.value) return 1

  const t = (dt - cursorIdleDelayMs.value) / cursorIdleFadeMs.value
  return 1 - easeInOut(t)
}

const createSparkle = (position?: { xPx: number; yPx: number }) => {
  const newSparkle: Sparkle = {
    id: sparkleId++,
    style: {
      left: position ? `${position.xPx}px` : `${Math.random() * 100}%`,
      top: position ? `${position.yPx}px` : `${Math.random() * 100}%`,
      fontSize: `${Math.random() * 2 + 0.5}rem`, // от 0.5rem до 2.5rem
      animationDelay: '0s',
      animationDuration: `${Math.random() * 0.3 + 0.4}s` // от 0.4s до 0.7s
    }
  }
  
  sparkles.value.push(newSparkle)
  
  // Удаляем вспышку после анимации
  setTimeout(() => {
    sparkles.value = sparkles.value.filter(s => s.id !== newSparkle.id)
  }, 800)
}

const spawnCount = (count: number, spawn: () => void) => {
  const n = Math.floor(count)
  const frac = count - n
  for (let i = 0; i < n; i += 1) spawn()
  if (Math.random() < frac) spawn()
}

const startSparklesLoop = () => {
  const tick = () => {
    if (isStopped) return

    const blend = modeBlend.value
    const randomIntensity = 1 - blend
    const cursorIdleFactor = getCursorIdleFactor()
    const cursorIntensity = blend * cursorIdleFactor

    // базовая “плотность” как раньше (3 звезды за тик)
    spawnCount(3 * randomIntensity, () => createSparkle())

    if (cursorIntensity > 0.001) {
      // Если курсор ещё не двигался, но есть fine-pointer — берём центр экрана,
      // иначе (мобилки/тач) просто не рисуем “фонарик”
      const m = mouse.value ?? (hasFinePointer.value ? getCursorCenter() : null)
      if (m) {
        const radiusPx = radiusRem.value * getRootRemPx()
        // В режиме мыши — ещё более редкие звёзды
        spawnCount(0.75 * cursorIntensity, () => {
          const { dx, dy } = randomInCircle(radiusPx)
          createSparkle({ xPx: m.x + dx, yPx: m.y + dy })
        })
      }
    }

    const nextInterval = Math.random() * 67 + 33 // 33-100ms
    loopTimeoutId = window.setTimeout(tick, nextInterval)
  }

  tick()
}

const handlePointerMove = (event: PointerEvent) => {
  if (event.pointerType !== 'mouse') return
  mouse.value = { x: event.clientX, y: event.clientY }
  lastMouseMoveAtMs.value = performance.now()
}

const handleTouchMove = (event: TouchEvent) => {
  const touch = event.touches[0] ?? event.changedTouches[0]
  if (!touch) return
  mouse.value = { x: touch.clientX, y: touch.clientY }
  lastMouseMoveAtMs.value = performance.now()
}

const animateBlendTo = (target: number) => {
  if (blendRafId) window.cancelAnimationFrame(blendRafId)

  const from = modeBlend.value
  const to = target
  const startedAt = performance.now()
  const dur = Math.max(0, transitionMs.value)

  if (dur === 0) {
    modeBlend.value = to
    return
  }

  const step = (now: number) => {
    if (isStopped) return
    const t = (now - startedAt) / dur
    const k = easeInOut(t)
    modeBlend.value = from + (to - from) * k
    if (t < 1) blendRafId = window.requestAnimationFrame(step)
  }

  blendRafId = window.requestAnimationFrame(step)
}

onMounted(() => {
  hasFinePointer.value = window.matchMedia?.('(pointer: fine)').matches ?? false
  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('touchstart', handleTouchMove, { passive: true })
  window.addEventListener('touchmove', handleTouchMove, { passive: true })

  // Запускаем вспышки с задержкой (обычно когда фон станет чёрным)
  modeBlend.value = mode.value === 'cursor' ? 1 : 0
  startDelayTimeoutId = window.setTimeout(() => {
    startSparklesLoop()
  }, startDelayMs.value)
})

watch(mode, (nextMode) => {
  // Плавно затухаем из random и “входим” в cursor (и наоборот)
  animateBlendTo(nextMode === 'cursor' ? 1 : 0)
}, { immediate: false })

onUnmounted(() => {
  isStopped = true
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('touchstart', handleTouchMove)
  window.removeEventListener('touchmove', handleTouchMove)
  if (startDelayTimeoutId) window.clearTimeout(startDelayTimeoutId)
  if (loopTimeoutId) window.clearTimeout(loopTimeoutId)
  if (blendRafId) window.cancelAnimationFrame(blendRafId)
})
</script>

<style lang="scss" scoped>
.sparkle-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  
  &__item {
    position: absolute;
    color: rgba(255, 255, 255, 0.9);
    animation: sparkle-flash forwards;
    transform: translate(-50%, -50%);
  }
}

@keyframes sparkle-flash {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
}
</style>
