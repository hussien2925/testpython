import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider } from './src/state/SettingsContext';
import { RemindersProvider } from './src/state/RemindersContext';
import { NotesProvider } from './src/state/NotesContext';
import { ChatProvider } from './src/state/ChatContext';
import { SubscriptionProvider } from './src/subscriptions/SubscriptionContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { I18nProvider } from './src/i18n/I18nContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { setupNotificationCategories } from './src/notifications/notifications';
// Importing this module runs its top-level TaskManager.defineTask side effect,
// which must happen before any geofencing callback can fire.
import './src/location/geofencing';

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
                  <ChatProvider>
                    <SubscriptionProvider>
                      <StatusBarBridge />
                      <RootNavigator />
                    </SubscriptionProvider>
                  </ChatProvider>
                </NotesProvider>
              </RemindersProvider>
            </ThemeProvider>
          </I18nProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
