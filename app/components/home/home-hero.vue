<template>
  <section class="home-hero" :class="heroClasses">
    <SparkleEffect />

    <div class="home-hero__header">
      <LanguageSwitcher />
    </div>

    <div class="home-hero__content">
      <Transition name="fade-up">
        <h1 v-if="isTitleVisible" class="home-hero__title">{{ t('hero.title') }}</h1>
      </Transition>

      <Transition name="fade-up">
        <div v-if="isTextBlockVisible" class="home-hero__text-block">
          <h2 class="home-hero__subtitle">{{ t('hero.subtitle') }}</h2>
          <p class="home-hero__description">{{ t('hero.description') }}</p>
        </div>
      </Transition>

      <UiButton size="lg" class="home-hero__button">
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

const isTitleVisible = computed(() => props.phase < 1)
const isTextBlockVisible = computed(() => props.phase < 2)
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.home-hero {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: $color-gray-100;
  overflow: hidden;
  transition: background 0.6s ease;
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
    transition: color 0.6s ease;
  }

  &__text-block {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__subtitle {
    font-size: 1.889rem; // 34px при базовом 18px
    font-weight: $font-weight-medium;
    color: $color-black;
    line-height: 1.2;
    transition: color 0.6s ease;
  }

  &__description {
    font-size: 1rem;
    font-weight: $font-weight-regular;
    font-family: $font-inter;
    margin: 0;
    max-width: 50rem;
    color: $color-gray-700;
    line-height: 1.5;
    transition: color 0.6s ease;
  }

  &__button {
    margin-top: 1rem;
    flex-shrink: 0;
  }

  &--dark {
    background: linear-gradient(to bottom, $color-black, $color-black-dark);

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

