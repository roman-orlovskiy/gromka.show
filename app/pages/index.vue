<template>
  <div class="page">
    <section class="hero">
      <div class="hero__header">
        <LanguageSwitcher />
      </div>
      
      <div class="hero__content">
        <h1 class="hero__title">{{ t('hero.title') }}</h1>
        <h2 class="hero__subtitle">{{ t('hero.subtitle') }}</h2>
        <p class="hero__description">{{ t('hero.description') }}</p>
        
        <UiButton size="lg" class="hero__button">
          {{ t('hero.button') }}
        </UiButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.page {
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
}

.hero {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: $color-gray-100;
  overflow: hidden;
  
  &__header {
    display: flex;
    justify-content: flex-end;
    padding: 2rem 3rem;
    flex-shrink: 0;
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
  }
  
  &__title {
    font-size: 13.444rem; // 242px при базовом 18px
    letter-spacing: 0.05em;
    color: $color-black;
    margin: 0 0 1.5rem 0;
    line-height: 1;
  }
  
  &__subtitle {
    font-size: 1.889rem; // 34px при базовом 18px
    font-weight: $font-weight-medium;
    color: $color-black;
    line-height: 1.2;
  }
  
  &__description {
    font-size: 1rem;
    font-weight: $font-weight-regular;
    font-family: $font-inter;
    margin: 0;
    max-width: 50rem;
    color: $color-gray-700;
    line-height: 1.5;
  }
  
  &__button {
    margin-top: 1rem;
    flex-shrink: 0;
  }
}
</style>
