<template>
  <section class="home-pricing" :class="rootClasses">
    <div class="home-pricing__content">
      <h2 class="home-pricing__title">{{ t('pricing.title') }}</h2>
      <p class="home-pricing__description">{{ t('pricing.description') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const settingsStore = useSettingsStore()

const rootClasses = computed(() => ({
  'home-pricing--dark': settingsStore.isDarkTheme
}))
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.home-pricing {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-black;

  &__content {
    text-align: center;
    padding: 2rem;
    width: 100%;
    max-width: 56rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  &__title {
    margin: 0;
    font-size: 2.7rem;
    color: $color-primary;
    font-weight: $font-weight-medium;
    font-family: $font-default;
  }

  &__description {
    margin: 0;
    font-size: 1.389rem;
    font-family: $font-inter;
    font-weight: $font-weight-regular;
    color: $color-black;
    line-height: 1.6;
  }

  &--dark {
    color: $color-white;

    .home-pricing__description {
      color: $color-white;
    }
  }

  @include layout-aspect-mobile {
    &__content {
      max-width: 42rem;
      padding: 1.333rem;
    }

    &__title {
      font-size: 2.143rem;
    }

    &__description {
      font-size: 1.143rem;
    }
  }
}
</style>
