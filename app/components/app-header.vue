<template>
  <header class="app-header" :class="headerClasses">
    <div class="app-header__inner">
      <div class="app-header__logo" :class="logoClasses">GROMKA</div>

      <div class="app-header__switcher" :class="switcherClasses">
        <LanguageSwitcher />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const mainStore = useMainStore()
const settingsStore = useSettingsStore()

const isHeroView = computed(() => mainStore.activeViewId === 'hero')

const headerClasses = computed(() => ({
  'app-header--dark': settingsStore.isDarkTheme
}))

const logoClasses = computed(() => ({
  'app-header__logo--visible': !isHeroView.value
}))

const switcherClasses = computed(() => ({
  'app-header__switcher--centered': isHeroView.value
}))
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 2rem 3rem;
  pointer-events: none;

  &__inner {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
  }

  &__logo {
    font-size: 1.333rem; // 24px при базовом 18px
    font-weight: $font-weight-bold;
    color: $color-black;
    opacity: 0;
    transform: translate3d(-2rem, 0, 0);
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      color 0.5s ease;
    pointer-events: auto;

    &--visible {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  &__switcher {
    margin-left: auto;
    position: relative;
    right: 0;
    transform: translate3d(0, 0, 0);
    transition: right 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: right, transform;
    pointer-events: auto;

    &--centered {
      right: 50%;
      transform: translate3d(50%, 0, 0);
    }
  }

  &--dark {
    .app-header__logo {
      color: $color-primary;
    }
  }
}
</style>
