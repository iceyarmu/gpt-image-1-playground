import en from '../i18n/en.json'
import zh from '../i18n/zh.json'

export type Language = 'en' | 'zh'
export type TranslationKey = keyof typeof en

export const translations = {
  en,
  zh,
} as const

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'zh'
  
  const browserLang = navigator.language.toLowerCase()
  return browserLang.startsWith('zh') ? 'zh' : 'en'
}

export function t(key: string, params?: Record<string, any>, lang: Language = getLanguage()): string {
  const keys = key.split('.')
  let value: any = translations[lang]
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  if (!value) return key

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
    t: (key: string, params?: Record<string, any>) => t(key, params, lang),
    lang
  }
}