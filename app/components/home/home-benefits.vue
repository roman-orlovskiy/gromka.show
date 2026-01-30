<template>
  <section class="home-benefits" :class="rootClasses">
    <div class="home-benefits__content">
      <div class="home-benefits__inline">
        <div class="home-benefits__inline-inner">
          <div class="home-benefits__titles">
            <span class="home-benefits__title">{{ t('benefits.title') }}</span>
            <span class="home-benefits__title">{{ t('benefits.forWhom.title') }}</span>
          </div>

          <div class="home-benefits__lines">
            <div
              v-for="(row, idx) in tableRows"
              :key="idx"
              class="home-benefits__line"
              :class="[
                rowClasses[idx],
              { 'home-benefits__line--primary': idx === 2 }
              ]"
            >
              <span
                class="home-benefits__line-text"
                v-html="`${row.left} — ${row.right}`"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="home-benefits__mouse" @click="emit('next')">
        <img class="home-benefits__mouse-icon" :src="mouseIcon" alt="" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
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
  'home-benefits--dark': settingsStore.isDarkTheme
}))

const items = computed(() => [
  t('benefits.items.0'),
  t('benefits.items.1'),
  t('benefits.items.2'),
  t('benefits.items.3')
])

const forWhomItems = computed(() => [
  t('benefits.forWhom.items.0'),
  t('benefits.forWhom.items.1'),
  t('benefits.forWhom.items.2'),
  t('benefits.forWhom.items.3')
])

const tableRows = computed(() => (
  items.value.map((left, idx) => ({
    left,
    right: forWhomItems.value[idx] ?? ''
  }))
))

// Вычисляемые классы для элементов списка (появляются с паузой 350мс каждый)
// Логика как в других слайдах: phase 0 = всё видно, большая phase = скрыто
// idx=0 (первый) скрывается при phase >= 4, idx=3 (последний) скрывается при phase >= 1
const rowClasses = computed(() =>
  tableRows.value.map((_, idx) => ({
    'home-benefits__line--hidden': (props.phase ?? 0) >= (tableRows.value.length - idx)
  }))
)
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.home-benefits {
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
    max-width: 100rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  &__inline {
    width: 100%;
    max-width: 72rem;
    margin: 0 auto;
    display: flex;
    justify-content: center;
  }

  &__inline-inner {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    width: max-content;
    max-width: 100%;
    text-align: left;
  }

  &__titles {
    display: flex;
    justify-content: flex-start;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    width: 100%;
  }

  &__title {
    font-size: 2.7rem;
    color: $color-primary;
    font-weight: $font-weight-medium;
    font-family: $font-default;
    text-align: left;
    line-height: 1.15;
  }

  &__lines {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: max-content;
    max-width: 100%;
    align-self: center;
  }

  &__line {
    font-size: 1rem;
    font-family: $font-inter;
    font-weight: $font-weight-regular;
    line-height: 1.6;
    color: $color-black;
    text-align: left;
    transform: translateY(0);
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity, transform;

    &--hidden {
      opacity: 0;
      transform: translateY(2rem);
      pointer-events: none;
    }

    &--secondary {
      color: $color-secondary;
    }

    &--primary {
      color: $color-primary;
    }
  }

  &__line-text {
    min-width: 0;
    word-break: break-word;
    white-space: nowrap;
  }

  &--dark {
    color: $color-white;

    .home-benefits__line {
      color: $color-white;
    }
    
    .home-benefits__line--secondary {
      color: $color-secondary;
    }

    .home-benefits__line--primary {
      color: $color-primary;
    }
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

  @include layout-aspect-mobile {
    &__content {
      max-width: 42rem;
      padding: 1.333rem;
    }

    &__titles {
      justify-content: center;
      gap: 1rem;
      text-align: center;
      margin-bottom: 3rem;
    }

    &__title {
      font-size: 2.143rem;
    }

    &__line {
      font-size: 1.2rem;
    }

    &__line-text {
      white-space: normal;
    }
  }
}
</style>
