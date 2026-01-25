<template>
  <section class="home-how-it-works" :class="rootClasses">
    <div class="home-how-it-works__content">
      <header class="home-how-it-works__header">
        <h2 class="home-how-it-works__title">{{ t('howItWorks.title') }}</h2>
      </header>

      <div class="home-how-it-works__grid">
        <div class="home-how-it-works__steps">
          <div class="home-how-it-works__steps-grid">
            <article v-for="step in steps" :key="step.n" class="home-how-it-works__step">
              <div class="home-how-it-works__step-top">
                <span class="home-how-it-works__step-index">{{ t('howItWorks.stepLabel', { n: step.n }) }}</span>
              </div>
              <h3 class="home-how-it-works__step-title">{{ t(step.titleKey) }}</h3>
              <p class="home-how-it-works__step-text">{{ t(step.textKey) }}</p>
            </article>
          </div>

          <p class="home-how-it-works__note">{{ t('howItWorks.note') }}</p>
        </div>

        <aside class="home-how-it-works__aside">
          <div class="home-how-it-works__badges">
            <div class="home-how-it-works__badge">{{ t('howItWorks.badges.noApp') }}</div>
            <div class="home-how-it-works__badge home-how-it-works__badge--secondary">
              {{ t('howItWorks.badges.sync') }}
            </div>
          </div>

          <div class="home-how-it-works__media" :aria-label="t('howItWorks.media.ariaLabel')">
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
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { GROMKA_STORAGE_BASE_URL } from '@/constants/storage'

const { t } = useI18n()
const settingsStore = useSettingsStore()

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
    max-width: 74rem;
    display: flex;
    flex-direction: column;
    gap: 1.778rem;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 0.778rem;
    text-align: center;
  }

  &__title {
    margin: 0;
    font-size: 2.7rem; // 44px
    color: $color-primary;
    font-weight: $font-weight-medium;
    font-family: $font-default;
  }

  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 22.5rem;
    gap: 1.778rem;
    align-items: start;
  }

  &__steps {
    display: flex;
    flex-direction: column;
    gap: 0.889rem;
  }

  &__steps-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__step {
    border-radius: 1.333rem;
    padding: 1.222rem 1.111rem;
    background: $color-white-light;
    border: 1px solid rgba(44, 44, 44, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0.667rem;
  }

  &__step-top {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  &__step-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.333rem 0.667rem;
    border-radius: 999rem;
    background: rgba(255, 0, 182, 0.12);
    color: $color-primary-dark;
    font-size: 0.889rem; // 16px
    font-family: $font-inter;
    font-weight: $font-weight-medium;
    line-height: 1;
  }

  &__step-title {
    margin: 0;
    font-size: 1.111rem; // 20px
    font-family: $font-default;
    font-weight: $font-weight-medium;
    color: $color-black;
    line-height: 1.2;
  }

  &__step-text {
    margin: 0;
    font-size: 1rem;
    font-family: $font-inter;
    font-weight: $font-weight-regular;
    color: $color-gray-700;
    line-height: 1.6;
  }

  &__note {
    margin: 0;
    font-size: 0.889rem;
    font-family: $font-inter;
    font-weight: $font-weight-regular;
    color: $color-gray-600;
    text-align: left;
  }

  &__aside {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__badges {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.778rem;
  }

  &__badge {
    border-radius: 999rem;
    padding: 0.889rem 1rem;
    text-align: center;
    font-size: 0.944rem; // 17px
    font-family: $font-inter;
    font-weight: $font-weight-medium;
    color: $color-black;
    background: $color-white-light;
    border: 1px solid rgba(44, 44, 44, 0.1);

    &--secondary {
      background: rgba(136, 255, 246, 0.18);
      border-color: rgba(136, 255, 246, 0.34);
    }
  }

  &__media {
    position: relative;
    width: 100%;
    border-radius: 1.333rem;
    overflow: hidden;
    background: $color-black-dark;
    border: 1px solid rgba(44, 44, 44, 0.12);

    // Вертикальные пропорции (примерно 9:16).
    &::before {
      content: "";
      display: block;
      padding-top: 177.78%;
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

    .home-how-it-works__note {
      color: rgba(255, 255, 255, 0.6);
    }

    .home-how-it-works__badge {
      color: $color-white-light;
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.12);

      &--secondary {
        background: rgba(136, 255, 246, 0.12);
        border-color: rgba(136, 255, 246, 0.28);
        color: $color-white-light;
      }
    }

    .home-how-it-works__media {
      border-color: rgba(255, 255, 255, 0.14);
    }
  }

  @include layout-aspect-tablet {
    &__grid {
      grid-template-columns: minmax(0, 1fr) 20rem;
    }
  }

  @include layout-aspect-mobile {
    &__content {
      max-width: 42rem;
      padding: 1.333rem;
    }

    &__grid {
      grid-template-columns: 1fr;
    }

    &__note {
      text-align: center;
    }

    &__media {
      max-width: 20rem;
      margin: 0 auto;
    }
  }
}
</style>
