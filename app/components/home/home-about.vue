<template>
  <section class="home-about">
    <div class="home-about__content">
      <h2 class="home-about__title">{{ t('about.title') }}</h2>

      <div class="home-about__video-wrap">
        <video
          class="home-about__video"
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

      <p class="home-about__description" v-html="t('about.description')" />

      <div class="home-about__mouse" @click="emit('next')">
        <img class="home-about__mouse-icon" :src="mouseIcon" alt="" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { GROMKA_STORAGE_BASE_URL } from '@/constants/storage'
import mouseIcon from '@/assets/icons/mouse.svg'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'next'): void
}>()

const aboutVideoUrl = computed(() => `${GROMKA_STORAGE_BASE_URL}about-project.mp4`)
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.home-about {
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
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
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
    max-width: 38.564rem; // (752px * 1.2) / 1.3 = 694.15px при базовом 18px
    border-radius: 1.333rem;
    overflow: hidden;
    background: $color-black-dark;

    // Пропорции: 752 x 416, уменьшенные в 1.3 раза.
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

  &__description {
    margin: 0;
    font-size: 1.154rem; // 1.5rem / 1.3 ≈ 1.154rem
    font-family: $font-inter;
    font-weight: $font-weight-regular;
    color: $color-white;
    line-height: 1.6;
    width: 100%;
    max-width: 38.564rem;
  }

  &__mouse {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  &__mouse-icon {
    width: 3.25rem; // 58.5px при базовом 18px
    height: 3.25rem; // 58.5px при базовом 18px
    display: block;
    filter: brightness(0) invert(1);
  }

  @include layout-aspect-mobile {
    &__content {
      padding: 1.333rem;
      max-width: 42rem;
      justify-content: center;
      gap: 1rem;
    }

    &__title {
      font-size: 2.143rem;
    }

    &__video-wrap {
      max-width: 100%;
      border-radius: 1rem;
    }

    &__description {
      font-size: 1.2rem;
      max-width: 100%;
      line-height: 1.5;
    }

    &__mouse-icon {
      width: 2.857rem;
      height: 2.857rem;
    }
  }
}
</style>
