import React, { createContext, useContext, useMemo } from 'react';
import { translations, Language, TranslationShape } from './translations';
import { useSettings } from '../state/SettingsContext';

interface I18nValue {
  t: TranslationShape;
  lang: Language;
  isRTL: boolean;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const value = useMemo<I18nValue>(() => {
    const lang = settings.language;
    return { t: translations[lang], lang, isRTL: lang === 'ar' };
  }, [settings.language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
