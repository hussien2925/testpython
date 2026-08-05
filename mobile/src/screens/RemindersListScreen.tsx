import React, { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useReminders } from '../state/RemindersContext';
import { ReminderListItem } from '../components/ReminderListItem';
import { EmptyState } from '../components/EmptyState';
import { RootStackParamList } from '../navigation/types';
import { Reminder } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type FilterTab = 'active' | 'done' | 'all';

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function RemindersListScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<Nav>();
  const { reminders, toggleComplete } = useReminders();
  const [filter, setFilter] = useState<FilterTab>('active');

  const sections = useMemo(() => {
    const filtered = reminders.filter((r) => {
      if (filter === 'active') return !r.completed;
      if (filter === 'done') return r.completed;
      return true;
    });

    const timed = filtered.filter((r) => r.dueDate && !r.location);
    const located = filtered.filter((r) => r.location);
    const other = filtered.filter((r) => !r.dueDate && !r.location);

    const today: Reminder[] = timed.filter((r) => r.dueDate && isToday(r.dueDate));
    const upcoming: Reminder[] = timed.filter((r) => !r.dueDate || !isToday(r.dueDate));

    const result: { title: string; data: Reminder[] }[] = [];
    if (today.length) result.push({ title: t.home.today, data: today });
    if (upcoming.length) result.push({ title: t.location.upcomingRemindersHeader, data: upcoming });
    if (located.length) result.push({ title: t.location.locationRemindersHeader, data: located });
    if (other.length) result.push({ title: t.home.notes, data: other });
    return result;
  }, [reminders, filter, t]);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'active', label: t.home.tabActive },
    { key: 'done', label: t.home.tabDone },
    { key: 'all', label: t.home.tabAll },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t.home.reminders}</Text>
      </View>

      <View style={styles.filterRow}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setFilter(tab.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === tab.key ? theme.primary : theme.surface,
                borderColor: filter === tab.key ? theme.primary : theme.border,
              },
            ]}
          >
            <Text style={{ color: filter === tab.key ? theme.textInverse : theme.text, fontSize: 13, fontWeight: '600' }}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {sections.length === 0 ? (
        <EmptyState icon="⏰" message={t.home.emptyReminders} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <ReminderListItem
              reminder={item}
              onPress={() => navigation.navigate('ReminderDetail', { id: item.id })}
              onToggleComplete={() => toggleComplete(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 30, fontWeight: '800' },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  filterChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginTop: 12, marginBottom: 8 },
});
