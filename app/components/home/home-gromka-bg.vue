<template>
  <Transition :name="transitionNameResolved">
    <div v-if="isVisible" class="home-gromka-bg" aria-hidden="true">
      <div class="home-gromka-bg__text">GROMKA</div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  activeViewId: string
  transitionName?: string
}>()

const isVisible = computed(() => props.activeViewId !== 'hero')
const transitionNameResolved = computed(() => props.transitionName || 'view-up')
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.home-gromka-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  user-select: none;
  overflow: hidden;
  z-index: 0; // ниже звёздочек (home-sparkles)

  &__text {
    position: absolute;
    left: 50%;
    bottom: -1.2vw;
    transform: translateX(-50%) translateY(20%);
    white-space: nowrap;
    font-family: $font-default;
    font-weight: $font-weight-bold;
    font-size: 19vw; // гарантированно шире вьюпорта
    line-height: 0.85;
    letter-spacing: 0.06em;
    color: rgba($color-white-light, 0.02);
  }
}
</style>

