<template>
  <div class="app-root">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<style lang="scss">
@use "@/assets/scss/fonts.scss";

html {
  // Адаптивный размер: используем меньшее из vw или vh для масштабирования
  // Если ширина > высоты (landscape), ориентируемся на высоту
  // Если высота > ширины (portrait), ориентируемся на ширину
  font-size: clamp(10px, min(1.2vw, 1.8vh), 20px);
  min-height: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
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
