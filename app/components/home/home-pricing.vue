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
          <div class="home-pricing__plan-price">{{ plan.price }}</div>
          <p class="home-pricing__plan-text">{{ plan.text }}</p>
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
    </div>
  </section>
</template>

<script setup lang="ts">
import PricingSimpleIcon from '@/components/icons/pricing-simple-icon.vue'
import PricingWavesIcon from '@/components/icons/pricing-waves-icon.vue'
import PricingBrandIcon from '@/components/icons/pricing-brand-icon.vue'

const { t } = useI18n()
const settingsStore = useSettingsStore()

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
    padding: 2rem;
    width: 100%;
    max-width: 37.333rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
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
    max-width: 37.333rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__plan {
    position: relative;
    overflow: hidden;
    border-radius: 0.444rem;
    padding: 1.222rem 6.5rem 1.222rem 1.111rem;
    background: $color-white-light;
    border: 1px solid rgba(44, 44, 44, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0.667rem;
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
    right: 1.111rem;
    top: 50%;
    transform: translateY(-50%);
    width: 8.5rem;
    height: 8.5rem;
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
    font-size: 1.333rem;
    font-family: $font-default;
    font-weight: $font-weight-medium;
    color: $color-black;
    line-height: 1.2;
  }

  &__plan-price {
    font-size: 1.111rem;
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
    font-size: 0.926rem;
    font-family: $font-inter;
    font-weight: $font-weight-regular;
    color: $color-gray-700;
    line-height: 1.6;
    white-space: pre-line;
  }

  &--dark {
    color: $color-white;

    .home-pricing__plan {
      background: rgba(255, 255, 255, 0.06);
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
      padding: 1.333rem;
    }

    &__title {
      font-size: 2.143rem;
    }

    &__grid {
      gap: 0.889rem;
    }

    &__plan {
      padding-right: 5.25rem;
    }

    &__plan-icon {
      right: 0.889rem;
      width: 7rem;
      height: 7rem;
    }

    &__plan-title {
      font-size: 1.214rem;
    }

    &__plan-price {
      font-size: 1.071rem;
    }

    &__plan-text {
      font-size: 0.929rem;
    }
  }
}
</style>
