'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import translations from '@/lib/translations';

const LanguageContext = createContext(null);

// Supported languages
export const LANGUAGES = [
  { code: 'en', label: 'English',  nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'te', label: 'Telugu',   nativeLabel: 'తెలుగు',  flag: '🏴' },
  { code: 'hi', label: 'Hindi',    nativeLabel: 'हिंदी',   flag: '🇮🇳' },
];

const STORAGE_KEY = 'slns_language';

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('en');
  const [mounted, setMounted] = useState(false);

  // Load saved preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && ['en', 'te', 'hi'].includes(saved)) {
        setLangState(saved);
      } else {
        // Auto-detect browser language
        const browserLang = navigator.language?.substring(0, 2);
        if (browserLang === 'te') setLangState('te');
        else if (browserLang === 'hi') setLangState('hi');
      }
    } catch {}
    setMounted(true);
  }, []);

  // Update HTML lang attribute when language changes
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
  }, [lang, mounted]);

  const setLang = useCallback((code) => {
    if (['en', 'te', 'hi'].includes(code)) setLangState(code);
  }, []);

  // Translation function — supports nested keys like 'nav.home'
  const t = useCallback((key, vars = {}) => {
    const keys = key.split('.');
    let value = translations[lang];
    for (const k of keys) {
      if (value && typeof value === 'object') value = value[k];
      else { value = undefined; break; }
    }
    // Fallback to English
    if (value === undefined) {
      value = translations.en;
      for (const k of keys) {
        if (value && typeof value === 'object') value = value[k];
        else { value = key; break; }
      }
    }
    if (typeof value !== 'string') return key;
    // Replace {var} placeholders
    return Object.entries(vars).reduce(
      (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
      value
    );
  }, [lang]);

  // Direct access to full translation object for current lang
  const T = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, T, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

// Convenience hook — returns just the t() function
export function useT() {
  return useLanguage().t;
}
