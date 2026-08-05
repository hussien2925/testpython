import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { Reminder } from '../types';

interface Props {
  reminder: Reminder;
  onPress: () => void;
  onToggleComplete: () => void;
}

function formatDate(iso: string | null, lang: 'ar' | 'en'): string {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ReminderListItem({ reminder, onPress, onToggleComplete }: Props) {
  const theme = useTheme();
  const { lang } = useI18n();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Pressable onPress={onToggleComplete} hitSlop={10} style={styles.checkboxHit}>
        <View
          style={[
            styles.checkbox,
            { borderColor: theme.primary, backgroundColor: reminder.completed ? theme.primary : 'transparent' },
          ]}
        >
          {reminder.completed ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>
      </Pressable>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            { color: theme.text, textDecorationLine: reminder.completed ? 'line-through' : 'none' },
          ]}
          numberOfLines={2}
        >
          {reminder.title}
        </Text>
        {reminder.dueDate ? (
          <Text style={[styles.date, { color: theme.textSecondary }]}>{formatDate(reminder.dueDate, lang)}</Text>
        ) : null}
      </View>
      {reminder.timeSensitive ? <Text style={styles.badge}>🔔</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  checkboxHit: { padding: 4 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 12,
  },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  textContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  date: { fontSize: 13, marginTop: 3 },
  badge: { fontSize: 14, marginStart: 8 },
});
