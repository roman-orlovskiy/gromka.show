<template>
  <div class="language-switcher">
    <button 
      class="language-switcher__button"
      :class="{ 'language-switcher__button--active': currentLang === 'ru' }"
      @click="setLang('ru')"
    >
      {{ t('language.ru') }}
    </button>
    <span class="language-switcher__separator">|</span>
    <button 
      class="language-switcher__button"
      :class="{ 'language-switcher__button--active': currentLang === 'en' }"
      @click="setLang('en')"
    >
      {{ t('language.en') }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { t, currentLang, setLanguage } = useI18n()

const setLang = async (lang: 'ru' | 'en') => {
  if (currentLang.value !== lang) {
    await setLanguage(lang)
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.language-switcher {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &__button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: 1rem;
    font-weight: $font-weight-bold;
    color: $color-black;
    transition: color 0.3s ease;
    
    &--active {
      color: $color-black;
    }
    
    &:not(&--active) {
      color: $color-gray-400;
      
      &:hover {
        color: $color-gray-600;
      }
    }
  }
  
  &__separator {
    color: $color-gray-400;
    font-size: 1rem;
    user-select: none;
  }
}
</style>
