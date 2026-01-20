<template>
  <transition name="fade">
    <div v-if="isOpen" class="image-gallery" @click="closeGallery">
      <div class="image-gallery__content" @click.stop>
        <button class="image-gallery__close" @click="closeGallery">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <div class="image-gallery__slider">
          <div 
            v-for="(image, index) in images" 
            :key="index"
            v-show="index === currentSlideIndex"
            class="image-gallery__slide"
          >
            <img 
              :src="image.src" 
              :alt="image.alt" 
              class="image-gallery__image"
              @dblclick="toggleZoom"
              :class="{ 'image-gallery__image--zoomed': isZoomed }"
            />
            <div class="image-gallery__caption">{{ image.caption }}</div>
          </div>

          <button 
            class="image-gallery__nav image-gallery__nav--prev"
            @click="prevSlide"
            v-if="images.length > 1"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          
          <button 
            class="image-gallery__nav image-gallery__nav--next"
            @click="nextSlide"
            v-if="images.length > 1"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <div class="image-gallery__pagination" v-if="images.length > 1">
            <button
              v-for="(image, index) in images"
              :key="`pagination-${index}`"
              class="image-gallery__pagination-bullet"
              :class="{ 'image-gallery__pagination-bullet--active': index === currentSlideIndex }"
              @click="goToSlide(index)"
            />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Image {
  src: string
  alt: string
  caption: string
}

interface Props {
  isOpen: boolean
  images: Image[]
  initialSlide?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialSlide: 0
})

const emit = defineEmits<{
  close: []
}>()

const currentSlideIndex = ref(props.initialSlide)
const isZoomed = ref(false)

watch(() => props.initialSlide, (newValue) => {
  currentSlideIndex.value = newValue
  isZoomed.value = false
})

watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    isZoomed.value = false
  }
})

const closeGallery = () => {
  emit('close')
}

const nextSlide = () => {
  currentSlideIndex.value = (currentSlideIndex.value + 1) % props.images.length
  isZoomed.value = false
}

const prevSlide = () => {
  currentSlideIndex.value = (currentSlideIndex.value - 1 + props.images.length) % props.images.length
  isZoomed.value = false
}

const goToSlide = (index: number) => {
  currentSlideIndex.value = index
  isZoomed.value = false
}

const toggleZoom = () => {
  isZoomed.value = !isZoomed.value
}

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (!props.isOpen) return
  
  if (e.key === 'Escape') {
    closeGallery()
  } else if (e.key === 'ArrowLeft') {
    prevSlide()
  } else if (e.key === 'ArrowRight') {
    nextSlide()
  }
}

if (process.client) {
  watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeydown)
    } else {
      window.removeEventListener('keydown', handleKeydown)
    }
  })
}
</script>

<style lang="scss" scoped>
.image-gallery {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;

  &__content {
    width: 90%;
    height: 90%;
    max-width: 120rem;
    position: relative;
  }

  &__close {
    position: absolute;
    top: 2rem;
    right: 2rem;
    width: 4rem;
    height: 4rem;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    color: white;
    z-index: 100;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }

    svg {
      width: 2.4rem;
      height: 2.4rem;
    }
  }

  &__slider {
    width: 100%;
    height: 100%;
    position: relative;
  }

  &__slide {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 4rem;
  }

  &__image {
    max-width: 100%;
    max-height: calc(100% - 6rem);
    object-fit: contain;
    border-radius: 1rem;
    cursor: zoom-in;
    transition: transform 0.3s ease;

    &--zoomed {
      transform: scale(2);
      cursor: zoom-out;
    }
  }

  &__caption {
    margin-top: 2rem;
    color: white;
    font-size: 2rem;
    text-align: center;
    font-weight: 500;
  }

  &__nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 5rem;
    height: 5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    transition: all 0.3s ease;
    z-index: 10;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-50%) scale(1.1);
    }

    &:active {
      transform: translateY(-50%) scale(0.95);
    }

    svg {
      width: 2.4rem;
      height: 2.4rem;
    }

    &--prev {
      left: 2rem;
    }

    &--next {
      right: 2rem;
    }
  }

  &__pagination {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 1rem;
    z-index: 10;

    &-bullet {
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;

      &:hover {
        background: rgba(255, 255, 255, 0.8);
      }

      &--active {
        background: white;
        transform: scale(1.2);
      }
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
