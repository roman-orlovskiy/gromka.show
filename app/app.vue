<template>
  <div class="app-root">
    <NuxtRouteAnnouncer />
    <AppBackground />
    <AppHeader />
    <div class="app-root__content">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppBackground from '@/components/app-background.vue'
import AppHeader from '@/components/app-header.vue'

const settingsStore = useSettingsStore()

onMounted(() => {
  setTimeout(() => {
    settingsStore.setDarkTheme(true)
  }, 2000)
})
</script>

<style lang="scss">
@use "@/assets/scss/fonts.scss";
@use "@/assets/scss/variables.scss" as *;
@use "@/assets/scss/transitions.scss";

html {
  // По умолчанию для широких экранов (landscape) - от высоты
  font-size: 1.8vh;
  min-height: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  
  // Для узких экранов (aspect ratio < 17:10) - от ширины
  @include layout-aspect-tablet {
    font-size: 1.2vw;
  }

  // Для мобильных (aspect ratio <= 10:10) — базовый rem = 14px
  @include layout-aspect-mobile {
    font-size: 3.5vw;
  }
}

body {
  min-height: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'TT Travels Next', sans-serif;
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.5;
  overflow: hidden;
}

#__nuxt {
  min-height: 100%;
  height: 100%;
  width: 100%;
}

.app-root {
  min-height: 100%;
  height: 100%;
  width: 100%;

  &__content {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
  }
}

@include layout-aspect-mobile {
  // На мобильных браузерах видимая высота может отличаться от 100%/100vh
  // (адресная строка/системные панели). Берём "small viewport" чтобы
  // слайды гарантированно влезали без скрытого переполнения.
  html,
  body,
  #__nuxt,
  .app-root,
  .app-root__content {
    min-height: 100svh;
    height: 100svh;
  }
}
</style>
