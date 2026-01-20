<template>
  <div class="home">
    <div class="home__carousel">
      <div class="carousel">
        <div class="carousel__container">
          <div
            v-for="(slide, index) in slides"
            :key="index"
            class="carousel__slide"
            :class="carouselSlideClasses(index)"
          >
            <div class="carousel__content">
              <button
                class="carousel__button"
                :class="`carousel__button--${slide.buttonMod}`"
              >
                {{ slide.buttonText }}
              </button>
              <h3 class="carousel__title">{{ slide.title }}</h3>
              <p class="carousel__description">{{ slide.description }}</p>
            </div>
          </div>
        </div>

        <button
          class="carousel__nav carousel__nav--prev"
          @click="prevSlide"
          :disabled="!canNavigate"
        >
          ‹
        </button>
        <button
          class="carousel__nav carousel__nav--next"
          @click="nextSlide"
          :disabled="!canNavigate"
        >
          ›
        </button>

        <div class="carousel__pagination">
          <button
            v-for="(slide, index) in slides"
            :key="`pagination-${index}`"
            class="carousel__pagination-bullet"
            :class="{ 'carousel__pagination-bullet--active': index === currentSlide }"
            @click="goToSlide(index)"
          />
        </div>
      </div>
    </div>

    <h1 class="home__title">Игровые виджеты для вашего сайта</h1>
    
    <ul class="home__description">
      <li class="home__description-item">Легко интегрируйте игровые виджеты на свой сайт</li>
      <li class="home__description-item">Увеличьте вовлеченность пользователей с помощью интерактивных игр</li>
      <li class="home__description-item">Простая настройка и быстрый запуск</li>
    </ul>

    <div class="home__buttons">
      <button class="home__button home__button--gradient-3">
        Играть
      </button>
      <button class="home__button home__button--gradient-5">
        Каталог виджетов
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const currentSlide = ref(0)
const isAutoplayEnabled = ref(true)
const canNavigate = ref(true)
let autoplayInterval = null

const slides = [
  {
    buttonText: 'Начать игру',
    buttonMod: 'gradient-3',
    title: 'Игровые виджеты',
    description: 'Увлекательные игры для вашего сайта'
  },
  {
    buttonText: 'Интегрировать',
    buttonMod: 'gradient-5',
    title: 'Простая интеграция',
    description: 'Быстрое внедрение на любой сайт'
  },
  {
    buttonText: 'Узнать больше',
    buttonMod: 'gradient-4',
    title: 'Увеличение вовлеченности',
    description: 'Привлекайте больше пользователей'
  }
]

const carouselSlideClasses = computed(() => {
  return (index) => ({
    'carousel__slide--active': index === currentSlide.value
  })
})

const nextSlide = () => {
  if (!canNavigate.value) return
  currentSlide.value = (currentSlide.value + 1) % slides.length
  resetAutoplay()
}

const prevSlide = () => {
  if (!canNavigate.value) return
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
  resetAutoplay()
}

const goToSlide = (index) => {
  currentSlide.value = index
  resetAutoplay()
}

const startAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
  }
  autoplayInterval = setInterval(() => {
    if (isAutoplayEnabled.value) {
      nextSlide()
    }
  }, 3000)
}

const resetAutoplay = () => {
  isAutoplayEnabled.value = false
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
  }
  startAutoplay()
  setTimeout(() => {
    isAutoplayEnabled.value = true
  }, 3000)
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
  }
})
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  padding-top: 0;
  height: 100vh;
  overflow-y: auto;
  position: relative;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  &__carousel {
    width: 100%;
    max-width: 75rem;
    margin: 0 auto;
    padding: 2rem 0;
  }

  &__title {
    margin-bottom: 2rem;
    text-align: center;
    font-size: 4.4rem;
    font-weight: bold;
  }

  &__description {
    text-align: left;
    font-size: 2.2rem;
    line-height: 1.6;
    margin-bottom: 3rem;
    padding-left: 10rem;
    list-style-position: inside;

    &-item {
      margin-bottom: 0.5rem;
    }
  }

  &__buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
  }

  &__button {
    min-width: 200px;
    padding: 1rem 2rem;
    font-size: 1.6rem;
    font-weight: bold;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }

    &--gradient-3 {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &--gradient-5 {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
  }
}

.carousel {
  position: relative;
  width: 100%;
  height: 25rem;
  border-radius: 0.75rem;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  &__container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  &__slide {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;

    &--active {
      opacity: 1;
      pointer-events: auto;
    }
  }

  &__content {
    text-align: center;
    padding: 2rem;
    color: white;
  }

  &__button {
    margin-bottom: 2rem;
    padding: 1rem 2rem;
    font-size: 1.6rem;
    font-weight: bold;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }

    &--gradient-3 {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &--gradient-4 {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }

    &--gradient-5 {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
  }

  &__title {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }

  &__description {
    font-size: 1.2rem;
    opacity: 0.9;
  }

  &__nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: white;
    font-size: 2.5rem;
    font-weight: bold;
    width: 3rem;
    height: 3rem;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;

    &:hover:not(:disabled) {
      color: rgba(255, 255, 255, 0.8);
      transform: translateY(-50%) scale(1.1);
    }

    &:disabled {
      opacity: 0.35;
      cursor: auto;
      pointer-events: none;
    }

    &--prev {
      left: 1rem;
    }

    &--next {
      right: 1rem;
    }
  }

  &__pagination {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    z-index: 10;

    &-bullet {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      background: white;
      opacity: 0.5;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;

      &:hover {
        opacity: 0.8;
      }

      &--active {
        opacity: 1;
        transform: scale(1.2);
      }
    }
  }
}
</style>
