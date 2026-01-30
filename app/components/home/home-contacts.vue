<template>
  <section class="home-contacts" :class="rootClasses">
    <div class="home-contacts__content">
      <header class="home-contacts__header" :class="headerClasses">
        <h2 class="home-contacts__title">{{ t('contacts.title') }}</h2>
      </header>

      <div class="home-contacts__panel" :class="panelClasses">
        <form class="home-contacts__form" novalidate @submit.prevent="submit">
          <div class="home-contacts__grid">
            <div class="home-contacts__links" :class="linksClasses" aria-label="contacts">
              <a class="home-contacts__link" :href="mailtoHref">
                <span class="home-contacts__link-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M15.374 12.718L19.88 9.663C20.581 9.189 21 8.398 21 7.552V7.552C21 6.142 19.858 5 18.449 5H5.566C4.157 5 3.015 6.142 3.015 7.551V7.551C3.015 8.397 3.434 9.188 4.135 9.663L8.641 12.718C10.674 14.096 13.341 14.096 15.374 12.718V12.718Z"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M3 7.551V17C3 18.657 4.343 20 6 20H18C19.657 20 21 18.657 21 17V7.552"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span class="home-contacts__link-text">{{ t('contacts.links.email') }}</span>
              </a>

              <a
                class="home-contacts__link"
                :href="t('contacts.links.telegramUrl')"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span class="home-contacts__link-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M14.644 19.908L20.1 5.188C20.397 4.386 19.616 3.606 18.815 3.903L4.09 9.363C3.169 9.705 3.241 11.031 4.194 11.27L11.028 12.987L12.735 19.803C12.975 20.757 14.302 20.83 14.644 19.908V19.908Z"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M19.87 4.13L11.03 12.99"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span class="home-contacts__link-text">{{ t('contacts.links.telegramLabel') }}</span>
              </a>
            </div>
            <div class="home-contacts__field">
              <input
                id="contact-name"
                v-model="form.name"
                class="home-contacts__input"
                :class="inputClasses.name"
                type="text"
                autocomplete="name"
                :placeholder="placeholders.name"
                @blur="touch('name')"
              />
            </div>

            <div class="home-contacts__field">
              <input
                id="contact-email"
                v-model="form.email"
                class="home-contacts__input"
                :class="inputClasses.email"
                type="email"
                autocomplete="email"
                inputmode="email"
                :placeholder="placeholders.email"
                @blur="touch('email')"
              />
            </div>

            <div class="home-contacts__field">
              <input
                id="contact-phone"
                v-model="phoneModel"
                class="home-contacts__input"
                :class="inputClasses.phone"
                type="tel"
                autocomplete="tel"
                inputmode="tel"
                :placeholder="placeholders.phone"
                @blur="touch('phone')"
              />
            </div>

            <div class="home-contacts__field home-contacts__field--full">
              <textarea
                id="contact-description"
                v-model="form.description"
                class="home-contacts__textarea"
                :class="inputClasses.description"
                rows="4"
                :placeholder="placeholders.description"
                @blur="touch('description')"
              />
            </div>
          </div>

          <div class="home-contacts__actions">
            <UiButton size="lg" class="home-contacts__submit" :disabled="isSubmitting">
              {{ isSubmitting ? t('contacts.submitPending') : t('contacts.submit') }}
            </UiButton>
            <p
              v-if="!isSuccess"
              class="home-contacts__consent"
              v-html="t('contacts.consent')"
            />
            <p v-if="isSuccess" class="home-contacts__success">{{ t('contacts.success') }}</p>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { formatPhone, phoneToDigits } from '@/utils/phone-mask'

type FieldKey = 'name' | 'email' | 'phone' | 'description'

const { t } = useI18n()
const settingsStore = useSettingsStore()

const props = defineProps<{
  phase?: number
}>()

const rootClasses = computed(() => ({
  'home-contacts--dark': settingsStore.isDarkTheme
}))

const headerClasses = computed(() => ({
  'home-contacts__header--hidden': (props.phase ?? 0) >= 1
}))

const panelClasses = computed(() => ({
  'home-contacts__panel--hidden': (props.phase ?? 0) >= 1
}))

const linksClasses = computed(() => ({
  'home-contacts__links--hidden': (props.phase ?? 0) >= 1
}))

const form = reactive({
  name: '',
  email: '',
  phone: '',
  description: ''
})

const touched = reactive<Record<FieldKey, boolean>>({
  name: false,
  email: false,
  phone: false,
  description: false
})

const isSubmitting = ref(false)
const isSuccess = ref(false)

const touch = (key: FieldKey) => {
  touched[key] = true
}

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim())

const rawErrors = computed<Record<FieldKey, '' | 'required' | 'invalid'>>(() => {
  const name = form.name.trim()
  const email = form.email.trim()

  return {
    name: name ? '' : 'required',
    email: email ? (validateEmail(email) ? '' : 'invalid') : 'required',
    phone: '',
    description: ''
  }
})

const fieldErrorText = computed<Record<FieldKey, string>>(() => {
  const e = rawErrors.value
  return {
    name: touched.name && e.name ? t(`contacts.errors.${e.name}`) : '',
    email: touched.email && e.email ? t(`contacts.errors.email.${e.email}`) : '',
    phone: touched.phone && e.phone ? t(`contacts.errors.${e.phone}`) : '',
    description: touched.description && e.description ? t(`contacts.errors.${e.description}`) : ''
  }
})

const placeholders = computed<Record<FieldKey, string>>(() => {
  const label = {
    name: t('contacts.fields.name.label'),
    email: t('contacts.fields.email.label'),
    phone: t('contacts.fields.phone.label'),
    description: t('contacts.fields.description.label')
  }

  const err = fieldErrorText.value
  return {
    name: err.name ? `${label.name} ${err.name}` : label.name,
    email: err.email ? `${label.email} ${err.email}` : label.email,
    phone: err.phone ? `${label.phone} ${err.phone}` : label.phone,
    description: err.description ? `${label.description} ${err.description}` : label.description
  }
})

const inputClasses = computed<Record<FieldKey, Record<string, boolean>>>(() => {
  const e = rawErrors.value
  return {
    name: { 'home-contacts__input--error': touched.name && !!e.name },
    email: { 'home-contacts__input--error': touched.email && !!e.email },
    phone: { 'home-contacts__input--error': touched.phone && !!e.phone },
    description: { 'home-contacts__input--error': touched.description && !!e.description }
  }
})

const mailtoHref = computed(() => `mailto:${t('contacts.links.email')}`)

const phoneModel = computed({
  get: () => form.phone,
  set: (value: string) => {
    form.phone = formatPhone(value)
  }
})

const submit = async () => {
  touched.name = true
  touched.email = true
  touched.phone = true
  touched.description = true

  isSuccess.value = false

  const e = rawErrors.value
  if (e.name || e.email) return

  isSubmitting.value = true
  try {
    await $fetch('/api/contacts', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        phone: phoneToDigits(form.phone),
        description: form.description
      }
    })

    isSuccess.value = true
    form.name = ''
    form.email = ''
    form.phone = ''
    form.description = ''
    touched.name = false
    touched.email = false
    touched.phone = false
    touched.description = false
  } catch (err: any) {
    // Если сервер вернул валидацию — подсветим поля
    const data = err?.data
    const serverErrors = data?.errors as Record<string, string> | undefined
    if (serverErrors?.name) touched.name = true
    if (serverErrors?.email) touched.email = true
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;
@use "sass:math";

.home-contacts {
  // локальные SCSS-переменные (масштаб 1.3)
  $k: 1.3;
  // отступы между полями: увеличить в 2 раза
  $field-gap: 1.232rem; // (0.4rem / 1.3) * 4
  $grid-gap: 0.616rem; // (0.2rem / 1.3) * 4
  $input-font: math.div(1rem, $k);
  $input-padding-y: math.div(1.722rem, $k);
  $input-padding-x: math.div(3.333rem, $k);
  $input-radius: math.div(1rem, $k);
  $textarea-min-h: math.div(8.889rem, $k);
  // расстояние между mail и tg больше
  $links-gap: 1rem;
  // иконку к тексту — чуть ближе
  $link-inner-gap: 0.333rem;

  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-black;

  &__content {
    padding: 2rem;
    width: 100%;
    max-width: 56rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  &__header {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.667rem;
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity, transform;

    &--hidden {
      opacity: 0;
      transform: translateY(-2rem);
      pointer-events: none;
    }
  }

  &__title {
    margin: 0;
    font-size: 2.7rem;
    color: $color-primary;
    font-weight: $font-weight-medium;
    font-family: $font-default;
  }

  &__panel {
    width: 100%;
    max-width: 41.8rem;
    border-radius: 1.111rem;
    background: transparent;
    border: none;
    padding: 1.333rem;
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity, transform;

    &--hidden {
      opacity: 0;
      transform: translateY(2rem);
      pointer-events: none;
    }
  }

  &__form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: $grid-gap;
    max-width: 22rem;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: $field-gap;
    width: 100%;

    &--full {
      width: 100%;
    }
  }

  &__label {
    font-size: 0.833rem;
    font-family: $font-inter;
    font-weight: $font-weight-medium;
    color: $color-black;
  }

  &__input,
  &__textarea {
    width: 100%;
    border-radius: $input-radius;
    border: 1px solid rgba(44, 44, 44, 0.12);
    background: rgba(255, 255, 255, 0.9);
    color: $color-black;
    font-family: $font-default;
    font-weight: $font-weight-medium;
    font-size: $input-font;
    padding: $input-padding-y $input-padding-x;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;

    &::placeholder {
      color: rgba(44, 44, 44, 0.45);
    }

    &:focus {
      border-color: $color-primary-light;
      box-shadow: 0 0 0 0.222rem rgba($color-primary-light, 0.52);
    }

    &--error {
      border-color: $color-primary;
      box-shadow: 0 0 0 0.222rem rgba($color-primary-light, 0.72);
    }
  }

  &__textarea {
    resize: vertical;
    min-height: $textarea-min-h;
  }

  &__actions {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.667rem;
    align-items: center;
    width: 100%;
    max-width: 22rem;
  }

  &__submit {
    width: 100%;
  }

  &__consent {
    margin: 0;
    font-size: 0.778rem;
    font-family: $font-inter;
    font-weight: $font-weight-medium;
    line-height: 1.25;
    color: rgba($color-black, 0.55);
    text-align: center;
  }

  &__success {
    margin: 0;
    font-size: 0.926rem;
    font-family: $font-inter;
    color: $color-primary;
    text-align: center;
  }

  &__links {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: $links-gap;
    justify-content: center;
    width: 100%;
    padding-bottom: $input-padding-y;
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity, transform;

    &--hidden {
      opacity: 0;
      transform: translateY(2rem);
      pointer-events: none;
    }
  }

  &__link {
    width: auto;
    display: inline-flex;
    align-items: center;
    gap: $link-inner-gap;
    font-size: 0.926rem;
    font-weight: $font-weight-medium;
    color: $color-black;
    text-decoration: none;
    transition: opacity 0.18s ease;

    &:hover {
      opacity: 0.85;
    }
  }

  &__link-icon {
    width: math.div(1.852rem, $k);
    height: math.div(1.852rem, $k);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: $color-secondary;

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  &__link-text {
    display: inline-block;
  }

  &--dark {
    color: $color-white;

    .home-contacts__panel {
      background: transparent;
      border: none;
    }

    .home-contacts__label {
      color: $color-white-light;
    }

    .home-contacts__input,
    .home-contacts__textarea {
      background: $color-black-dark;
      border-color: rgba(255, 255, 255, 0.14);
      color: $color-white;

      &::placeholder {
        color: rgba(255, 255, 255, 0.42);
      }

      &:-webkit-autofill,
      &:-webkit-autofill:hover,
      &:-webkit-autofill:focus,
      &:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px $color-black inset !important;
        box-shadow: 0 0 0 1000px $color-black inset !important;
        -webkit-text-fill-color: $color-white !important;
        caret-color: $color-white;
        background-color: $color-black !important;
        transition: background-color 5000s ease-in-out 0s;
      }
    }

    .home-contacts__link {
      color: $color-white;
    }

    .home-contacts__link-icon {
      color: $color-secondary;
    }

    .home-contacts__consent {
      color: rgba($color-white, 0.55);
    }
  }

  @include layout-aspect-mobile {
    &__content {
      max-width: 42rem;
      padding: 1.333rem;
      gap: 1.111rem;
    }

    &__title {
      font-size: 2.143rem;
    }

    &__grid {
      gap: 0.889rem;
    }

    &__panel {
      padding: 1.111rem;
    }

    &__links {
      gap: 0.889rem;
      padding-bottom: $input-padding-y;
    }

    &__input,
    &__textarea {
      // на мобиле базовый rem уже 14px, но коэффициент 1.3 сохраняем
      padding: math.div(1.333rem, $k) math.div(2.222rem, $k);
    }
  }
}
</style>

