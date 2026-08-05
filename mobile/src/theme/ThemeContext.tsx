import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, Theme } from './colors';
import { useSettings } from '../state/SettingsContext';

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const systemScheme = useColorScheme();

  const theme = useMemo(() => {
    const effective =
      settings.themePreference === 'system' ? systemScheme ?? 'light' : settings.themePreference;
    return effective === 'dark' ? darkTheme : lightTheme;
  }, [settings.themePreference, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
