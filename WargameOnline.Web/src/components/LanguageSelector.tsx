import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'

//prese da flagcdn
const flags = {
  en: '/flags/en.svg',
  it: '/flags/it.svg',
  fr: '/flags/fr.svg',
  de: '/flags/de.svg',
  jp: '/flags/jp.svg',
} as const

export default function LanguageSelector() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)

  const rawLang = i18n.language.split('-')[0]
  const currentLang = Object.keys(flags).includes(rawLang)
    ? (rawLang as keyof typeof flags)
    : 'en'

  useEffect(() => {
    const saved = localStorage.getItem('lang')
    if (saved) i18n.changeLanguage(saved)
  }, [])

  const changeLang = (lang: keyof typeof flags) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('lang', lang)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center">
        <img src={flags[currentLang]} alt={currentLang} className="w-6 h-6" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-28 bg-surface border border-border rounded shadow-lg z-50">
          {Object.entries(flags)
            .filter(([key]) => key !== currentLang)
            .map(([lang, path]) => (
              <button
                key={lang}
                onClick={() => changeLang(lang as keyof typeof flags)}
                className="w-full px-3 py-2 text-left hover:bg-gray-700 flex items-center gap-2 transition"
              >
                <img src={path} alt={lang} className="w-5 h-4" />
                <span className="text-sm uppercase">{lang}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
