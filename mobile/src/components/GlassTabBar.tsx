import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';
import { TabParamList } from '../navigation/types';

// Docked (not floating) so it reserves its own layout space like a normal
// tab bar — every screen keeps working exactly as before, just with a
// frosted-glass look instead of a solid background.
const ICONS: Record<keyof TabParamList, string> = {
  Chat: '💬',
  Reminders: '⏰',
  Notes: '🗒️',
  Settings: '⚙️',
};

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={theme.mode === 'dark' ? 60 : 80}
      tint={theme.mode === 'dark' ? 'dark' : 'light'}
      style={[
        styles.bar,
        {
          paddingBottom: insets.bottom + 6,
          borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.6)',
          backgroundColor: theme.mode === 'dark' ? 'rgba(21,15,61,0.55)' : 'rgba(255,255,255,0.55)',
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label = (options.title ?? route.name) as string;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            style={styles.tabItem}
          >
            <View
              style={[
                styles.iconBubble,
                isFocused && { backgroundColor: theme.primary + (theme.mode === 'dark' ? '33' : '22') },
              ]}
            >
              <Text style={{ fontSize: 19, opacity: isFocused ? 1 : 0.55 }}>
                {ICONS[route.name as keyof TabParamList]}
              </Text>
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                { color: isFocused ? theme.primary : theme.textSecondary, fontWeight: isFocused ? '700' : '500' },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 6,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
      },
      android: { elevation: 12 },
    }),
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  iconBubble: {
    width: 36,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 11 },
});
