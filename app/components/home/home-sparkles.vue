<template>
  <div class="home-sparkles" :class="sparklesClasses" aria-hidden="true">
    <SparkleEffect
      :mode="sparkleMode"
      :radius-rem="11"
      :start-delay-ms="startDelayMs"
      :transition-ms="650"
      :cursor-idle-delay-ms="500"
      :cursor-idle-fade-ms="250"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  activeViewId: string
}>()

const settingsStore = useSettingsStore()
const sparkleMode = computed(() => (props.activeViewId === 'hero' ? 'random' : 'cursor'))
const startDelayMs = computed(() => (settingsStore.isDarkTheme ? 0 : 2000))

const sparklesClasses = computed(() => ({
  'home-sparkles--visible': settingsStore.isDarkTheme
}))
</script>

<style lang="scss" scoped>
.home-sparkles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0; // ниже слоя слайдов
  opacity: 0;
  transition: opacity 0.5s ease;

  &--visible {
    opacity: 1;
  }
}
</style>

