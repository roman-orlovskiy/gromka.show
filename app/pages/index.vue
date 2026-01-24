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
import HomeNext from '@/components/home/home-next.vue'
import { delay } from '@/utils/delay'

const settingsStore = useSettingsStore()

const viewOrder = ['hero', 'next'] as const
type ViewId = (typeof viewOrder)[number]

const activeViewId = ref<ViewId>(viewOrder[0])
const heroPhase = ref(0)

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
  return HomeNext
})

const activeProps = computed(() => {
  if (activeViewId.value === 'hero') return { phase: heroPhase.value }
  return {}
})

type PhaseTimeline = ReadonlyArray<number>

type ViewConfig = {
  id: ViewId
  timeline?: {
    phase: Ref<number>
    sequence: PhaseTimeline
    stepDelayMs: number
    afterLastStepMs: number
  }
}

const views: ViewConfig[] = [
  {
    id: 'hero',
    timeline: {
      phase: heroPhase,
      sequence: [0, 1, 2],
      stepDelayMs: 300,
      afterLastStepMs: 650
    }
  },
  { id: 'next' }
]

const getView = (id: ViewId) => views.find(v => v.id === id)

const playTimeline = async (timeline: NonNullable<ViewConfig['timeline']>, direction: 'forward' | 'reverse') => {
  const sequence = direction === 'forward' ? [...timeline.sequence] : [...timeline.sequence].reverse()
  const steps = sequence.slice(1)

  for (const step of steps) {
    timeline.phase.value = step
    if (step !== steps[steps.length - 1]) {
      await delay(timeline.stepDelayMs)
    }
  }

  await delay(timeline.afterLastStepMs)
}

const prepareEnter = (viewId: ViewId) => {
  const view = getView(viewId)
  const timeline = view?.timeline
  if (!timeline) return
  const last = timeline.sequence[timeline.sequence.length - 1]
  if (typeof last === 'number') timeline.phase.value = last
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

  if (direction === 'down') {
    // уход с текущего слайда (если есть внутренние анимации)
    await playExit(activeViewId.value)

    const nextIndex = Math.min(activeIndex.value + 1, viewOrder.length - 1)
    const next = viewOrder[nextIndex]!
    if (next !== activeViewId.value) {
      pendingEnterViewId.value = next
      activeViewId.value = next
    }
  } else {
    if (activeIndex.value > 0) {
      const prev = viewOrder[activeIndex.value - 1]!
      // Подготавливаем "скрытое" состояние ДО монтирования (важно при mode="out-in")
      prepareEnter(prev)
      pendingEnterViewId.value = prev
      activeViewId.value = prev
    }
  }

  // `isAnimating` снимаем в `handleAfterEnter`,
  // чтобы enter-анимации точно отыгрывали после монтирования.
}

const handleAfterEnter = async () => {
  if (pendingEnterViewId.value && pendingEnterViewId.value === activeViewId.value) {
    const viewId = pendingEnterViewId.value
    pendingEnterViewId.value = null
    await playEnter(viewId)
  }

  await delay(250)
  isAnimating = false
}

onMounted(() => {
  setTimeout(() => {
    settingsStore.setDarkTheme(true)
  }, 2000)
})
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
