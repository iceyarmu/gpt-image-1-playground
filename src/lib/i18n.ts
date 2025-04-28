import en from '../i18n/en.json'
import zh from '../i18n/zh.json'

export type Language = 'en' | 'zh'
export type TranslationKey = keyof typeof en

// Type for nested translation object structure
type NestedTranslation = {
  [key: string]: string | NestedTranslation
}

// Type for translation parameters
type TranslationParams = Record<string, string | number>

export const translations = {
  en,
  zh,
} as const

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'zh'
  
  const browserLang = navigator.language.toLowerCase()
  return browserLang.startsWith('zh') ? 'zh' : 'en'
}

export function t(key: string, params?: TranslationParams, lang: Language = getLanguage()): string {
  const keys = key.split('.')
  let value: string | NestedTranslation = translations[lang]
  
  for (const k of keys) {
    value = (value as NestedTranslation)?.[k]
  }
  
  if (!value || typeof value !== 'string') return key

  if (params) {
    return value.replace(/\${(\w+)}/g, (match: string, param: string) => {
      return params[param]?.toString() ?? match
    })
  }

  return value
}

export function useTranslation() {
  const lang = getLanguage()
  return {
    t: (key: string, params?: TranslationParams) => t(key, params, lang),
    lang
  }
}