import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { I18nManager } from 'react-native';
import * as Localization from 'expo-localization';
import { readJSON, writeJSON } from '../storage/storage';
import { AppSettings } from '../types';

interface SettingsContextValue {
  settings: AppSettings;
  loaded: boolean;
  setLanguage: (language: AppSettings['language']) => Promise<void>;
  setThemePreference: (theme: AppSettings['themePreference']) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

function detectDefaultLanguage(): AppSettings['language'] {
  const locales = Localization.getLocales();
  const tag = locales[0]?.languageCode ?? 'en';
  return tag === 'ar' ? 'ar' : 'en';
}

const defaultSettings: AppSettings = {
  language: detectDefaultLanguage(),
  themePreference: 'system',
  onboardingComplete: false,
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        console.log('[SettingsProvider] Loading settings...');
        const stored = await readJSON<AppSettings>('settings', defaultSettings);
        console.log('[SettingsProvider] Loaded:', stored);
        setSettings(stored);
        setLoaded(true);
        console.log('[SettingsProvider] Ready');
      } catch (err) {
        console.error('[SettingsProvider] Error:', err);
        setLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback(async (next: AppSettings) => {
    setSettings(next);
    await writeJSON('settings', next);
  }, []);

  const setLanguage = useCallback(
    async (language: AppSettings['language']) => {
      const next = { ...settings, language };
      await persist(next);
      const shouldBeRTL = language === 'ar';
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
      }
    },
    [settings, persist]
  );

  const setThemePreference = useCallback(
    async (themePreference: AppSettings['themePreference']) => {
      await persist({ ...settings, themePreference });
    },
    [settings, persist]
  );

  const completeOnboarding = useCallback(async () => {
    await persist({ ...settings, onboardingComplete: true });
  }, [settings, persist]);

  return (
    <SettingsContext.Provider value={{ settings, loaded, setLanguage, setThemePreference, completeOnboarding }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
