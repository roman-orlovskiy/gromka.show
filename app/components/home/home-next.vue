<template>
  <section class="home-next">
    <div class="home-next__content">
      <h2 class="home-next__title">Что такое Gromka?</h2>

      <div class="home-next__video-wrap">
        <video
          class="home-next__video"
          :src="aboutVideoUrl"
          autoplay
          muted
          loop
          playsinline
          disablepictureinpicture
          controlslist="nodownload noplaybackrate noremoteplayback"
          preload="metadata"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { GROMKA_STORAGE_BASE_URL } from '@/constants/storage'

const aboutVideoUrl = computed(() => `${GROMKA_STORAGE_BASE_URL}about-project.mp4`)
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.home-next {
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

  &__video-wrap {
    position: relative;
    width: 100%;
    max-width: 41.778rem; // 752px при базовом 18px
    border-radius: 1.333rem;
    overflow: hidden;
    background: $color-black-dark;

    // Пропорции: 752 x 416.
    // Высота в % от ширины (padding-top считает % от ширины контейнера).
    &::before {
      content: "";
      display: block;
      padding-top: 55.319%;
    }
  }

  &__video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}
</style>

