import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ChatScreen } from '../screens/ChatScreen';
import { RemindersListScreen } from '../screens/RemindersListScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, string> = {
  Chat: '💬',
  Reminders: '⏰',
  Notes: '🗒️',
  Settings: '⚙️',
};

export function TabNavigator() {
  const theme = useTheme();
  const { t } = useI18n();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{ICONS[route.name as keyof TabParamList]}</Text>,
      })}
    >
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: t.chat.tab }} />
      <Tab.Screen name="Reminders" component={RemindersListScreen} options={{ title: t.home.reminders }} />
      <Tab.Screen name="Notes" component={NotesScreen} options={{ title: t.home.notes }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t.settings.title }} />
    </Tab.Navigator>
  );
}
