import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useReminders } from '../state/RemindersContext';
import { useSubscription } from '../subscriptions/SubscriptionContext';
import { FREE_PLAN_LIMITS } from '../subscriptions/config';
import { ReminderListItem } from '../components/ReminderListItem';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { EmptyState } from '../components/EmptyState';
import { parseInput } from '../nlp/parser';
import { useNotes } from '../state/NotesContext';
import { RootStackParamList } from '../navigation/types';
import { Reminder } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function HomeScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<Nav>();
  const { reminders, addReminder, toggleComplete } = useReminders();
  const { appendToChecklist, addNote } = useNotes();
  const { tier } = useSubscription();
  const [draft, setDraft] = useState('');

  const sections = useMemo(() => {
    const active = reminders.filter((r) => !r.completed);
    const completed = reminders.filter((r) => r.completed);
    const today: Reminder[] = active.filter((r) => r.dueDate && isToday(r.dueDate));
    const upcoming: Reminder[] = active.filter((r) => !r.dueDate || !isToday(r.dueDate));

    const result: { title: string; data: Reminder[] }[] = [];
    if (today.length) result.push({ title: t.home.today, data: today });
    if (upcoming.length) result.push({ title: t.home.upcoming, data: upcoming });
    if (completed.length) result.push({ title: t.home.completed, data: completed.slice(0, 20) });
    return result;
  }, [reminders, t]);

  const handleQuickSubmit = async (text: string) => {
    const value = text.trim();
    if (!value) return;

    if (tier === 'free' && reminders.length >= FREE_PLAN_LIMITS.maxReminders) {
      navigation.navigate('Paywall');
      return;
    }

    const intent = parseInput(value);
    if (intent.kind === 'reminder') {
      const created = await addReminder({ title: intent.title, dueDate: intent.dueDate, isAllDay: intent.isAllDay, repeat: intent.repeat });
      setDraft('');
      navigation.navigate('ReminderDetail', { id: created.id });
    } else if (intent.kind === 'checklist-add') {
      await appendToChecklist(intent.listTitle, intent.itemText);
      setDraft('');
    } else {
      const created = await addNote({ type: 'text', title: intent.title, content: intent.content });
      setDraft('');
      navigation.navigate('NoteDetail', { id: created.id });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t.home.title}</Text>
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

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.composeBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t.home.composePlaceholder}
            placeholderTextColor={theme.textSecondary}
            style={[styles.composeInput, { color: theme.text }]}
            onSubmitEditing={() => handleQuickSubmit(draft)}
            returnKeyType="send"
          />
          <VoiceInputButton onResult={(text) => handleQuickSubmit(text)} />
          <Pressable
            onPress={() => handleQuickSubmit(draft)}
            style={[styles.sendButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 30, fontWeight: '800' },
  listContent: { paddingHorizontal: 16, paddingBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginTop: 12, marginBottom: 8 },
  composeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  composeInput: { flex: 1, fontSize: 15, paddingHorizontal: 8, paddingVertical: 8 },
  sendButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { color: '#fff', fontSize: 16 },
});
