import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useReminders } from '../state/RemindersContext';
import { useNotes } from '../state/NotesContext';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { parseInput } from '../nlp/parser';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type ComposeRoute = RouteProp<RootStackParamList, 'Compose'>;

export function ComposeScreen() {
  const theme = useTheme();
  const { t, lang } = useI18n();
  const navigation = useNavigation<Nav>();
  const route = useRoute<ComposeRoute>();
  const { addReminder } = useReminders();
  const { appendToChecklist, addNote } = useNotes();
  const [text, setText] = useState(route.params?.prefill ?? '');

  const intent = useMemo(() => (text.trim() ? parseInput(text) : null), [text]);

  const preview = useMemo(() => {
    if (!intent) return null;
    if (intent.kind === 'reminder') {
      if (!intent.dueDate) return t.compose.noDate;
      const date = new Date(intent.dueDate);
      const formatted = date.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
      return `${t.compose.detectedReminder} — ${t.compose.due} ${formatted}`;
    }
    if (intent.kind === 'checklist-add') return `${t.compose.detectedChecklist}: ${intent.listTitle}`;
    return t.compose.detectedNote;
  }, [intent, lang, t]);

  const save = async () => {
    if (!intent) return;
    if (intent.kind === 'reminder') {
      const created = await addReminder({
        title: intent.title,
        dueDate: intent.dueDate,
        isAllDay: intent.isAllDay,
        repeat: intent.repeat,
      });
      navigation.replace('ReminderDetail', { id: created.id });
    } else if (intent.kind === 'checklist-add') {
      await appendToChecklist(intent.listTitle, intent.itemText);
      navigation.goBack();
    } else {
      const created = await addNote({ type: 'text', title: intent.title, content: intent.content });
      navigation.replace('NoteDetail', { id: created.id });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={[styles.cancel, { color: theme.primary }]}>{t.common.cancel}</Text>
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>{t.compose.title}</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.body}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t.compose.placeholder}
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
            multiline
            autoFocus
          />
          <View style={styles.voiceRow}>
            <VoiceInputButton onResult={(t2) => setText((prev) => (prev ? `${prev} ${t2}` : t2))} />
          </View>
          {preview ? <Text style={[styles.preview, { color: theme.textSecondary }]}>{preview}</Text> : null}
        </View>

        <View style={styles.footer}>
          <PrimaryButton label={t.compose.save} onPress={save} disabled={!intent} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  cancel: { fontSize: 16, width: 60 },
  title: { fontSize: 17, fontWeight: '700' },
  body: { flex: 1, paddingHorizontal: 16 },
  input: { minHeight: 120, borderRadius: 16, borderWidth: 1, padding: 16, fontSize: 17, textAlignVertical: 'top' },
  voiceRow: { alignItems: 'center', marginTop: 16 },
  preview: { marginTop: 16, fontSize: 14, textAlign: 'center' },
  footer: { padding: 16 },
});
