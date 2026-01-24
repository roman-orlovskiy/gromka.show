<template>
  <div class="page" @wheel.passive="handleScroll">
    <Transition :name="viewTransitionName" mode="out-in">
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

const heroPhaseSequence = [0, 1, 2] as const
const heroPhaseStepDelayMs = 300
const heroAfterLastStepMs = 650

const animateHero = async (direction: 'down' | 'up') => {
  // Вниз: 0 -> 1 -> 2 (уход)
  // Вверх: 2 -> 1 -> 0 (приход)
  const sequence = direction === 'down' ? [...heroPhaseSequence] : [...heroPhaseSequence].reverse()
  const steps = sequence.slice(1)

  for (const step of steps) {
    heroPhase.value = step
    if (step !== steps[steps.length - 1]) {
      await delay(heroPhaseStepDelayMs)
    }
  }

  // даём последней анимации доиграть
  await delay(heroAfterLastStepMs)
}

const runScroll = async (direction: 'down' | 'up') => {
  if (isAnimating) return
  isAnimating = true

  if (direction === 'down') {
    if (activeViewId.value === 'hero') {
      await animateHero('down')
      const nextIndex = Math.min(activeIndex.value + 1, viewOrder.length - 1)
      activeViewId.value = viewOrder[nextIndex]!
    }
  } else {
    if (activeIndex.value > 0) {
      // Возврат на предыдущий view: сбрасываем локальное состояние
      const prev = viewOrder[activeIndex.value - 1]!
      activeViewId.value = prev
      if (prev === 'hero') {
        // Приход: стартуем "спрятанным" и проигрываем в обратном порядке
        heroPhase.value = 2
        await delay(0)
        await animateHero('up')
      }
    }
  }

  // небольшой антидребезг
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
