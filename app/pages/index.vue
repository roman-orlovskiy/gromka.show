<template>
  <div class="page" @wheel.passive="handleScroll">
    <Transition
      :name="viewTransitionName"
      mode="out-in"
      @after-enter="handleAfterEnter"
    >
      <component :is="activeComponent" :key="activeViewId" v-bind="activeProps" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import HomeHero from '@/components/home/home-hero.vue'
import HomeAbout from '@/components/home/home-about.vue'
import { delay } from '@/utils/delay'

const mainStore = useMainStore()
const animationsStore = useAnimationsStore()

const viewOrder = ['hero', 'about'] as const
type ViewId = (typeof viewOrder)[number]

const activeViewId = ref<ViewId>(viewOrder[0])
const heroPhase = ref(0)

// Синхронизация activeViewId со стором для хедера
watch(activeViewId, (newViewId) => {
  mainStore.setActiveViewId(newViewId)
}, { immediate: true })

let isAnimating = false
const lastNavDirection = ref<'down' | 'up'>('down')
const pendingEnterViewId = ref<ViewId | null>(null)

const handleScroll = (event: WheelEvent) => {
  if (Math.abs(event.deltaY) < 8) return
  const direction: 'down' | 'up' = event.deltaY > 0 ? 'down' : 'up'
  lastNavDirection.value = direction
  void runScroll(direction)
}

const activeIndex = computed(() => {
  const idx = viewOrder.indexOf(activeViewId.value)
  return idx === -1 ? 0 : idx
})

const viewTransitionName = computed(() => (lastNavDirection.value === 'down' ? 'view-up' : 'view-down'))

const activeComponent = computed(() => {
  if (activeViewId.value === 'hero') return HomeHero
  return HomeAbout
})

const activeProps = computed(() => {
  if (activeViewId.value === 'hero') {
    return {
      phase: heroPhase.value,
      onNext: () => { void runScroll('down') }
    }
  }
  return {}
})

type TimelineStep = {
  phase: number
  delayAfterMs: number
  actions?: ReadonlyArray<{
    channel: string
    value: number
  }>
}

type ViewConfig = {
  id: ViewId
  timeline?: {
    phase: Ref<number>
    steps: ReadonlyArray<TimelineStep>
  }
}

const views: ViewConfig[] = [
  {
    id: 'hero',
    timeline: {
      phase: heroPhase,
      // 0: всё видно
      // 1: прячем title
      // 2: прячем text-block
      // 3: прячем button (fade)
      steps: [
        // header.hero:
        // 0 — свитчер по центру (логотип скрыт)
        // 1 — свитчер справа, логотип слева
        { phase: 0, delayAfterMs: 0, actions: [{ channel: 'header.hero', value: 0 }] },
        // В тот же момент, когда начинается первая анимация hero (phase=1), запускаем и анимацию хедера.
        { phase: 1, delayAfterMs: 250, actions: [{ channel: 'header.hero', value: 1 }] },
        { phase: 2, delayAfterMs: 400 },
        { phase: 3, delayAfterMs: 200 }
      ]
    }
  },
  { id: 'about' }
]

const getView = (id: ViewId) => views.find(v => v.id === id)

const playTimeline = async (
  timeline: NonNullable<ViewConfig['timeline']>,
  direction: 'forward' | 'reverse'
) => {
  const steps = direction === 'forward' ? [...timeline.steps] : [...timeline.steps].reverse()

  // первый шаг — это базовое состояние, проигрываем со второго
  for (const step of steps.slice(1)) {
    timeline.phase.value = step.phase
    if (step.actions) {
      for (const action of step.actions) {
        animationsStore.setChannel(action.channel, action.value)
      }
    }
    if (step.delayAfterMs > 0) {
      await delay(step.delayAfterMs)
    }
  }
}

const prepareEnter = (viewId: ViewId) => {
  const view = getView(viewId)
  const timeline = view?.timeline
  if (!timeline) return
  const last = timeline.steps[timeline.steps.length - 1]
  if (last) timeline.phase.value = last.phase
}

const playExit = async (viewId: ViewId) => {
  const timeline = getView(viewId)?.timeline
  if (!timeline) return
  await playTimeline(timeline, 'forward')
}

const playEnter = async (viewId: ViewId) => {
  const timeline = getView(viewId)?.timeline
  if (!timeline) return
  // enter = exit в обратном порядке (через reverse массива)
  await playTimeline(timeline, 'reverse')
}

const runScroll = async (direction: 'down' | 'up') => {
  if (isAnimating) return
  isAnimating = true

  let willChangeView = false

  if (direction === 'down') {
    // уход с текущего слайда (если есть внутренние анимации)
    await playExit(activeViewId.value)

    const nextIndex = Math.min(activeIndex.value + 1, viewOrder.length - 1)
    const next = viewOrder[nextIndex]!
    if (next !== activeViewId.value) {
      pendingEnterViewId.value = next
      activeViewId.value = next
      willChangeView = true
    }
  } else {
    if (activeIndex.value > 0) {
      const prev = viewOrder[activeIndex.value - 1]!
      // Подготавливаем "скрытое" состояние ДО монтирования (важно при mode="out-in")
      prepareEnter(prev)
      pendingEnterViewId.value = prev
      activeViewId.value = prev
      willChangeView = true
    }
  }

  // Если слайд не меняется (уже на краю), `@after-enter` не сработает,
  // поэтому сбрасываем флаг сразу.
  if (!willChangeView) {
    isAnimating = false
  }

  // Иначе `isAnimating` снимаем в `handleAfterEnter`,
  // чтобы enter-анимации точно отыгрывали после монтирования.
}

const handleAfterEnter = async () => {
  if (pendingEnterViewId.value && pendingEnterViewId.value === activeViewId.value) {
    const viewId = pendingEnterViewId.value
    pendingEnterViewId.value = null
    await playEnter(viewId)
  }

  await delay(208)
  isAnimating = false
}

// Фон/тема переключаются глобально в `app/app.vue`
</script>
<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.page {
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
}
</style>
