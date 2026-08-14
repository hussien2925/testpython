import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { TabNavigator } from './TabNavigator';
import { ReminderDetailScreen } from '../screens/ReminderDetailScreen';
import { NoteDetailScreen } from '../screens/NoteDetailScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LocationPickerScreen } from '../screens/LocationPickerScreen';
import { useSettings } from '../state/SettingsContext';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { settings, loaded } = useSettings();
  const theme = useTheme();
  const { t } = useI18n();

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#150F3D' }}>
        <ActivityIndicator size="large" color="#FFB020" />
      </View>
    );
  }

  const navTheme = {
    dark: theme.mode === 'dark',
    colors: {
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      notification: theme.primary,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' as const },
      medium: { fontFamily: 'System', fontWeight: '500' as const },
      bold: { fontFamily: 'System', fontWeight: '700' as const },
      heavy: { fontFamily: 'System', fontWeight: '900' as const },
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!settings.onboardingComplete ? (
          <Stack.Screen name="Onboarding">
            {({ navigation }) => <OnboardingScreen onDone={() => navigation.replace('Tabs')} />}
          </Stack.Screen>
        ) : null}
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen
          name="ReminderDetail"
          component={ReminderDetailScreen}
          options={{ headerShown: true, title: t.reminder.title, presentation: 'modal' }}
        />
        <Stack.Screen name="NoteDetail" component={NoteDetailScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="LocationPicker" component={LocationPickerScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
