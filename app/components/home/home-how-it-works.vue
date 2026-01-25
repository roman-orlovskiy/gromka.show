<template>
  <section class="home-how-it-works" :class="rootClasses">
    <div class="home-how-it-works__content">
      <header class="home-how-it-works__header">
        <h2 class="home-how-it-works__title">{{ t('howItWorks.title') }}</h2>
      </header>

      <div class="home-how-it-works__video-wrap">
        <video
          class="home-how-it-works__video"
          :src="demoVideoUrl"
          autoplay
          muted
          loop
          playsinline
          disablepictureinpicture
          controlslist="nodownload noplaybackrate noremoteplayback"
          preload="metadata"
        />
        
        <div class="home-how-it-works__stickers">
          <div class="home-how-it-works__sticker home-how-it-works__sticker--primary">
            {{ t('howItWorks.stickers.browser') }}
          </div>
          <div class="home-how-it-works__sticker home-how-it-works__sticker--secondary">
            {{ t('howItWorks.stickers.effects') }}
          </div>
          <div class="home-how-it-works__sticker home-how-it-works__sticker--thirdary">
            {{ t('howItWorks.stickers.sync') }}
          </div>
        </div>
      </div>

      <div class="home-how-it-works__steps">
        <article v-for="step in steps" :key="step.n" class="home-how-it-works__step">
          <div class="home-how-it-works__step-top">
            <span class="home-how-it-works__step-index">{{ step.n }}</span>
          </div>
          <h3 class="home-how-it-works__step-title">{{ t(step.titleKey) }}</h3>
          <p class="home-how-it-works__step-text" v-html="t(step.textKey)" />
        </article>
      </div>

      <div class="home-how-it-works__mouse" @click="emit('next')">
        <img class="home-how-it-works__mouse-icon" :src="mouseIcon" alt="" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { GROMKA_STORAGE_BASE_URL } from '@/constants/storage'
import mouseIcon from '@/assets/icons/mouse.svg'

const { t } = useI18n()
const settingsStore = useSettingsStore()

const emit = defineEmits<{
  (e: 'next'): void
}>()

const rootClasses = computed(() => ({
  'home-how-it-works--dark': settingsStore.isDarkTheme
}))

type Step = {
  n: 1 | 2 | 3
  titleKey: string
  textKey: string
}

const steps: ReadonlyArray<Step> = [
  { n: 1, titleKey: 'howItWorks.steps.scanTitle', textKey: 'howItWorks.steps.scanText' },
  { n: 2, titleKey: 'howItWorks.steps.startTitle', textKey: 'howItWorks.steps.startText' },
  { n: 3, titleKey: 'howItWorks.steps.afterTitle', textKey: 'howItWorks.steps.afterText' }
]

const demoVideoUrl = computed(() => `${GROMKA_STORAGE_BASE_URL}how-it-works.mp4`)
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.home-how-it-works {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-black;

  &__content {
    padding: 2rem;
    width: 100%;
    max-width: 56rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 0.778rem;
    text-align: center;
  }

  &__title {
    margin: 0;
    font-size: 2.7rem;
    color: $color-primary;
    font-weight: $font-weight-medium;
    font-family: $font-default;
  }

  &__video-wrap {
    position: relative;
    width: 100%;
    max-width: 41.8rem;
    border-radius: 1.111rem;
    overflow: hidden;
    background: $color-black-dark;

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

  &__stickers {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__sticker {
    position: absolute;
    padding: 0.5rem 0.833rem;
    border-radius: 0.667rem;
    font-size: 0.778rem;
    font-family: $font-inter;
    color: $color-black;
    box-shadow: 0 0.222rem 0.667rem rgba(0, 0, 0, 0.15);
    white-space: nowrap;

    &--primary {
      background: $color-primary;
      top: 1.111rem;
      left: 1.111rem;
      transform: rotate(-3deg);
      color: $color-white;
    }

    &--secondary {
      background: $color-secondary;
      top: 1.111rem;
      right: 1.111rem;
      transform: rotate(2deg);
    }

    &--thirdary {
      background: $color-thirdary;
      color: $color-white;
      top: 4.889rem;
      left: 50%;
      transform: translateX(-50%) rotate(3deg);
    }
  }

  &__steps {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.833rem;
    width: 100%;
    max-width: 41.8rem;
  }

  &__step {
    border-radius: 1.111rem;
    padding: 1rem 0.9rem;
    background: $color-white-light;
    border: 1px solid rgba(44, 44, 44, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0.556rem;
    position: relative;
  }

  &__step-top {
    position: absolute;
    top: 1rem;
    left: 0.9rem;
  }

  &__step-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: $color-primary;
    font-size: 0.926rem;
    font-family: $font-default;
    font-weight: $font-weight-bold;
    line-height: 1;
  }

  &__step-title {
    margin: 0;
    font-size: 0.926rem;
    font-family: $font-default;
    font-weight: $font-weight-medium;
    color: $color-black;
    line-height: 1.2;
    text-align: center;
  }

  &__step-text {
    margin: 0;
    font-size: 0.833rem;
    font-family: $font-inter;
    font-weight: $font-weight-regular;
    color: $color-gray-700;
    line-height: 1.6;
    text-align: center;
  }

  &__mouse {
    margin-top: 1.889rem;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  &__mouse-icon {
    width: 3.25rem;
    height: 3.25rem;
    display: block;
    filter: brightness(0) invert(1);
  }

  &--dark {
    color: $color-white;

    .home-how-it-works__step {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.12);
    }

    .home-how-it-works__step-title {
      color: $color-white-light;
    }

    .home-how-it-works__step-text {
      color: rgba(255, 255, 255, 0.78);
    }
  }

  @include layout-aspect-mobile {
    &__content {
      max-width: 42rem;
      padding: 1.333rem;
    }

    &__steps {
      grid-template-columns: 1fr;
    }
  }
}
</style>
