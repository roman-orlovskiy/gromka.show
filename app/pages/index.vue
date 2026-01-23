<template>
  <div class="page">
    <section class="hero" :class="heroClasses">
      <SparkleEffect />
      
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
const settingsStore = useSettingsStore()

const heroClasses = computed(() => ({
  'hero--dark': settingsStore.isDarkTheme
}))

onMounted(() => {
  setTimeout(() => {
    settingsStore.setDarkTheme(true)
  }, 2000)
})
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
    
    .hero__title {
      color: $color-primary;
    }
    
    .hero__subtitle {
      color: $color-white-light;
    }
    
    .hero__description {
      color: $color-white-light;
    }
  }
}
</style>
