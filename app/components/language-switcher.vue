<template>
  <button 
    class="language-switcher"
    @click="handleToggleLanguage"
    :title="t('performance.language.switch')"
  >
    <span class="language-switcher__text">
      {{ currentLang === 'ru' ? 'EN' : 'RU' }}
    </span>
  </button>
</template>

<script setup lang="ts">
const { t, currentLang, toggleLanguage } = useI18n()

const handleToggleLanguage = async () => {
  await toggleLanguage()
}
</script>

<style lang="scss" scoped>
.language-switcher {
  position: absolute;
  top: 2rem;
  right: 2rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &__text {
    font-size: 1.6rem;
    font-weight: bold;
    color: white;
    text-shadow: 0 0.1rem 0.3rem rgba(0, 0, 0, 0.3);
  }
}
</style>
