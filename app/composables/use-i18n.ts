import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

type TranslationKey = string
type TranslationParams = Record<string, string | number>
type Language = 'ru' | 'en'

interface I18nReturn {
  t: (key: TranslationKey, params?: TranslationParams) => string
  currentLang: ComputedRef<Language>
  setLanguage: (lang: Language) => Promise<void>
  toggleLanguage: () => Promise<void>
}

// Определение языка браузера
const getBrowserLanguage = (): Language => {
  if (process.client) {
    const lang = navigator.language || (navigator as any).userLanguage
    return lang.startsWith('ru') ? 'ru' : 'en'
  }
  return 'ru'
}

// Получение языка из URL параметра
const getLanguageFromUrl = (): Language | null => {
  if (process.client) {
    const urlParams = new URLSearchParams(window.location.search)
    const langParam = urlParams.get('lang')
    
    if (langParam === 'ru' || langParam === 'en') {
      return langParam
    }
  }
  return null
}

// Определение начального языка с приоритетом: URL > localStorage > браузер
const getInitialLanguage = (): Language => {
  const urlLang = getLanguageFromUrl()
  if (urlLang) {
    return urlLang
  }
  
  if (process.client) {
    const storedLang = localStorage.getItem('language') as Language | null
    if (storedLang === 'ru' || storedLang === 'en') {
      return storedLang
    }
  }
  
  return getBrowserLanguage()
}

// Состояние
const currentLang: Ref<Language> = ref(getInitialLanguage())
const translationsData: Ref<Record<Language, any>> = ref({} as Record<Language, any>)
const isTranslationsLoaded: Ref<boolean> = ref(false)

// Загрузка переводов
const loadTranslations = async (lang: Language): Promise<void> => {
  if (!translationsData.value[lang]) {
    if (lang === 'ru') {
      const { default: ruTranslations } = await import('@/locales/ru')
      translationsData.value[lang] = ruTranslations
    } else {
      const { default: enTranslations } = await import('@/locales/en')
      translationsData.value[lang] = enTranslations
    }
  }
  isTranslationsLoaded.value = true
}

// Инициализация
if (process.client) {
  loadTranslations(currentLang.value)
}

export const useI18n = (): I18nReturn => {
  // Создаем реактивную функцию t, которая зависит от currentLang
  const t = (key: TranslationKey, params: TranslationParams = {}): string => {
    // Используем currentLang.value для реактивности
    const lang = currentLang.value
    const keys = key.split('.')
    let value: any = translationsData.value[lang]
    
    // Если переводы еще не загружены, возвращаем пустую строку
    if (!value || !isTranslationsLoaded.value) {
      return ''
    }
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        console.warn(`Translation key "${key}" not found for language "${lang}"`)
        return key
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation value for "${key}" is not a string`)
      return key
    }
    
    // Замена параметров
    return value.replace(/\{\{(\w+)\}\}/g, (match: string, paramKey: string) => {
      return params[paramKey] !== undefined ? String(params[paramKey]) : match
    })
  }

  // Обновление URL с параметром lang
  const updateUrlLanguage = (lang: Language): void => {
    if (!process.client) return
    
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('lang', lang)
      window.history.replaceState({}, '', url.toString())
    } catch (e) {
      console.warn('Could not update URL:', e)
    }
  }

  const setLanguage = async (lang: Language): Promise<void> => {
    if (lang !== 'ru' && lang !== 'en') {
      console.warn(`Unsupported language: ${lang}`)
      return
    }
    
    await loadTranslations(lang)
    currentLang.value = lang
    
    if (process.client) {
      localStorage.setItem('language', lang)
      updateUrlLanguage(lang)
    }
  }

  const toggleLanguage = async (): Promise<void> => {
    const newLang: Language = currentLang.value === 'ru' ? 'en' : 'ru'
    await setLanguage(newLang)
  }

  return {
    t,
    currentLang: computed(() => currentLang.value),
    setLanguage,
    toggleLanguage
  }
}
