import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useReminders } from '../state/RemindersContext';
import { useNotes } from '../state/NotesContext';
import { ChatArtifact, ChatMessage } from '../types';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function ArtifactCard({ artifact }: { artifact: ChatArtifact }) {
  const theme = useTheme();
  const { t, lang } = useI18n();
  const navigation = useNavigation<Nav>();
  const { reminders } = useReminders();
  const { notes } = useNotes();

  if (artifact.kind === 'error') {
    return (
      <View style={[styles.card, { borderColor: theme.danger, backgroundColor: theme.surfaceAlt }]}>
        <Text style={{ color: theme.danger, fontSize: 13 }}>⚠ {t.chat.error}</Text>
      </View>
    );
  }

  if (artifact.kind === 'reminder-created') {
    const reminder = reminders.find((r) => r.id === artifact.reminderId);
    if (!reminder) return null;
    const when = reminder.dueDate
      ? new Date(reminder.dueDate).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : '';
    return (
      <Pressable
        onPress={() => navigation.navigate('ReminderDetail', { id: reminder.id })}
        style={[styles.card, { borderColor: theme.primary, backgroundColor: theme.surface }]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>⏰</Text>
          <Text style={[styles.cardKind, { color: theme.primary }]}>{t.chat.reminderCard}</Text>
        </View>
        <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
          {reminder.title}
        </Text>
        {when ? <Text style={[styles.cardMeta, { color: theme.textSecondary }]}>{when}</Text> : null}
      </Pressable>
    );
  }

  if (artifact.kind === 'location-reminder-created') {
    const reminder = reminders.find((r) => r.id === artifact.reminderId);
    if (!reminder) return null;
    const triggerLabel = reminder.location?.trigger === 'leave' ? t.chat.leaveTrigger : t.chat.arriveTrigger;
    return (
      <Pressable
        onPress={() => navigation.navigate('ReminderDetail', { id: reminder.id })}
        style={[styles.card, { borderColor: theme.accent, backgroundColor: theme.surface }]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>📍</Text>
          <Text style={[styles.cardKind, { color: theme.accent }]}>{t.chat.locationReminderCard}</Text>
          <View style={[styles.badge, { backgroundColor: theme.surfaceAlt }]}>
            <Text style={{ color: theme.text, fontSize: 11, fontWeight: '600' }}>{triggerLabel}</Text>
          </View>
        </View>
        <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
          {reminder.title}
        </Text>
        {reminder.location ? (
          <Text style={[styles.cardMeta, { color: theme.textSecondary }]} numberOfLines={1}>
            {reminder.location.name}
          </Text>
        ) : null}
      </Pressable>
    );
  }

  if (artifact.kind === 'note-created') {
    const note = notes.find((n) => n.id === artifact.noteId);
    if (!note) return null;
    return (
      <Pressable
        onPress={() => navigation.navigate('NoteDetail', { id: note.id })}
        style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>📝</Text>
          <Text style={[styles.cardKind, { color: theme.textSecondary }]}>{t.chat.noteCard}</Text>
        </View>
        <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
          {note.title || note.content.slice(0, 60)}
        </Text>
      </Pressable>
    );
  }

  if (artifact.kind === 'checklist-updated') {
    const note = notes.find((n) => n.id === artifact.noteId);
    if (!note) return null;
    return (
      <Pressable
        onPress={() => navigation.navigate('NoteDetail', { id: note.id })}
        style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>☑️</Text>
          <Text style={[styles.cardKind, { color: theme.textSecondary }]}>{t.chat.checklistCard}</Text>
        </View>
        <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
          {note.title}
        </Text>
        <Text style={[styles.cardMeta, { color: theme.textSecondary }]}>
          {t.chat.itemAddedTo}: {artifact.itemText}
        </Text>
      </Pressable>
    );
  }

  return null;
}

export function ChatBubble({ message }: { message: ChatMessage }) {
  const theme = useTheme();
  const isUser = message.role === 'user';

  const bubbleStyle = isUser
    ? { backgroundColor: theme.primary, alignSelf: 'flex-end' as const }
    : { backgroundColor: theme.surface, alignSelf: 'flex-start' as const, borderColor: theme.border, borderWidth: 1 };
  const textColor = isUser ? theme.textInverse : theme.text;

  return (
    <View style={styles.container}>
      {message.content ? (
        <View style={[styles.bubble, bubbleStyle]}>
          <Text style={{ color: textColor, fontSize: 15, lineHeight: 21 }}>{message.content}</Text>
        </View>
      ) : null}
      {message.artifacts.length > 0 ? (
        <View style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '85%', marginTop: 6 }}>
          {message.artifacts.map((artifact, i) => (
            <ArtifactCard key={i} artifact={artifact} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  bubble: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18, maxWidth: '85%' },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginTop: 6,
    minWidth: 220,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  cardIcon: { fontSize: 14 },
  cardKind: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  cardTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  cardMeta: { fontSize: 13 },
});
