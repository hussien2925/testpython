import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider } from './src/state/SettingsContext';
import { RemindersProvider } from './src/state/RemindersContext';
import { NotesProvider } from './src/state/NotesContext';
import { SubscriptionProvider } from './src/subscriptions/SubscriptionContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { I18nProvider } from './src/i18n/I18nContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { setupNotificationCategories } from './src/notifications/notifications';

function StatusBarBridge() {
  const theme = useTheme();
  return <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />;
}

export default function App() {
  useEffect(() => {
    setupNotificationCategories();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <I18nProvider>
            <ThemeProvider>
              <RemindersProvider>
                <NotesProvider>
                  <SubscriptionProvider>
                    <StatusBarBridge />
                    <RootNavigator />
                  </SubscriptionProvider>
                </NotesProvider>
              </RemindersProvider>
            </ThemeProvider>
          </I18nProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
