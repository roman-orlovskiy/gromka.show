<template>
  <section class="home-how-it-works">
    <div class="home-how-it-works__content">
      <h2 class="home-how-it-works__title">Как это работает?</h2>
      <p class="home-how-it-works__description">Контент в разработке...</p>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.home-how-it-works {
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
    font-size: 2.7rem; // 44px
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
