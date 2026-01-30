<template>
  <header class="app-header" :class="headerClasses">
    <div class="app-header__inner">
      <div 
        class="app-header__logo" 
        :class="logoClasses"
        @click="handleLogoClick"
      >
        GROMKA
      </div>

      <div class="app-header__right" :class="rightClasses">
        <Transition name="app-header-contact">
          <button
            v-if="isWriteUsVisible"
            type="button"
            class="app-header__contact-link"
            :aria-label="t('header.writeUs')"
            @click="handleWriteUsClick"
          >
            <span class="app-header__contact-link-icon" aria-hidden="true">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                focusable="false"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M5.293 15.619L15.619 5.293C16.009 4.903 16.642 4.903 17.032 5.293L18.708 6.969C19.098 7.359 19.098 7.992 18.708 8.382L8.381 18.707C8.194 18.895 7.94 19 7.675 19H5V16.325C5 16.06 5.105 15.806 5.293 15.619Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M13.75 7.16L16.84 10.25"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="app-header__contact-link-text">{{ t('header.writeUs') }}</span>
          </button>
        </Transition>

        <div class="app-header__switcher">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const mainStore = useMainStore()
const settingsStore = useSettingsStore()
const { value: heroHeaderState } = useAnimationChannel('header.hero', 0)
const { t } = useI18n()

const route = useRoute()

const handleLogoClick = async () => {
  // Если мы не на главной — сначала переходим на неё
  if (route.path !== '/') {
    await navigateTo('/')
  }

  // Затем просим главную страницу выполнить переход к первому слайду
  mainStore.requestNavigateToView('hero')
}

const handleWriteUsClick = async () => {
  // Если мы не на главной — сначала переходим на неё
  if (route.path !== '/') {
    await navigateTo('/')
  }

  mainStore.requestNavigateToView('contacts')
}

const isHeroView = computed(() => mainStore.activeViewId === 'hero')
const isHeaderExpanded = computed(() => !isHeroView.value || heroHeaderState.value === 1)
const isWriteUsVisible = computed(() => !isHeroView.value)

const headerClasses = computed(() => ({
  'app-header--dark': settingsStore.isDarkTheme
}))

const logoClasses = computed(() => ({
  'app-header__logo--visible': isHeaderExpanded.value
}))

const rightClasses = computed(() => ({
  'app-header__right--centered': !isHeaderExpanded.value
}))
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 2rem 3rem;
  pointer-events: none;

  @include layout-aspect-mobile {
    padding: 0.667rem 0.889rem;
  }

  &__inner {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
  }

  &__logo {
    font-size: 1.333rem; // 24px при базовом 18px
    font-weight: $font-weight-bold;
    color: $color-black;
    opacity: 0;
    transform: translate3d(-2rem, 0, 0);
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      color 0.5s ease;
    pointer-events: auto;
    cursor: pointer;

    &:hover {
      opacity: 0.7;
    }

    &--visible {
      opacity: 1;
      transform: translate3d(0, 0, 0);

      &:hover {
        opacity: 0.7;
      }
    }
  }

  &__right {
    margin-left: auto;
    position: relative;
    right: 0;
    transform: translate3d(0, 0, 0);
    transition: right 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: right, transform;
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 2.222rem; // ~40px при 1rem=18px

    &--centered {
      right: 50%;
      transform: translate3d(50%, 0, 0);
    }

    @include layout-aspect-mobile {
      gap: 1.389rem;
    }
  }

  &__switcher {
    pointer-events: auto;
  }

  &__contact-link {
    display: inline-flex;
    align-items: center;
    padding: 0;
    padding-bottom: 0.5rem; // 2px при 1rem=18px
    border: 0;
    border-bottom: 0.111rem solid $color-primary; // 2px
    border-right: 0.111rem solid $color-primary; // 2px
    padding-right: 0.5rem;
    background: transparent;
    cursor: pointer;
    color: $color-white-light;
    font-family: $font-default;
    font-weight: $font-weight-bold;
    font-size: 1rem;
    line-height: 1;
    transition: opacity 0.18s ease, color 0.5s ease;
    pointer-events: auto;

    &:hover {
      opacity: 0.75;
    }

    @include layout-aspect-mobile {
      padding-bottom: 0.222rem;
      padding-right: 0.222rem;
    }
  }

  &__contact-link-icon {
    display: none;
    width: 1.733rem;
    height: 1.733rem;

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    @include layout-aspect-mobile {
      display: inline-flex;
    }
  }

  &__contact-link-text {
    @include layout-aspect-mobile {
      display: none;
    }
  }

  &--dark {
    .app-header__logo {
      color: $color-white;
    }
  }
}

.app-header-contact-enter-active,
.app-header-contact-leave-active {
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
}

.app-header-contact-enter-from,
.app-header-contact-leave-to {
  opacity: 0;
  transform: translate3d(1rem, 0, 0);
}
</style>
