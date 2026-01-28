<template>
  <section class="home-contacts" :class="rootClasses">
    <div class="home-contacts__content">
      <header class="home-contacts__header" :class="headerClasses">
        <h2 class="home-contacts__title">{{ t('contacts.title') }}</h2>
      </header>

      <div class="home-contacts__panel" :class="panelClasses">
        <form class="home-contacts__form" @submit.prevent="submit">
          <div class="home-contacts__grid">
            <div class="home-contacts__field">
              <input
                id="contact-name"
                v-model="form.name"
                class="home-contacts__input"
                :class="inputClasses.name"
                type="text"
                autocomplete="name"
                :placeholder="t('contacts.fields.name.label')"
                @blur="touch('name')"
              />
              <div v-if="fieldErrorText.name" class="home-contacts__error">{{ fieldErrorText.name }}</div>
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
                :placeholder="t('contacts.fields.email.label')"
                @blur="touch('email')"
              />
              <div v-if="fieldErrorText.email" class="home-contacts__error">{{ fieldErrorText.email }}</div>
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
                :placeholder="t('contacts.fields.phone.label')"
                @blur="touch('phone')"
              />
              <div v-if="fieldErrorText.phone" class="home-contacts__error">{{ fieldErrorText.phone }}</div>
            </div>

            <div class="home-contacts__field home-contacts__field--full">
              <textarea
                id="contact-description"
                v-model="form.description"
                class="home-contacts__textarea"
                :class="inputClasses.description"
                rows="4"
                :placeholder="t('contacts.fields.description.label')"
                @blur="touch('description')"
              />
              <div v-if="fieldErrorText.description" class="home-contacts__error">{{ fieldErrorText.description }}</div>
            </div>
          </div>

          <div class="home-contacts__actions">
            <UiButton size="lg" class="home-contacts__submit" :disabled="isSubmitting">
              {{ isSubmitting ? t('contacts.submitPending') : t('contacts.submit') }}
            </UiButton>
            <p v-if="isSuccess" class="home-contacts__success">{{ t('contacts.success') }}</p>
          </div>
        </form>
      </div>

      <div class="home-contacts__links" :class="linksClasses" aria-label="contacts">
        <a class="home-contacts__link" :href="mailtoHref">{{ t('contacts.links.email') }}</a>
        <a
          class="home-contacts__link"
          :href="t('contacts.links.telegramUrl')"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t('contacts.links.telegramLabel') }}
        </a>
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

.home-contacts {
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
    gap: 0.2rem;
    max-width: 22rem;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.444rem;
    width: 100%;
    position: relative;
    padding-bottom: 1.444rem;

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
    border-radius: 1rem;
    border: 1px solid rgba(44, 44, 44, 0.12);
    background: rgba(255, 255, 255, 0.9);
    color: $color-black;
    font-family: $font-default;
    font-weight: $font-weight-medium;
    font-size: 1rem;
    padding: 1.722rem 3.333rem;
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
    min-height: 8.889rem;
  }

  &__error {
    font-size: 0.7rem;
    font-family: $font-inter;
    font-weight: $font-weight-light;
    color: $color-primary;
    line-height: 1.3;
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 100%;
    text-align: center;
    pointer-events: none;
    bottom: 0.2rem;
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

  &__success {
    margin: 0;
    font-size: 0.926rem;
    font-family: $font-inter;
    color: $color-primary;
    text-align: center;
  }

  &__links {
    display: flex;
    gap: 1.111rem;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
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
    font-size: 0.926rem;
    font-family: $font-inter;
    font-weight: $font-weight-medium;
    color: $color-primary;
    text-decoration: none;
    transition: opacity 0.18s ease;

    &:hover {
      opacity: 0.85;
    }
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
      background: rgba(0, 0, 0, 0.22);
      border-color: rgba(255, 255, 255, 0.14);
      color: $color-white;

      &::placeholder {
        color: rgba(255, 255, 255, 0.42);
      }

      &:-webkit-autofill,
      &:-webkit-autofill:hover,
      &:-webkit-autofill:focus,
      &:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.22) inset !important;
        box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.22) inset !important;
        -webkit-text-fill-color: $color-white !important;
        caret-color: $color-white;
        background-color: rgba(0, 0, 0, 0.22) !important;
        transition: background-color 5000s ease-in-out 0s;
      }
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
  }
}
</style>

