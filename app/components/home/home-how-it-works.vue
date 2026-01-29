<template>
  <section class="home-how-it-works" :class="rootClasses">
    <div class="home-how-it-works__content">
      <header class="home-how-it-works__header">
        <h2 class="home-how-it-works__title">{{ t('howItWorks.title') }}</h2>
      </header>

      <div
        class="home-how-it-works__video-wrap"
      >
        <div class="home-how-it-works__stickers">
          <div class="home-how-it-works__sticker home-how-it-works__sticker--primary" :class="stickerClasses[0]">
            {{ t('howItWorks.stickers.browser') }}
          </div>
          <div class="home-how-it-works__sticker home-how-it-works__sticker--secondary" :class="stickerClasses[1]">
            {{ t('howItWorks.stickers.effects') }}
          </div>
          <div class="home-how-it-works__sticker home-how-it-works__sticker--thirdary" :class="stickerClasses[2]">
            {{ t('howItWorks.stickers.sync') }}
          </div>
        </div>
        <button
          type="button"
          class="home-how-it-works__nav home-how-it-works__nav--prev"
          :aria-label="t('howItWorks.media.prev')"
        >
          <svg class="home-how-it-works__nav-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <div class="home-how-it-works__swiper">
          <ClientOnly>
            <Swiper
              class="home-how-it-works__swiper-instance"
              :modules="swiperModules"
              :slides-per-view="1"
              :loop="true"
              :speed="420"
              :allow-touch-move="true"
              :navigation="swiperNavigation"
              @swiper="onSwiper"
              @slideChange="onSlideChange"
              @slideChangeTransitionStart="onSlideChangeTransitionStart"
              @slideChangeTransitionEnd="onSlideChangeTransitionEnd"
            >
              <SwiperSlide
                v-for="(slide, idx) in slides"
                :key="slide.url"
                class="home-how-it-works__slide"
              >
                <video
                  class="home-how-it-works__video"
                  :src="slide.url"
                  autoplay
                  :muted="isMuted"
                  playsinline
                  disablepictureinpicture
                  controlslist="nodownload noplaybackrate noremoteplayback"
                  preload="metadata"
                  :aria-label="t('howItWorks.media.ariaLabel')"
                  @ended="onVideoEnded"
                  @loadeddata="onVideoLoaded(idx)"
                />
              </SwiperSlide>
            </Swiper>

            <template #fallback>
              <video
                class="home-how-it-works__video"
                :src="slides[0]?.url"
                autoplay
                :muted="isMuted"
                playsinline
                disablepictureinpicture
                controlslist="nodownload noplaybackrate noremoteplayback"
                preload="metadata"
                :aria-label="t('howItWorks.media.ariaLabel')"
              />
            </template>
          </ClientOnly>
        </div>

        <button
          type="button"
          class="home-how-it-works__nav home-how-it-works__nav--next"
          :aria-label="t('howItWorks.media.next')"
        >
          <svg class="home-how-it-works__nav-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        
        <div class="home-how-it-works__caption">
          <span class="home-how-it-works__caption-text" aria-hidden="true">
            {{ t(activeCaptionKey) }}
          </span>
          <button
            type="button"
            class="home-how-it-works__sound"
            :class="soundClasses"
            :aria-label="soundAriaLabel"
            @click="toggleSound"
          >
            <img class="home-how-it-works__sound-icon" :src="soundIcon" alt="" />
          </button>
        </div>
      </div>

      <div class="home-how-it-works__steps">
        <article v-for="(step, idx) in steps" :key="step.n" class="home-how-it-works__step" :class="stepClasses[idx]">
          <div class="home-how-it-works__step-top">
            <span class="home-how-it-works__step-index">{{ step.n }}</span>
            <h3 class="home-how-it-works__step-title">{{ t(step.titleKey) }}</h3>
          </div>
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
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import type { Swiper as SwiperInstance } from 'swiper'

import { GROMKA_STORAGE_BASE_URL } from '@/constants/storage'
import mouseIcon from '@/assets/icons/mouse.svg'
import soundOnIcon from '@/assets/icons/sound-on.svg'
import soundOffIcon from '@/assets/icons/sound-off.svg'

const { t } = useI18n()
const settingsStore = useSettingsStore()

const emit = defineEmits<{
  (e: 'next'): void
}>()

const props = defineProps<{
  phase?: number
}>()

const rootClasses = computed(() => ({
  'home-how-it-works--dark': settingsStore.isDarkTheme
}))

// Вычисляемые классы для стикеров (появляются с паузой 100мс каждый)
const stickerClasses = computed(() => [
  {
    'home-how-it-works__sticker--hidden': (props.phase ?? 0) >= 1
  },
  {
    'home-how-it-works__sticker--hidden': (props.phase ?? 0) >= 2
  },
  {
    'home-how-it-works__sticker--hidden': (props.phase ?? 0) >= 3
  }
])

// Вычисляемые классы для шагов (появляются с паузой 100мс каждый после стикеров)
const stepClasses = computed(() => [
  {
    'home-how-it-works__step--hidden': (props.phase ?? 0) >= 4
  },
  {
    'home-how-it-works__step--hidden': (props.phase ?? 0) >= 5
  },
  {
    'home-how-it-works__step--hidden': (props.phase ?? 0) >= 6
  }
])

type VideoSlide = {
  url: string
  captionKey:
    | 'howItWorks.media.captions.immersiveTheatre'
    | 'howItWorks.media.captions.musicControl'
    | 'howItWorks.media.captions.spartakScreens'
}

const slides = computed<ReadonlyArray<VideoSlide>>(() => ([
  { url: `${GROMKA_STORAGE_BASE_URL}how-it-works-1.mp4`, captionKey: 'howItWorks.media.captions.immersiveTheatre' },
  { url: `${GROMKA_STORAGE_BASE_URL}how-it-works-2.mp4`, captionKey: 'howItWorks.media.captions.musicControl' },
  { url: `${GROMKA_STORAGE_BASE_URL}how-it-works-3.mp4`, captionKey: 'howItWorks.media.captions.spartakScreens' }
]))

const swiperModules = [Navigation]
const swiper = shallowRef<SwiperInstance | null>(null)
const realIndex = ref(0)
const isMuted = ref(true)

const swiperNavigation = {
  prevEl: '.home-how-it-works__nav--prev',
  nextEl: '.home-how-it-works__nav--next'
}

const activeCaptionKey = computed(() => slides.value[realIndex.value]?.captionKey ?? 'howItWorks.media.captions.immersiveTheatre')

const soundIcon = computed(() => (isMuted.value ? soundOffIcon : soundOnIcon))

const soundClasses = computed(() => ({
  'home-how-it-works__sound--muted': isMuted.value
}))

const soundAriaLabel = computed(() => (
  isMuted.value ? t('howItWorks.media.soundOn') : t('howItWorks.media.soundOff')
))

const pauseAllVideos = () => {
  const s = swiper.value
  const root = s?.el
  if (!root) return
  root.querySelectorAll('video').forEach((v) => {
    try {
      v.pause()
    } catch {
      // ignore
    }
  })
}

const applyMuteState = () => {
  const s = swiper.value
  const root = s?.el
  if (!root) return
  root.querySelectorAll('video').forEach((v) => {
    v.muted = isMuted.value
  })
}

const getActiveVideo = (): HTMLVideoElement | null => {
  const s = swiper.value
  if (!s) return null
  const slideEl = s.slides?.[s.activeIndex] as HTMLElement | undefined
  if (!slideEl) return null
  return slideEl.querySelector('video')
}

const playActiveVideo = async () => {
  const v = getActiveVideo()
  if (!v) return
  v.muted = isMuted.value
  try {
    v.currentTime = 0
  } catch {
    // ignore
  }
  try {
    await v.play()
  } catch {
    // autoplay может быть заблокирован браузером — игнорируем
  }
}

const onSwiper = (instance: SwiperInstance) => {
  swiper.value = instance
  realIndex.value = instance.realIndex ?? 0
  queueMicrotask(() => {
    pauseAllVideos()
    applyMuteState()
    void playActiveVideo()
  })
}

const onSlideChange = (instance: SwiperInstance) => {
  realIndex.value = instance.realIndex ?? 0
}

const onSlideChangeTransitionStart = () => {
  pauseAllVideos()
}

const onSlideChangeTransitionEnd = () => {
  void playActiveVideo()
}

const onVideoEnded = (e: Event) => {
  const s = swiper.value
  if (!s) return
  const activeVideo = getActiveVideo()
  if (activeVideo && e.target !== activeVideo) return
  s.slideNext()
}

const onVideoLoaded = (_idx: number) => async () => {
  const v = getActiveVideo()
  if (!v) return
  v.muted = isMuted.value
  try {
    await v.play()
  } catch {
    // ignore
  }
}

const toggleSound = () => {
  isMuted.value = !isMuted.value
  applyMuteState()
  const v = getActiveVideo()
  if (!v) return
  try {
    void v.play()
  } catch {
    // ignore
  }
}

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
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;
@use "sass:math";

.home-how-it-works {
  // локальные SCSS-переменные (не CSS custom properties)
  $video-inset-x: 1rem;
  $video-inset-y: 0.889rem;
  $nav-size: 3.556rem;
  $nav-icon-size: 2.222rem;
  $sound-size: 3.556rem;
  $sound-icon-size: 1.667rem;
  $nav-edge-shift: math.div(($nav-size - $nav-icon-size), 2);
  $sound-edge-shift: math.div(($sound-size - $sound-icon-size), 2);

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
    gap: 1rem;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 0.778rem;
    text-align: center;
  }

  &__title {
    margin: 0;
    font-size: 2.077rem; // 2.7rem / 1.3 ≈ 2.077rem
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

  &__nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 5;
    width: $nav-size; // 64px при базовом 18px
    height: $nav-size; // 64px при базовом 18px
    border-radius: 999rem;
    border: 0;
    background: transparent;
    color: $color-primary;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: none;
    transition: transform 0.18s ease, opacity 0.18s ease, filter 0.18s ease;
    will-change: transform, opacity;

    &:hover {
      filter: brightness(1.05);
    }

    &:active {
      transform: translateY(-50%) scale(0.98);
    }

    &--prev {
      left: calc(
        #{$video-inset-x} - #{$nav-edge-shift}
      );
    }

    &--next {
      right: calc(
        #{$video-inset-x} - #{$nav-edge-shift}
      );
    }
  }

  &__nav-icon {
    width: $nav-icon-size; // 40px
    height: $nav-icon-size; // 40px
    display: block;
  }

  &__sound {
    z-index: 5;
    width: $sound-size; // 64px при базовом 18px
    height: $sound-size; // 64px при базовом 18px
    border-radius: 999rem;
    border: 0;
    background: transparent;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    filter: drop-shadow(0 0.333rem 1rem rgba(0, 0, 0, 0.24));
    transition: transform 0.18s ease, filter 0.18s ease;

    &:hover {
      filter: drop-shadow(0 0.333rem 1rem rgba(0, 0, 0, 0.3)) brightness(1.05);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  &__sound-icon {
    width: $sound-icon-size; // 30px
    height: $sound-icon-size; // 30px
    display: block;
  }

  &__swiper {
    position: absolute;
    inset: 0;
    z-index: 1;
    overflow: hidden;
  }

  &__swiper-instance {
    height: 100%;
    width: 100%;
  }

  &__slide {
    width: 100%;
    position: relative;
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
    left: 0;
    right: 0;
    top: 0;
    z-index: 6;
    pointer-events: none;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.444rem;
    flex-wrap: nowrap;
    padding: $video-inset-y $video-inset-x;
  }

  &__caption {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 4;
    padding: $video-inset-y $video-inset-x; // 16px 18px
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    font-size: 0.769rem; // 1rem / 1.3 ≈ 0.769rem
    font-family: $font-default;
    font-weight: $font-weight-medium;
    color: $color-white;
    text-shadow: 0 0.111rem 0.444rem rgba(0, 0, 0, 0.5);
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.58) 100%);
    pointer-events: auto;
  }

  &__caption-text {
    grid-column: 2;
    justify-self: center;
    text-align: center;
    pointer-events: none;
  }

  &__caption .home-how-it-works__sound {
    grid-column: 3;
    justify-self: end;
    // Выравниваем именно иконку по правому inset (кнопка больше иконки).
    margin-right: calc(#{$sound-edge-shift} * -1);
  }

  &__sticker {
    padding: 0.5rem 0.833rem;
    border-radius: 0.444rem;
    font-size: 0.598rem; // 0.778rem / 1.3 ≈ 0.598rem
    font-family: $font-inter;
    background: $color-primary;
    color: $color-white;
    box-shadow: 0 0.222rem 0.667rem rgba(0, 0, 0, 0.15);
    white-space: nowrap;
    transform: translateY(0);
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity, transform;
    flex: 1 1 0;
    text-align: center;
    min-width: 0;

    &--hidden {
      opacity: 0;
      transform: translateY(-2rem);
      pointer-events: none;
    }

    // Все верхние плашки — одного (розового) цвета
    &--primary,
    &--secondary,
    &--thirdary {
      background: $color-primary;
      color: $color-white;
    }
  }

  &__steps {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.444rem;
    width: 100%;
    max-width: 41.8rem;
  }

  &__step {
    border-radius: 0.444rem;
    padding: 1rem 0.556rem;
    background: $color-white-light;
    border: 1px solid rgba(44, 44, 44, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0.444rem;
    position: relative;
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity, transform;

    &--hidden {
      opacity: 0;
      transform: translateX(3rem);
      pointer-events: none;
    }
  }

  &__step-top {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 1.2em;
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
    flex-shrink: 0;
    position: absolute;
    left: 0;
  }

  &__step-title {
    margin: 0;
    font-size: 0.926rem;
    font-family: $font-default;
    font-weight: $font-weight-medium;
    color: $color-black;
    line-height: 1.2;
    text-align: center;
    width: 100%;
    padding: 0 1.3em;
  }

  &__step-text {
    margin: 0;
    font-size: 0.8rem;
    font-family: $font-inter;
    font-weight: $font-weight-regular;
    color: $color-gray-700;
    line-height: 1.4;
    text-align: center;
  }

  &__mouse {
    margin-top: 1rem;
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
      background: $color-gray-800;
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
    $video-inset-x: 0.889rem;
    $video-inset-y: 0.667rem;
    $nav-size: 3.111rem;
    $sound-size: 3.111rem;
    $nav-edge-shift: math.div(($nav-size - $nav-icon-size), 2);
    $sound-edge-shift: math.div(($sound-size - $sound-icon-size), 2);

    &__content {
      max-width: 42rem;
      padding: 1.333rem;
    }

    &__steps {
      grid-template-columns: 1fr;
    }

    &__nav {
      width: 3.111rem; // 43.5px при базовом 14px (моб)
      height: 3.111rem;

      &--prev {
        left: calc(#{$video-inset-x} - #{$nav-edge-shift});
      }

      &--next {
        right: calc(#{$video-inset-x} - #{$nav-edge-shift});
      }
    }

    &__caption {
      font-size: 0.715rem; // 0.929rem / 1.3 ≈ 0.715rem
    }

    &__sound {
      width: $sound-size; // 43.5px при базовом 14px (моб)
      height: $sound-size;
    }
  }
}
</style>
