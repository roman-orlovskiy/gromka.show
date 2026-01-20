<template>
  <div class="performance">
    <!-- Hero Section -->
    <section class="performance__hero">
      <LanguageSwitcher />

      <h1 class="performance__title">{{ t('performance.title') }}</h1>
      <p class="performance__subtitle" v-html="subtitleHtml"></p>
      <div class="performance__hero-video">
        <video class="performance__video" autoplay loop muted src="/videos/gromka.mp4" type="video/mp4">
        {{ t('performance.videoNotSupported') }}
      </video>
    </div>
      <button @click="scrollToProject" class="performance__cta-link">
        <AppButton variant="secondary">{{ t('performance.ctaButton') }}</AppButton>
      </button>
    </section>

    <!-- What is it Section -->
    <section id="what-is-project" class="performance__section performance__section--gradient-1">
      <div class="performance__container">
        <div class="performance__content">
          <div class="performance__text">
            <p>{{ t('performance.whatIsProject.description') }}</p>
            <ul class="performance__list">
              <li>● <strong>{{ t('performance.whatIsProject.features.colorful') }}</strong></li>
              <li>● <strong>{{ t('performance.whatIsProject.features.dynamic') }}</strong></li>
              <li>● <strong>{{ t('performance.whatIsProject.features.waves') }}</strong></li>
            </ul>
          </div>
          <div class="performance__image-container">
            <img
              src="/images/home/1.webp"
              :alt="t('performance.whatIsProject.description')"
              class="performance__image"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Demo Section -->
    <section class="performance__section performance__section--demo">
      <div class="performance__container">
        <h2 class="performance__section-title">{{ t('performance.demo.title') }}</h2>
        <p class="performance__demo-description">
          {{ t('performance.demo.description') }}
        </p>
      </div>
      <div class="performance__video-block">
        <div class="performance__video-container" @click="toggleVideo2">
          <video
            ref="verticalVideo2"
            class="performance__vertical-video"
            src="/videos/ai_presentation.mp4"
            type="video/mp4"
            loop
            @play="onVideoPlay2"
            @pause="onVideoPause2"
            @ended="onVideoEnded2"
          >
            {{ t('performance.videoNotSupported') }}
          </video>
          <button
            v-if="!isVideoPlaying2"
            class="performance__play-button"
          >
            {{ videoStarted2 ? t('performance.demo.continue') : t('performance.demo.play') }}
          </button>
          <button
            v-else
            class="performance__pause-button"
          >
            {{ t('performance.demo.pause') }}
          </button>
          <button
            class="performance__fullscreen-button"
            @click.stop="toggleFullscreen2"
            :title="t('performance.demo.fullscreen')"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3m-5 13h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <button @click="openDemoModal" class="performance__demo-link">
        <AppButton>{{ t('performance.demo.button') }}</AppButton>
      </button>
    </section>

    <!-- Stadium Photo Section -->
    <section class="performance__section performance__section--stadium">
      <div class="performance__container">
        <h2 class="performance__section-title">{{ t('performance.stadium.title') }}</h2>
        <div class="performance__stadium-block">
          <div class="performance__stadium-preview">
            <div class="performance__image-container performance__image-container--large performance__image-container--clickable" @click="openSpartakGallery(0)">
              <img
                :src="spartakGalleryImages[0]?.src"
                :alt="spartakGalleryImages[0]?.alt"
                class="performance__image"
              />
              <button class="performance__arrow performance__arrow--left" @click.stop="prevSpartakPhoto">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="performance__arrow performance__arrow--right" @click.stop="nextSpartakPhoto">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="performance__stadium-info">
            <p>{{ t('performance.stadium.description') }}</p>
          </div>
        </div>
        <div class="performance__video-block">
          <div class="performance__video-container" @click="toggleVideo">
            <video
              ref="verticalVideo"
              class="performance__vertical-video"
              src="/videos/demo.mp4"
              type="video/mp4"
              loop
              @play="onVideoPlay"
              @pause="onVideoPause"
              @ended="onVideoEnded"
            >
              {{ t('performance.videoNotSupported') }}
            </video>
            <button
              v-if="!isVideoPlaying"
              class="performance__play-button"
            >
              {{ videoStarted ? t('performance.stadium.continue') : t('performance.stadium.play') }}
            </button>
            <button
              v-else
              class="performance__pause-button"
            >
              {{ t('performance.stadium.pause') }}
            </button>
            <button
              class="performance__fullscreen-button"
              @click.stop="toggleFullscreen"
              :title="t('performance.stadium.fullscreen')"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3m-5 13h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>

<!-- Advantages Section -->
    <section class="performance__section performance__section--gradient-2">
      <div class="performance__container">
        <h2 class="performance__section-title">{{ t('performance.advantages.title') }}</h2>
        <div class="performance__grid">
          <div class="performance__card">
            <div class="performance__card-icon">▲</div>
            <h3 class="performance__card-title">{{ t('performance.advantages.scalability.title') }}</h3>
            <p>{{ t('performance.advantages.scalability.description') }}</p>
          </div>
          <div class="performance__card">
            <div class="performance__card-icon">◆</div>
            <h3 class="performance__card-title">{{ t('performance.advantages.simplicity.title') }}</h3>
            <p>{{ t('performance.advantages.simplicity.description') }}</p>
          </div>
          <div class="performance__card">
            <div class="performance__card-icon">★</div>
            <h3 class="performance__card-title">{{ t('performance.advantages.visual.title') }}</h3>
            <p>{{ t('performance.advantages.visual.description') }}</p>
          </div>
          <div class="performance__card">
            <div class="performance__card-icon">◉</div>
            <h3 class="performance__card-title">{{ t('performance.advantages.flexibility.title') }}</h3>
            <p>{{ t('performance.advantages.flexibility.description') }}</p>
          </div>
          <div class="performance__card performance__card--highlighted performance__card--clickable" @click="scrollToMonetization">
            <div class="performance__card-icon">■</div>
            <h3 class="performance__card-title">{{ t('performance.advantages.monetization.title') }}</h3>
            <p>{{ t('performance.advantages.monetization.description') }}</p>
          </div>
          <div class="performance__card">
            <div class="performance__card-icon">●</div>
            <h3 class="performance__card-title">{{ t('performance.advantages.interaction.title') }}</h3>
            <p>{{ t('performance.advantages.interaction.description') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Monetization Section -->
    <section id="monetization" class="performance__section performance__section--success">
      <div class="performance__container">
        <h2 class="performance__section-title">{{ t('performance.monetization.title') }}</h2>
        <div class="performance__grid performance__grid--four-cols">
          <div class="performance__monetization-card">
            <div class="performance__monetization-icon">◆</div>
            <h3>{{ t('performance.monetization.specialProjects.title') }}</h3>
            <p>{{ t('performance.monetization.specialProjects.description') }}</p>
          </div>
          <div class="performance__monetization-card">
            <div class="performance__monetization-icon">◉</div>
            <h3>{{ t('performance.monetization.advertising.title') }}</h3>
            <p>{{ t('performance.monetization.advertising.description') }}</p>
          </div>
          <div class="performance__monetization-card">
            <div class="performance__monetization-icon">■</div>
            <h3>{{ t('performance.monetization.souvenirs.title') }}</h3>
            <p>{{ t('performance.monetization.souvenirs.description') }}</p>
          </div>
          <div class="performance__monetization-card">
            <div class="performance__monetization-icon">▲</div>
            <h3>{{ t('performance.monetization.bets.title') }}</h3>
            <p>{{ t('performance.monetization.bets.description') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Target Audience Section -->
    <section class="performance__section performance__section--gradient-3">
      <div class="performance__container">
        <h2 class="performance__section-title">{{ t('performance.targetAudience.title') }}</h2>
        <div class="performance__grid performance__grid--two-cols">
          <div class="performance__target-card">
            <div class="performance__target-icon">♪</div>
            <h3>{{ t('performance.targetAudience.concerts.title') }}</h3>
            <p>{{ t('performance.targetAudience.concerts.description') }}</p>
          </div>
          <div class="performance__target-card">
            <div class="performance__target-icon">◈</div>
            <h3>{{ t('performance.targetAudience.sports.title') }}</h3>
            <p>{{ t('performance.targetAudience.sports.description') }}</p>
          </div>
          <div class="performance__target-card">
            <div class="performance__target-icon">◐</div>
            <h3>{{ t('performance.targetAudience.theater.title') }}</h3>
            <p>{{ t('performance.targetAudience.theater.description') }}</p>
          </div>
          <div class="performance__target-card">
            <div class="performance__target-icon">▶</div>
            <h3>{{ t('performance.targetAudience.marketing.title') }}</h3>
            <p>{{ t('performance.targetAudience.marketing.description') }}</p>
          </div>
          <div class="performance__target-card">
            <div class="performance__target-icon">◆</div>
            <h3>{{ t('performance.targetAudience.political.title') }}</h3>
            <p>{{ t('performance.targetAudience.political.description') }}</p>
          </div>
          <div class="performance__target-card">
            <div class="performance__target-icon">◉</div>
            <h3>{{ t('performance.targetAudience.public.title') }}</h3>
            <p>{{ t('performance.targetAudience.public.description') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- What is it like Section -->
    <section class="performance__section performance__section--gradient-4">
      <div class="performance__container">
        <h2 class="performance__section-title">{{ t('performance.comparison.title') }}</h2>
        <div class="performance__comparison">
          <div class="performance__comparison-item">
            <div class="performance__image-container performance__image-container--clickable" @click="openGallery(0)">
              <img
                src="/images/home/refs/img1.webp"
                :alt="t('performance.comparison.lightShows.description')"
                class="performance__image"
              />
            </div>
            <h3>{{ t('performance.comparison.lightShows.title') }}</h3>
            <p>{{ t('performance.comparison.lightShows.description') }}</p>
          </div>
          <div class="performance__comparison-item">
            <div class="performance__image-container performance__image-container--clickable" @click="openGallery(1)">
              <img
                src="/images/home/refs/img2.webp"
                :alt="t('performance.comparison.drones.description')"
                class="performance__image"
              />
            </div>
            <h3>{{ t('performance.comparison.drones.title') }}</h3>
            <p>{{ t('performance.comparison.drones.description') }}</p>
          </div>
          <div class="performance__comparison-item">
            <div class="performance__image-container performance__image-container--clickable" @click="openGallery(2)">
              <img
                src="/images/home/refs/img3.webp"
                :alt="t('performance.comparison.interactive.description')"
                class="performance__image performance__image--shifted-up"
              />
            </div>
            <h3>{{ t('performance.comparison.interactive.title') }}</h3>
            <p>{{ t('performance.comparison.interactive.description') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Goal Section -->
    <section class="performance__section performance__section--accent">
      <div class="performance__container">
        <h2 class="performance__section-title">{{ t('performance.goal.title') }}</h2>
        <div class="performance__goal">
          <p class="performance__goal-text">
            {{ t('performance.goal.text') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="performance__section performance__section--primary">
      <div class="performance__container">
        <div class="performance__team">
          <div class="performance__team-item">
            <div class="performance__team-photo">
              <img src="/images/home/team/roman-orlovskiy.webp" :alt="t('performance.team.roman.name')" />
            </div>
            <h3>{{ t('performance.team.roman.name') }}</h3>
            <p>{{ t('performance.team.roman.role') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="performance__cta">
      <div class="performance__container">
        <h2 class="performance__cta-title">{{ t('performance.cta.title') }}</h2>
        <p class="performance__cta-text">{{ t('performance.cta.text') }}</p>
        <a href="https://t.me/orlovskiy_rl" target="_blank" class="performance__cta-link">
          <AppButton>{{ t('performance.cta.button') }}</AppButton>
        </a>
      </div>
    </section>

    <!-- Image Gallery for Spartak -->
    <ImageGallery
      :is-open="isSpartakGalleryOpen"
      :images="spartakGalleryImages"
      :initial-slide="spartakSlideIndex"
      @close="closeSpartakGallery"
    />

    <!-- Image Gallery for Similar Cases -->
    <ImageGallery
      :is-open="isGalleryOpen"
      :images="galleryImages"
      :initial-slide="currentSlide"
      @close="closeGallery"
    />

    <!-- Sticky CTA Button -->
    <transition name="slide-from-right">
      <a
        href="https://t.me/orlovskiy_rl"
        target="_blank"
        class="performance__sticky-cta"
        v-show="showStickyButton"
        :title="t('performance.cta.stickyButton')"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
        </svg>
      </a>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMainStore } from '@/stores/main'

const route = useRoute()
const mainStore = useMainStore()
const { t, setLanguage } = useI18n()

// Computed для subtitle с жирным текстом
const subtitleHtml = computed(() => {
  const subtitle = t('performance.subtitle')
  const boldText = t('performance.subtitleBold')
  return subtitle.replace('{{bold}}', `<b>${boldText}</b>`)
})

// Галерея изображений для Спартака
const isSpartakGalleryOpen = ref(false)
const spartakSlideIndex = ref(0)

const spartakGalleryImages = computed(() => {
  return [
    {
      src: '/images/home/spartak-2.webp',
      alt: t('performance.stadium.images.spartakRostov'),
      caption: t('performance.stadium.images.spartakRostov')
    },
    {
      src: '/images/home/spartak.webp',
      alt: t('performance.stadium.images.spartakRostov'),
      caption: t('performance.stadium.images.spartakRostov')
    },
    {
      src: '/images/home/spartak-1.webp',
      alt: t('performance.stadium.images.spartakRostov'),
      caption: t('performance.stadium.images.spartakRostov')
    },
    {
      src: '/images/home/spartak-3.webp',
      alt: t('performance.stadium.images.zfkSpartak'),
      caption: t('performance.stadium.images.zfkSpartak')
    }
  ]
})

const openSpartakGallery = (index = 0) => {
  spartakSlideIndex.value = index
  isSpartakGalleryOpen.value = true
}

const closeSpartakGallery = () => {
  isSpartakGalleryOpen.value = false
}

const nextSpartakPhoto = () => {
  openSpartakGallery(1)
}

const prevSpartakPhoto = () => {
  openSpartakGallery(3)
}

// Галерея изображений для аналогичных кейсов
const isGalleryOpen = ref(false)
const currentSlide = ref(0)

const galleryImages = computed(() => {
  return [
    {
      src: '/images/home/refs/img1.webp',
      alt: t('performance.comparison.lightShows.description'),
      caption: t('performance.comparison.lightShows.title') + ' - ' + t('performance.comparison.lightShows.description')
    },
    {
      src: '/images/home/refs/img2.webp',
      alt: t('performance.comparison.drones.description'),
      caption: t('performance.comparison.drones.description')
    },
    {
      src: '/images/home/refs/img3.webp',
      alt: t('performance.comparison.interactive.description'),
      caption: t('performance.comparison.interactive.description')
    }
  ]
})

const openGallery = (index: number) => {
  currentSlide.value = index
  isGalleryOpen.value = true
}

const closeGallery = () => {
  isGalleryOpen.value = false
}

const verticalVideo = ref<HTMLVideoElement | null>(null)
const isVideoPlaying = ref(false)
const videoStarted = ref(false)

const verticalVideo2 = ref<HTMLVideoElement | null>(null)
const isVideoPlaying2 = ref(false)
const videoStarted2 = ref(false)

const toggleVideo = () => {
  if (verticalVideo.value) {
    if (isVideoPlaying.value) {
      verticalVideo.value.pause()
      isVideoPlaying.value = false
    } else {
      // Останавливаем второе видео, если оно играет
      if (isVideoPlaying2.value && verticalVideo2.value) {
        verticalVideo2.value.pause()
        isVideoPlaying2.value = false
      }
      verticalVideo.value.play()
      isVideoPlaying.value = true
      videoStarted.value = true
    }
  }
}

const toggleVideo2 = () => {
  if (verticalVideo2.value) {
    if (isVideoPlaying2.value) {
      verticalVideo2.value.pause()
      isVideoPlaying2.value = false
    } else {
      // Останавливаем первое видео, если оно играет
      if (isVideoPlaying.value && verticalVideo.value) {
        verticalVideo.value.pause()
        isVideoPlaying.value = false
      }
      verticalVideo2.value.play()
      isVideoPlaying2.value = true
      videoStarted2.value = true
    }
  }
}

const scrollToProject = () => {
  const element = document.getElementById('what-is-project')
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

const toggleFullscreen = () => {
  if (verticalVideo.value) {
    verticalVideo.value.classList.add('fullscreen-video')

    if (verticalVideo.value.requestFullscreen) {
      verticalVideo.value.requestFullscreen()
    } else if ((verticalVideo.value as any).webkitRequestFullscreen) {
      (verticalVideo.value as any).webkitRequestFullscreen()
    } else if ((verticalVideo.value as any).msRequestFullscreen) {
      (verticalVideo.value as any).msRequestFullscreen()
    }
  }
}

const toggleFullscreen2 = () => {
  if (verticalVideo2.value) {
    verticalVideo2.value.classList.add('fullscreen-video')

    if (verticalVideo2.value.requestFullscreen) {
      verticalVideo2.value.requestFullscreen()
    } else if ((verticalVideo2.value as any).webkitRequestFullscreen) {
      (verticalVideo2.value as any).webkitRequestFullscreen()
    } else if ((verticalVideo2.value as any).msRequestFullscreen) {
      (verticalVideo2.value as any).msRequestFullscreen()
    }
  }
}

// Обработчик выхода из полноэкранного режима
const handleFullscreenChange = () => {
  if (verticalVideo.value && !document.fullscreenElement) {
    verticalVideo.value.classList.remove('fullscreen-video')
  }
  if (verticalVideo2.value && !document.fullscreenElement) {
    verticalVideo2.value.classList.remove('fullscreen-video')
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('msfullscreenchange', handleFullscreenChange)
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Проверяем сразу при загрузке

  // Проверяем query параметры для автоматического открытия демо и установки языка
  const demoParam = route.query.demo
  const langParam = route.query.lang

  // Устанавливаем язык, если указан в query
  if (langParam === 'ru' || langParam === 'en') {
    setLanguage(langParam)
  }

  // Открываем модальное окно демо, если demo=true
  if (demoParam === 'true') {
    // Небольшая задержка для корректной инициализации компонента
    setTimeout(() => {
      openDemoModal()
    }, 100)
  }
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('msfullscreenchange', handleFullscreenChange)
  window.removeEventListener('scroll', handleScroll)
})

const onVideoPlay = () => {
  isVideoPlaying.value = true
  videoStarted.value = true
}

const onVideoPause = () => {
  isVideoPlaying.value = false
}

const onVideoEnded = () => {
  isVideoPlaying.value = false
}

const onVideoPlay2 = () => {
  isVideoPlaying2.value = true
  videoStarted2.value = true
}

const onVideoPause2 = () => {
  isVideoPlaying2.value = false
}

const onVideoEnded2 = () => {
  isVideoPlaying2.value = false
}

const openDemoModal = () => {
  mainStore.openModal('demo')
}

const scrollToMonetization = () => {
  const element = document.getElementById('monetization')
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

// Sticky CTA button logic
const showStickyButton = ref(false)

const handleScroll = () => {
  const whatIsSection = document.getElementById('what-is-project')
  const ctaSection = document.querySelector('.performance__cta') as HTMLElement | null

  if (whatIsSection && ctaSection) {
    const whatIsSectionTop = whatIsSection.offsetTop
    const ctaSectionTop = ctaSection.offsetTop
    const scrollPosition = window.scrollY + window.innerHeight

    // Показываем кнопку после секции "Что это за проект" и скрываем, когда дошли до секции CTA
    showStickyButton.value = window.scrollY > whatIsSectionTop && scrollPosition < ctaSectionTop + 100
  }
}
</script>
<style lang="scss" scoped>
@use "@/assets/scss/performance-styles.scss";
</style>
