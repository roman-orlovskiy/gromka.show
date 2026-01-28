<template>
  <div class="page">
    <div class="page__header" aria-hidden="true" />

    <div ref="contentRef" class="page__content" @wheel="handleWheel">
      <Transition
        :name="viewTransitionName"
        mode="out-in"
        @after-enter="handleAfterEnter"
      >
        <component :is="activeComponent" :key="activeViewId" v-bind="activeProps" />
      </Transition>
    </div>

    <footer class="page__footer">
      <!-- Полоса переключения слайдов в стиле YouTube (на всю ширину) -->
      <div class="slide-nav" aria-label="slides">
        <div ref="slideNavTrackRef" class="slide-nav__track" :style="slideNavStyle">
          <div ref="slideNavFillRef" class="slide-nav__fill" aria-hidden="true" />
          <button
            v-for="(viewId, index) in viewOrder"
            :key="viewId"
            :ref="(el) => setSegmentRef(el, index)"
            type="button"
            class="slide-nav__segment"
            :class="segmentClasses[index]"
            :aria-label="t(viewTitleKeys[index]!)"
            @click="goToView(viewId)"
          >
            <span class="slide-nav__label">
              {{ t(viewTitleKeys[index]!) }}
            </span>
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import HomeHero from '@/components/home/home-hero.vue'
import HomeAbout from '@/components/home/home-about.vue'
import HomeHowItWorks from '@/components/home/home-how-it-works.vue'
import HomeBenefits from '@/components/home/home-benefits.vue'
import HomePricing from '@/components/home/home-pricing.vue'
import HomeContacts from '@/components/home/home-contacts.vue'
import { delay } from '@/utils/delay'

const { t } = useI18n()
const mainStore = useMainStore()
const animationsStore = useAnimationsStore()

const viewOrder = ['hero', 'about', 'howItWorks', 'benefits', 'pricing', 'contacts'] as const
type ViewId = (typeof viewOrder)[number]

const activeViewId = ref<ViewId>(viewOrder[0])
const heroPhase = ref(0)
const howItWorksPhase = ref(0)
const benefitsPhase = ref(0)
const pricingPhase = ref(0)
const contactsPhase = ref(0)

// Синхронизация activeViewId со стором для хедера
watch(activeViewId, (newViewId) => {
  mainStore.setActiveViewId(newViewId)
}, { immediate: true })

let isAnimating = false
const lastNavDirection = ref<'down' | 'up'>('down')
const pendingEnterViewId = ref<ViewId | null>(null)

// Анимация "перетекания" по полосе навигации
const navIndex = ref(0)
const navAnimMs = ref(300)

const VIEW_TRANSITION_MS = 300
const AFTER_ENTER_UNLOCK_MS = 208

const slideNavTrackRef = ref<HTMLElement | null>(null)
const slideNavFillRef = ref<HTMLElement | null>(null)
const segmentRefs = ref<Array<HTMLElement | null>>([])
const contentRef = ref<HTMLElement | null>(null)

const handleWheel = (event: WheelEvent) => {
  if (Math.abs(event.deltaY) < 8) return

  const el = contentRef.value
  const direction: 'down' | 'up' = event.deltaY > 0 ? 'down' : 'up'

  // Если есть внутренний скролл и мы не на границе — даём браузеру скроллить контент.
  if (el) {
    const canScroll = el.scrollHeight > el.clientHeight + 1
    if (canScroll) {
      if (direction === 'down') {
        const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
        if (!isAtBottom) return
      } else {
        const isAtTop = el.scrollTop <= 1
        if (!isAtTop) return
      }
    }
  }

  // Иначе — переключаем слайд и блокируем прокрутку контейнера на этот wheel.
  event.preventDefault()
  void runScroll(direction)
}

const setSegmentRef = (el: unknown, index: number) => {
  const anyEl = el as any
  segmentRefs.value[index] = ((anyEl?.$el ?? anyEl) as HTMLElement | null)
}

const getRectRelativeToTrack = (el: HTMLElement) => {
  const track = slideNavTrackRef.value
  if (!track) return null
  const trackRect = track.getBoundingClientRect()
  const rect = el.getBoundingClientRect()
  return {
    left: rect.left - trackRect.left,
    width: rect.width
  }
}

const setFillToIndex = (index: number) => {
  const fill = slideNavFillRef.value
  const el = segmentRefs.value[index]
  const r = fill && el ? getRectRelativeToTrack(el) : null
  if (!fill || !r) return
  fill.style.transform = `translateX(${r.left}px)`
  fill.style.width = `${r.width}px`
}

const animateFill = (fromIndex: number, toIndex: number) => {
  const fill = slideNavFillRef.value
  const fromEl = segmentRefs.value[fromIndex]
  const toEl = segmentRefs.value[toIndex]
  if (!fill || !fromEl || !toEl) return

  const from = getRectRelativeToTrack(fromEl)
  const to = getRectRelativeToTrack(toEl)
  if (!from || !to) return

  const w = to.width
  const a = from.left
  const b = to.left
  const stretchLeft = Math.min(a, b)
  const stretchWidth = Math.abs(b - a) + w

  try {
    fill.getAnimations().forEach((a) => a.cancel())
  } catch {
    // ignore
  }

  fill.animate(
    [
      { transform: `translateX(${a}px)`, width: `${w}px` },
      { transform: `translateX(${stretchLeft}px)`, width: `${stretchWidth}px`, offset: 0.5 },
      { transform: `translateX(${b}px)`, width: `${w}px` }
    ],
    {
      duration: navAnimMs.value,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards'
    }
  )

  // фиксируем конечное состояние (после cancel/resize)
  fill.style.transform = `translateX(${b}px)`
  fill.style.width = `${w}px`
}

const handleScroll = (event: WheelEvent) => {
  if (Math.abs(event.deltaY) < 8) return
  const direction: 'down' | 'up' = event.deltaY > 0 ? 'down' : 'up'
  void runScroll(direction)
}

const activeIndex = computed(() => {
  const idx = viewOrder.indexOf(activeViewId.value)
  return idx === -1 ? 0 : idx
})

const viewTransitionName = computed(() => (lastNavDirection.value === 'down' ? 'view-up' : 'view-down'))

const activeComponent = computed(() => {
  if (activeViewId.value === 'hero') return HomeHero
  if (activeViewId.value === 'about') return HomeAbout
  if (activeViewId.value === 'howItWorks') return HomeHowItWorks
  if (activeViewId.value === 'benefits') return HomeBenefits
  if (activeViewId.value === 'pricing') return HomePricing
  return HomeContacts
})

const activeProps = computed(() => {
  if (activeViewId.value === 'hero') {
    return {
      phase: heroPhase.value,
      onNext: () => { void runScroll('down') }
    }
  }
  if (activeViewId.value === 'about') {
    return {
      onNext: () => { void runScroll('down') }
    }
  }
  if (activeViewId.value === 'howItWorks') {
    return {
      phase: howItWorksPhase.value,
      onNext: () => { void runScroll('down') }
    }
  }
  if (activeViewId.value === 'benefits') {
    return {
      phase: benefitsPhase.value,
      onNext: () => { void runScroll('down') }
    }
  }
  if (activeViewId.value === 'pricing') {
    return {
      phase: pricingPhase.value
    }
  }
  if (activeViewId.value === 'contacts') {
    return {
      phase: contactsPhase.value
    }
  }
  return {}
})

type TimelineStep = {
  phase: number
  delayAfterMs: number
  actions?: ReadonlyArray<{
    channel: string
    value: number
  }>
}

type ViewConfig = {
  id: ViewId
  timeline?: {
    phase: Ref<number>
    steps: ReadonlyArray<TimelineStep>
  }
}

const views: ViewConfig[] = [
  {
    id: 'hero',
    timeline: {
      phase: heroPhase,
      // 0: всё видно
      // 1: прячем title
      // 2: прячем text-block
      // 3: прячем button (fade)
      steps: [
        // header.hero:
        // 0 — свитчер по центру (логотип скрыт)
        // 1 — свитчер справа, логотип слева
        { phase: 0, delayAfterMs: 0, actions: [{ channel: 'header.hero', value: 0 }] },
        // В тот же момент, когда начинается первая анимация hero (phase=1), запускаем и анимацию хедера.
        { phase: 1, delayAfterMs: 250, actions: [{ channel: 'header.hero', value: 1 }] },
        { phase: 2, delayAfterMs: 400 },
        { phase: 3, delayAfterMs: 200 }
      ]
    }
  },
  { id: 'about' },
  {
    id: 'howItWorks',
    timeline: {
      phase: howItWorksPhase,
      // 0: всё видно
      // 1-3: прячем стикеры по очереди (100мс пауза)
      // 4-6: прячем шаги по очереди (100мс пауза)
      steps: [
        { phase: 0, delayAfterMs: 0 },
        { phase: 1, delayAfterMs: 100 },
        { phase: 2, delayAfterMs: 100 },
        { phase: 3, delayAfterMs: 100 },
        { phase: 4, delayAfterMs: 100 },
        { phase: 5, delayAfterMs: 100 },
        { phase: 6, delayAfterMs: 100 }
      ]
    }
  },
  {
    id: 'benefits',
    timeline: {
      phase: benefitsPhase,
      // 0: всё видно
      // 1-4: прячем элементы списка по очереди (350мс пауза)
      steps: [
        { phase: 0, delayAfterMs: 0 },
        { phase: 1, delayAfterMs: 350 },
        { phase: 2, delayAfterMs: 350 },
        { phase: 3, delayAfterMs: 350 },
        { phase: 4, delayAfterMs: 350 }
      ]
    }
  },
  {
    id: 'pricing',
    timeline: {
      phase: pricingPhase,
      // 0: всё видно
      // 1-3: прячем карточки по очереди (100мс пауза)
      steps: [
        { phase: 0, delayAfterMs: 0 },
        { phase: 1, delayAfterMs: 100 },
        { phase: 2, delayAfterMs: 100 },
        { phase: 3, delayAfterMs: 100 }
      ]
    }
  },
  {
    id: 'contacts',
    timeline: {
      phase: contactsPhase,
      // 0: всё видно
      // 1: скрываем контент (exit)
      steps: [
        { phase: 0, delayAfterMs: 0 },
        { phase: 1, delayAfterMs: 120 }
      ]
    }
  }
]

const getView = (id: ViewId) => views.find(v => v.id === id)

const playTimeline = async (
  timeline: NonNullable<ViewConfig['timeline']>,
  direction: 'forward' | 'reverse'
) => {
  const steps = direction === 'forward' ? [...timeline.steps] : [...timeline.steps].reverse()

  // первый шаг — это базовое состояние, проигрываем со второго
  for (const step of steps.slice(1)) {
    timeline.phase.value = step.phase
    if (step.actions) {
      for (const action of step.actions) {
        animationsStore.setChannel(action.channel, action.value)
      }
    }
    if (step.delayAfterMs > 0) {
      await delay(step.delayAfterMs)
    }
  }
}

const prepareEnter = (viewId: ViewId) => {
  const view = getView(viewId)
  const timeline = view?.timeline
  if (!timeline) return
  const last = timeline.steps[timeline.steps.length - 1]
  if (last) timeline.phase.value = last.phase
}

const playExit = async (viewId: ViewId) => {
  const timeline = getView(viewId)?.timeline
  if (!timeline) return
  await playTimeline(timeline, 'forward')
}

const playEnter = async (viewId: ViewId) => {
  const timeline = getView(viewId)?.timeline
  if (!timeline) return
  // enter = exit в обратном порядке (через reverse массива)
  await playTimeline(timeline, 'reverse')
}

const getTimelineDurationMs = (viewId: ViewId) => {
  const timeline = getView(viewId)?.timeline
  if (!timeline) return 0
  return timeline.steps.slice(1).reduce((sum, step) => sum + (step.delayAfterMs || 0), 0)
}

const setNavAnimationDuration = (fromViewId: ViewId, toViewId: ViewId, direction: 'down' | 'up') => {
  const exitMs = direction === 'down' ? getTimelineDurationMs(fromViewId) : 0
  const enterMs = getTimelineDurationMs(toViewId)
  navAnimMs.value = exitMs + VIEW_TRANSITION_MS + enterMs + AFTER_ENTER_UNLOCK_MS
}

const runScroll = async (direction: 'down' | 'up') => {
  if (isAnimating) return
  isAnimating = true

  let willChangeView = false

  if (direction === 'down') {
    const nextIndex = Math.min(activeIndex.value + 1, viewOrder.length - 1)
    const next = viewOrder[nextIndex]!
    if (next !== activeViewId.value) {
      setNavAnimationDuration(activeViewId.value, next, 'down')
      navIndex.value = nextIndex
      // уход с текущего слайда (если есть внутренние анимации)
      await playExit(activeViewId.value)
      // Подготавливаем "скрытое" состояние ДО монтирования (важно при mode="out-in")
      prepareEnter(next)
      // Направление определяем строго по индексу: растёт -> вниз, падает -> вверх
      lastNavDirection.value = nextIndex > activeIndex.value ? 'down' : 'up'
      pendingEnterViewId.value = next
      activeViewId.value = next
      willChangeView = true
    }
  } else {
    if (activeIndex.value > 0) {
      const prev = viewOrder[activeIndex.value - 1]!
      setNavAnimationDuration(activeViewId.value, prev, 'up')
      navIndex.value = activeIndex.value - 1
      // Подготавливаем "скрытое" состояние ДО монтирования (важно при mode="out-in")
      prepareEnter(prev)
      lastNavDirection.value = 'up'
      pendingEnterViewId.value = prev
      activeViewId.value = prev
      willChangeView = true
    }
  }

  // Если слайд не меняется (уже на краю), `@after-enter` не сработает,
  // поэтому сбрасываем флаг сразу.
  if (!willChangeView) {
    isAnimating = false
  }

  // Иначе `isAnimating` снимаем в `handleAfterEnter`,
  // чтобы enter-анимации точно отыгрывали после монтирования.
}

const handleAfterEnter = async () => {
  if (pendingEnterViewId.value && pendingEnterViewId.value === activeViewId.value) {
    const viewId = pendingEnterViewId.value
    pendingEnterViewId.value = null
    await playEnter(viewId)
  }

  await delay(208)
  isAnimating = false
  navIndex.value = activeIndex.value
}

// Функции для работы с полосой прогресса
type ViewTitleKey =
  | 'hero.title'
  | 'about.title'
  | 'howItWorks.title'
  | 'benefits.title'
  | 'pricing.title'
  | 'contacts.title'

const getViewTitleKey = (viewId: ViewId): ViewTitleKey => {
  if (viewId === 'hero') return 'hero.title'
  if (viewId === 'about') return 'about.title'
  if (viewId === 'howItWorks') return 'howItWorks.title'
  if (viewId === 'benefits') return 'benefits.title'
  if (viewId === 'pricing') return 'pricing.title'
  return 'contacts.title'
}

const viewTitleKeys = computed<ReadonlyArray<ViewTitleKey>>(() => viewOrder.map(getViewTitleKey))

const slideNavStyle = computed(() => ({
  '--nav-anim-ms': `${navAnimMs.value}ms`
}))

const segmentClasses = computed(() => (
  viewOrder.map((_, index) => ({
    'slide-nav__segment--active': index === navIndex.value
  }))
))

const goToView = async (targetViewId: ViewId) => {
  if (isAnimating) return
  if (targetViewId === activeViewId.value) return

  isAnimating = true

  const targetIndex = viewOrder.indexOf(targetViewId)
  if (targetIndex === -1) {
    isAnimating = false
    return
  }

  if (targetIndex > activeIndex.value) {
    setNavAnimationDuration(activeViewId.value, targetViewId, 'down')
    navIndex.value = targetIndex
    await playExit(activeViewId.value)
    prepareEnter(targetViewId)
    lastNavDirection.value = 'down'
  } else {
    setNavAnimationDuration(activeViewId.value, targetViewId, 'up')
    navIndex.value = targetIndex
    prepareEnter(targetViewId)
    lastNavDirection.value = 'up'
  }

  pendingEnterViewId.value = targetViewId
  activeViewId.value = targetViewId
}

watch(navIndex, async (to, from) => {
  await nextTick()
  // первый рендер
  if (from === to) {
    setFillToIndex(to)
    return
  }
  animateFill(from, to)
})

onMounted(async () => {
  await nextTick()
  navIndex.value = activeIndex.value
  setFillToIndex(navIndex.value)

  const onResize = async () => {
    await nextTick()
    setFillToIndex(navIndex.value)
  }
  window.addEventListener('resize', onResize, { passive: true })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
  })
})

// Фон/тема переключаются глобально в `app/app.vue`
</script>
<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.page {
  width: 100%;
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// Верхний "хедер" в потоке (резервируем место под фиксированный AppHeader)
.page__header {
  flex: 0 0 auto;
  height: 5.333rem; // примерно: 2rem + line-height + 2rem
}

// Основной контент (flex:1) со скроллом при переполнении
.page__content {
  flex: 1 1 auto;
  overflow: auto;
  min-height: 0; // важно для flex+overflow
  overscroll-behavior: contain;

  // scrollbar (WebKit)
  &::-webkit-scrollbar {
    width: 0.167rem; // 3px при 1rem=18px
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: $color-primary;
    border-radius: 0;
  }

  // scrollbar (Firefox)
  scrollbar-color: #{$color-primary} transparent;
  scrollbar-width: thin;
}

// Футер в потоке: высота от контента, линия от низа 0.6rem
.page__footer {
  flex: 0 0 auto;
  width: 100%;
  padding-bottom: 0.6rem;
}

// Полоса переключения слайдов в стиле YouTube (на всю ширину)
.slide-nav {
  width: 100%;
  pointer-events: auto;
  cursor: pointer;

  // гарантируем pointer везде внутри полосы
  &,
  * {
    cursor: pointer;
  }

  &__track {
    position: relative;
    height: 2.444rem; // зона ховера/клика
    display: flex;
    gap: 0.111rem; // 2px при 1rem=18px
    padding: 0 1rem;
    align-items: stretch;
  }

  &__fill {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 0.444rem; // толщина линии
    width: 0;
    background: $color-secondary;
    border-radius: 0;
    pointer-events: none;
    will-change: transform, width;
  }

  &__segment {
    flex: 1 1 0;
    height: 100%;
    border: 0;
    padding: 0;
    background: transparent;
    border-radius: 0;
    position: relative;
    -webkit-tap-highlight-color: transparent;

    // трек (неактивная часть)
    &::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 0.444rem; // толщина линии
      background: rgba($color-secondary, 0.22);
      border-radius: 0;
      transition: background-color 0.18s ease;
    }

    &:hover,
    &:focus-visible {
      outline: none;
    }

    // при наведении на отсек — тот же цвет (secondary), толщина не меняется
    &:hover::before,
    &:focus-visible::before {
      background: $color-secondary;
    }

    &--active {
      &::before {
        background: rgba($color-secondary, 0.22);
      }
    }
  }

  &__label {
    position: absolute;
    left: 50%;
    bottom: calc(100% + 0.444rem); // ~8px
    transform: translateX(-50%) translateY(0.333rem);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    white-space: nowrap;
    padding: 0;
    border-radius: 0;
    background: transparent;
    backdrop-filter: none;
    color: $color-secondary;
    font-family: $font-default;
    font-weight: $font-weight-medium;
    font-size: 0.778rem; // ~14px
    letter-spacing: 0.02em;
    transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease;
    text-shadow: 0 0.111rem 0.444rem rgba(0, 0, 0, 0.55);
  }

  &__segment:hover &__label,
  &__segment:focus-visible &__label {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
}

@include layout-aspect-mobile {
  .slide-nav {
    height: 2.286rem;

    &__track {
      gap: 0.143rem; // 2px при 1rem=14px
      padding: 0 0.667rem;
    }

    &__fill {
      left: 0;
      bottom: 0;
      height: 0.428rem;
    }

    &__segment::before {
      height: 0.428rem;
    }

    &__label {
      font-size: 0.786rem; // ~11px при базовом 14px
    }
  }

  .page__content {
    &::-webkit-scrollbar {
      width: 0.214rem; // 3px при 1rem=14px
    }
  }
}
</style>
