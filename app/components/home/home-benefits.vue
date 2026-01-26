<template>
  <section class="home-benefits" :class="rootClasses">
    <div class="home-benefits__content">
      <h2 class="home-benefits__title">{{ t('benefits.title') }}</h2>
      <ul class="home-benefits__list">
        <li
          v-for="(item, idx) in items"
          :key="idx"
          class="home-benefits__item"
          :class="[
            itemClasses[idx],
            { 'home-benefits__item--secondary': idx === 1 }
          ]"
        >
          {{ item }}
        </li>
      </ul>

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

// Вычисляемые классы для элементов списка (появляются с паузой 350мс каждый)
// Логика как в других слайдах: phase 0 = всё видно, большая phase = скрыто
// idx=0 (первый) скрывается при phase >= 4, idx=3 (последний) скрывается при phase >= 1
const itemClasses = computed(() => 
  items.value.map((_, idx) => ({
    'home-benefits__item--hidden': (props.phase ?? 0) >= (items.value.length - idx)
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
    max-width: 56rem;
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

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1.333rem;
    width: 100%;
    max-width: 41.8rem;
  }

  &__item {
    font-size: 1.389rem;
    font-family: $font-inter;
    font-weight: $font-weight-regular;
    color: $color-black;
    line-height: 1.6;
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
  }

  &--dark {
    color: $color-white;

    .home-benefits__item {
      color: $color-white;

      &--secondary {
        color: $color-secondary;
      }
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

    &__title {
      font-size: 2.143rem;
    }

    &__item {
      font-size: 1.143rem;
    }
  }
}
</style>
