<template>
  <div class="app-root">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<style lang="scss">
@use "@/assets/scss/fonts.scss";
@use "@/assets/scss/variables.scss" as *;
@use "@/assets/scss/transitions.scss";

html {
  // По умолчанию для широких экранов (landscape) - от высоты
  font-size: clamp(10px, 1.8vh, 18px);
  min-height: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  
  // Для узких экранов (aspect ratio < 17:10) - от ширины
  @include layout-aspect-tablet {
    font-size: clamp(10px, 1.2vw, 18px);
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
}
</style>
