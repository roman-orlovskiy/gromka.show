<template>
  <div class="home-sparkles" :class="sparklesClasses" aria-hidden="true">
    <SparkleEffect />
  </div>
</template>

<script setup lang="ts">
const settingsStore = useSettingsStore()

const sparklesClasses = computed(() => ({
  'home-sparkles--visible': settingsStore.isDarkTheme
}))
</script>

<style lang="scss" scoped>
.home-sparkles {
  position: fixed;
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

