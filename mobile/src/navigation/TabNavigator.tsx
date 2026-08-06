import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ChatScreen } from '../screens/ChatScreen';
import { RemindersListScreen } from '../screens/RemindersListScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { GlassTabBar } from '../components/GlassTabBar';
import { useI18n } from '../i18n/I18nContext';
import { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  const { t } = useI18n();

  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: t.chat.tab }} />
      <Tab.Screen name="Reminders" component={RemindersListScreen} options={{ title: t.home.reminders }} />
      <Tab.Screen name="Notes" component={NotesScreen} options={{ title: t.home.notes }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t.settings.title }} />
    </Tab.Navigator>
  );
}
