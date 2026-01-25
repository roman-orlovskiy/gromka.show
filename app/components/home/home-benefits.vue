<template>
  <section class="home-benefits">
    <div class="home-benefits__content">
      <h2 class="home-benefits__title">{{ t('benefits.title') }}</h2>
      <p class="home-benefits__description">{{ t('benefits.description') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.home-benefits {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

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
    font-size: 1.5rem;
    font-family: $font-inter;
    font-weight: $font-weight-regular;
    color: $color-white;
    line-height: 1.6;
  }
}
</style>
