<template>
  <div class="app-background" :class="backgroundClasses" aria-hidden="true">
    <div class="app-background__dark-layer" />
    <div class="app-background__sparkles">
      <SparkleEffect />
    </div>
  </div>
</template>

<script setup lang="ts">
const settingsStore = useSettingsStore()

const backgroundClasses = computed(() => ({
  'app-background--dark': settingsStore.isDarkTheme
}))
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.app-background {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background: $color-gray-100;
  overflow: hidden;
  z-index: 0;

  &__dark-layer {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, $color-black, $color-black-dark);
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
  }

  &__sparkles {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
  }

  &--dark {
    .app-background__dark-layer {
      opacity: 1;
    }

    .app-background__sparkles {
      opacity: 1;
    }
  }
}
</style>

