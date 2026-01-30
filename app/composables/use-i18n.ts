import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import ruTranslations from '@/locales/ru'
import enTranslations from '@/locales/en'

type TranslationKey = string
type TranslationParams = Record<string, string | number>
type Language = 'ru' | 'en'

interface I18nReturn {
  t: (key: TranslationKey, params?: TranslationParams) => string
  currentLang: ComputedRef<Language>
  setLanguage: (lang: Language) => Promise<void>
  toggleLanguage: () => Promise<void>
}

type Translations = Record<string, any>
type TranslationsByLang = Record<Language, Translations>

const isLanguage = (value: unknown): value is Language => value === 'ru' || value === 'en'

const getUrlLanguage = (): Language | null => {
  const url = useRequestURL()
  const langParam = url.searchParams.get('lang')
  return isLanguage(langParam) ? langParam : null
}

const getHeaderLanguage = (): Language => {
  if (!import.meta.server) return 'ru'
  const headers = useRequestHeaders(['accept-language'])
  const accept = headers['accept-language'] || ''
  return accept.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

export const useI18n = (): I18nReturn => {
  // Язык должен быть одинаковым на SSR и на клиенте → cookie + URL.
  const langCookie = useCookie<Language>('lang', { default: () => 'ru' })
  const urlLang = getUrlLanguage()
  const initialLang: Language = urlLang ?? (langCookie.value && isLanguage(langCookie.value) ? langCookie.value : getHeaderLanguage())

  const currentLang = useState<Language>('i18n.lang', () => initialLang)
  if (urlLang && langCookie.value !== urlLang) {
    // Чтобы SSR и клиент совпадали при прямом заходе по `?lang=...`
    langCookie.value = urlLang
  }

  // Переводы должны быть доступны синхронно на SSR,
  // иначе получаем hydration mismatch (сервер рендерит пустые строки).
  const translationsData: TranslationsByLang = {
    ru: ruTranslations as unknown as Translations,
    en: enTranslations as unknown as Translations
  }

  const t = (key: TranslationKey, params: TranslationParams = {}): string => {
    const lang = currentLang.value
    const dict = translationsData[lang]

    const keys = key.split('.')
    let value: any = dict

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

    const interpolated = value.replace(/\{\{(\w+)\}\}/g, (match: string, paramKey: string) => {
      return params[paramKey] !== undefined ? String(params[paramKey]) : match
    })

    // В локалях используем `&nbsp;` для типографики, но в `{{ ... }}` HTML не парсится.
    // Поэтому декодируем сущность в реальный неразрывный пробел, чтобы не требовать `v-html` повсюду.
    return interpolated.replace(/&nbsp;/g, '\u00A0')
  }

  const updateUrlLanguage = (lang: Language): void => {
    if (!import.meta.client) return
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('lang', lang)
      window.history.replaceState({}, '', url.toString())
    } catch (e) {
      console.warn('Could not update URL:', e)
    }
  }

  const setLanguage = async (lang: Language): Promise<void> => {
    if (!isLanguage(lang)) return
    currentLang.value = lang
    langCookie.value = lang
    updateUrlLanguage(lang)
  }

  const toggleLanguage = async (): Promise<void> => {
    await setLanguage(currentLang.value === 'ru' ? 'en' : 'ru')
  }

  return {
    t,
    currentLang: computed(() => currentLang.value),
    setLanguage,
    toggleLanguage
  }
}
