<template>
  <section class="home-hero" :class="heroClasses">
    <div class="home-hero__header">
      <LanguageSwitcher />
    </div>

    <div class="home-hero__content">
      <h1 class="home-hero__title" :class="titleClasses">{{ t('hero.title') }}</h1>

      <div class="home-hero__text-block" :class="textBlockClasses">
        <h2 class="home-hero__subtitle">{{ t('hero.subtitle') }}</h2>
        <p class="home-hero__description">{{ t('hero.description') }}</p>
      </div>

      <UiButton size="lg" class="home-hero__button" :class="buttonClasses">
        {{ t('hero.button') }}
      </UiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const settingsStore = useSettingsStore()

const props = defineProps<{
  phase: number
}>()

const heroClasses = computed(() => ({
  'home-hero--dark': settingsStore.isDarkTheme
}))

const titleClasses = computed(() => ({
  'home-hero__title--hidden': props.phase >= 1
}))

const textBlockClasses = computed(() => ({
  'home-hero__text-block--hidden': props.phase >= 2
}))

const buttonClasses = computed(() => ({
  'home-hero__button--hidden': props.phase >= 3
}))
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.home-hero {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  &__header {
    display: flex;
    justify-content: flex-end;
    padding: 2rem 3rem;
    flex-shrink: 0;
    position: relative;
    z-index: 2;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 2rem;
    text-align: center;
    gap: 1rem;
    overflow: hidden;
    position: relative;
    z-index: 2;
  }

  &__title {
    font-size: 13.444rem; // 242px при базовом 18px
    letter-spacing: 0.05em;
    color: $color-black;
    margin: 0 0 1.5rem 0;
    line-height: 1;
    transition: color 0.5s ease,
      opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity, transform;

    &--hidden {
      opacity: 0;
      transform: translateY(-3rem);
      pointer-events: none;
    }
  }

  &__text-block {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity, transform;

    &--hidden {
      opacity: 0;
      transform: translateY(-3rem);
      pointer-events: none;
    }
  }

  &__subtitle {
    font-size: 1.889rem; // 34px при базовом 18px
    font-weight: $font-weight-medium;
    color: $color-black;
    line-height: 1.2;
    transition: color 0.5s ease;
  }

  &__description {
    font-size: 1rem;
    font-weight: $font-weight-regular;
    font-family: $font-inter;
    margin: 0;
    max-width: 50rem;
    color: $color-gray-700;
    line-height: 1.5;
    transition: color 0.5s ease;
  }

  &__button {
    margin-top: 1rem;
    flex-shrink: 0;
    transition: opacity 0.292s ease;
    will-change: opacity;

    &--hidden {
      opacity: 0;
      pointer-events: none;
    }
  }

  &--dark {
    .home-hero__title {
      color: $color-primary;
    }

    .home-hero__subtitle {
      color: $color-white-light;
    }

    .home-hero__description {
      color: $color-white-light;
    }
  }
}
</style>

