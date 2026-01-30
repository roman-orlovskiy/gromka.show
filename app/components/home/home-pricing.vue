<template>
  <section class="home-pricing" :class="rootClasses">
    <div class="home-pricing__content">
      <h2 class="home-pricing__title">{{ t('pricing.title') }}</h2>
      <div class="home-pricing__grid">
        <article
          v-for="(plan, idx) in plans"
          :key="plan.key"
          class="home-pricing__plan"
          :class="planClasses[idx]"
        >
          <h3 class="home-pricing__plan-title">{{ plan.title }}</h3>
          <div class="home-pricing__plan-price" v-html="plan.price" />
          <p class="home-pricing__plan-text" v-html="plan.text" />
          <span class="home-pricing__plan-icon" aria-hidden="true">
            <PricingSimpleIcon
              v-if="plan.key === 'simple'"
              class="home-pricing__plan-icon-svg"
              aria-hidden="true"
            />
            <PricingWavesIcon
              v-else-if="plan.key === 'waves'"
              class="home-pricing__plan-icon-svg"
              aria-hidden="true"
            />
            <PricingBrandIcon
              v-else-if="plan.key === 'brand'"
              class="home-pricing__plan-icon-svg"
              aria-hidden="true"
            />
            <span
              v-else
              class="home-pricing__plan-icon-mask"
              aria-hidden="true"
            />
          </span>
        </article>
      </div>

      <div class="home-pricing__mouse" @click="emit('next')">
        <img class="home-pricing__mouse-icon" :src="mouseIcon" alt="" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import PricingSimpleIcon from '@/components/icons/pricing-simple-icon.vue'
import PricingWavesIcon from '@/components/icons/pricing-waves-icon.vue'
import PricingBrandIcon from '@/components/icons/pricing-brand-icon.vue'
import mouseIcon from '@/assets/icons/mouse.svg'

const { t } = useI18n()
const settingsStore = useSettingsStore()

const emit = defineEmits<{
  (e: 'next'): void
}>()

const props = defineProps<{
  phase?: number
}>()

const rootClasses = computed(() => ({
  'home-pricing--dark': settingsStore.isDarkTheme
}))

type PricingPlanKey = 'simple' | 'waves' | 'brand'
type PricingPlan = {
  key: PricingPlanKey
  title: string
  price: string
  text: string
}

const plans = computed<ReadonlyArray<PricingPlan>>(() => ([
  {
    key: 'simple',
    title: t('pricing.plans.simple.title'),
    price: t('pricing.plans.simple.price'),
    text: t('pricing.plans.simple.text')
  },
  {
    key: 'waves',
    title: t('pricing.plans.waves.title'),
    price: t('pricing.plans.waves.price'),
    text: t('pricing.plans.waves.text')
  },
  {
    key: 'brand',
    title: t('pricing.plans.brand.title'),
    price: t('pricing.plans.brand.price'),
    text: t('pricing.plans.brand.text')
  }
]))

// Логика как в других слайдах: phase 0 = всё видно, большая phase = скрыто.
// Чтобы на enter карточки появлялись по порядку (1->2->3),
// используем порог в зависимости от индекса: phase >= (len - idx).
const planClasses = computed(() => {
  const len = plans.value.length
  return plans.value.map((plan, idx) => ({
    'home-pricing__plan--hidden': (props.phase ?? 0) >= (len - idx),
    'home-pricing__plan--primary': plan.key === 'brand'
  }))
})
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.home-pricing {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-black;

  &__content {
    text-align: center;
    padding: 1.538rem; // 2rem / 1.3 ≈ 1.538rem
    width: 100%;
    max-width: 36rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.538rem; // 2rem / 1.3 ≈ 1.538rem
  }

  &__title {
    margin: 0;
    font-size: 2.7rem;
    color: $color-primary;
    font-weight: $font-weight-medium;
    font-family: $font-default;
  }

  &__grid {
    width: 100%;
    max-width: 28rem;
    display: flex;
    flex-direction: column;
    gap: 0.769rem; // 1rem / 1.3 ≈ 0.769rem
  }

  &__plan {
    position: relative;
    overflow: hidden;
    border-radius: 0.342rem; // 0.444rem / 1.3 ≈ 0.342rem
    padding: 0.94rem 7rem 0.94rem 0.854rem; // /1.3
    background: $color-white-light;
    border: 1px solid rgba(44, 44, 44, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0.513rem; // 0.667rem / 1.3 ≈ 0.513rem
    text-align: left;
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity, transform;
    --pricing-icon-color: #{$color-primary-light};
    --pricing-icon-opacity: 0.18;

    &--hidden {
      opacity: 0;
      transform: translateX(3rem);
      pointer-events: none;
    }

    &--primary {
      background: $color-primary;
      border-color: rgba(255, 255, 255, 0.22);
      color: $color-white;
      --pricing-icon-color: #{$color-white};
      --pricing-icon-opacity: 0.35;
    }
  }

  &__plan-icon {
    position: absolute;
    right: 0.854rem; // 1.111rem / 1.3 ≈ 0.854rem
    top: 50%;
    transform: translateY(-50%);
    width: 6.538rem; // 8.5rem / 1.3 ≈ 6.538rem
    height: 6.538rem; // 8.5rem / 1.3 ≈ 6.538rem
    display: block;
    opacity: var(--pricing-icon-opacity);
    pointer-events: none;
    user-select: none;
  }

  &__plan-icon-mask {
    width: 100%;
    height: 100%;
    display: block;
    background-color: var(--pricing-icon-color);
    -webkit-mask: url('@/assets/icons/mouse.svg') center / contain no-repeat;
    mask: url('@/assets/icons/mouse.svg') center / contain no-repeat;
  }

  &__plan-icon-svg {
    width: 100%;
    height: 100%;
    display: block;

    :deep(path) {
      fill: var(--pricing-icon-color);
    }
  }

  &__plan-title {
    margin: 0;
    font-size: 1.1rem; // 1.333rem / 1.3 ≈ 1.026rem
    font-family: $font-default;
    font-weight: $font-weight-medium;
    color: $color-black;
    line-height: 1.2;
  }

  &__plan-price {
    font-size: 1rem; // 1.111rem / 1.3 ≈ 0.854rem
    font-family: $font-inter;
    font-weight: $font-weight-bold;
    color: $color-primary;
    line-height: 1.2;
  }

  &__plan--primary .home-pricing__plan-price {
    color: $color-secondary;
  }

  &__plan-text {
    margin: 0;
    font-size: 0.8rem; // 0.926rem / 1.3 ≈ 0.712rem
    font-family: $font-inter;
    font-weight: $font-weight-regular;
    color: $color-gray-700;
    line-height: 1.6;
  }

  &__mouse {
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

    .home-pricing__plan {
      background: $color-black-light;
      border-color: rgba(255, 255, 255, 0.12);

      &--primary {
        background: $color-primary;
        border-color: rgba(255, 255, 255, 0.22);
        color: $color-white;
      }
    }

    .home-pricing__plan-title {
      color: $color-white-light;
    }

    .home-pricing__plan-price {
      color: $color-primary;
    }

    .home-pricing__plan-text {
      color: rgba(255, 255, 255, 0.78);
    }

    .home-pricing__plan--primary .home-pricing__plan-title,
    .home-pricing__plan--primary .home-pricing__plan-text {
      color: $color-white;
    }

    .home-pricing__plan--primary .home-pricing__plan-price {
      color: $color-secondary;
    }
  }

  @include layout-aspect-mobile {
    &__content {
      max-width: 42rem;
      padding: 1.025rem; // 1.333rem / 1.3 ≈ 1.025rem
    }

    &__title {
      font-size: 2.572rem; // 2.143rem * 1.2
    }

    &__grid {
      gap: 0.684rem; // 0.889rem / 1.3 ≈ 0.684rem
    }

    &__plan {
      padding-right: 4.038rem; // 5.25rem / 1.3 ≈ 4.038rem
    }

    &__plan-icon {
      right: 0.684rem; // 0.889rem / 1.3 ≈ 0.684rem
      width: 5.385rem; // 7rem / 1.3 ≈ 5.385rem
      height: 5.385rem; // 7rem / 1.3 ≈ 5.385rem
    }

    &__plan-title {
      font-size: 1.121rem; // 0.934rem * 1.2
    }

    &__plan-price {
      font-size: 0.989rem; // 0.824rem * 1.2
    }

    &__plan-text {
      font-size: 0.858rem; // 0.715rem * 1.2
    }
  }
}
</style>
