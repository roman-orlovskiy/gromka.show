<template>
  <div class="app-root">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<style lang="scss">
@use "@/assets/scss/fonts.scss";

html {
  font-size: clamp(0.875rem, 0.75rem + 0.5vw, 1.125rem);
  min-height: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
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
