<template>
  <div class="page" @wheel.passive="handleScroll">
    <Transition name="fade-up" mode="out-in">
      <component :is="activeComponent" :key="activeViewId" v-bind="activeProps" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import HomeHero from '@/components/home/home-hero.vue'
import HomeNext from '@/components/home/home-next.vue'

const settingsStore = useSettingsStore()
const { delay } = await import('@/utils/delay')

const viewOrder = ['hero', 'next'] as const
type ViewId = (typeof viewOrder)[number]

const activeViewId = ref<ViewId>(viewOrder[0])
const heroPhase = ref(0)

let isAnimating = false

const handleScroll = (event: WheelEvent) => {
  if (Math.abs(event.deltaY) < 8) return
  void runScroll(event.deltaY > 0 ? 'down' : 'up')
}

const activeIndex = computed(() => {
  const idx = viewOrder.indexOf(activeViewId.value)
  return idx === -1 ? 0 : idx
})

const activeComponent = computed(() => {
  if (activeViewId.value === 'hero') return HomeHero
  return HomeNext
})

const activeProps = computed(() => {
  if (activeViewId.value === 'hero') return { phase: heroPhase.value }
  return {}
})

const runScroll = async (direction: 'down' | 'up') => {
  if (isAnimating) return
  isAnimating = true

  if (direction === 'down') {
    if (activeViewId.value === 'hero') {
      // Один скролл: заголовок -> пауза -> блок текста, потом переключаем view
      heroPhase.value = 1
      await delay(300)
      heroPhase.value = 2
      await delay(650)
      const nextIndex = Math.min(activeIndex.value + 1, viewOrder.length - 1)
      activeViewId.value = viewOrder[nextIndex]!
    }
  } else {
    if (activeIndex.value > 0) {
      // Возврат на предыдущий view: сбрасываем локальное состояние
      const prev = viewOrder[activeIndex.value - 1]!
      if (prev === 'hero') heroPhase.value = 0
      activeViewId.value = prev
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
