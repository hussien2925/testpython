import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useReminders } from '../state/RemindersContext';
import { useSubscription } from '../subscriptions/SubscriptionContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/types';
import { RepeatRule } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type DetailRoute = RouteProp<RootStackParamList, 'ReminderDetail'>;

const REPEAT_OPTIONS: RepeatRule[] = ['none', 'daily', 'weekly', 'monthly', 'yearly'];

export function ReminderDetailScreen() {
  const theme = useTheme();
  const { t, lang } = useI18n();
  const navigation = useNavigation<Nav>();
  const route = useRoute<DetailRoute>();
  const { reminders, updateReminder, deleteReminder, toggleComplete } = useReminders();
  const { tier } = useSubscription();

  const reminder = reminders.find((r) => r.id === route.params.id);

  const [title, setTitle] = useState(reminder?.title ?? '');
  const [notes, setNotes] = useState(reminder?.notes ?? '');
  const [dueDate, setDueDate] = useState<Date | null>(reminder?.dueDate ? new Date(reminder.dueDate) : null);
  const [repeat, setRepeat] = useState<RepeatRule>(reminder?.repeat ?? 'none');
  const [timeSensitive, setTimeSensitive] = useState(reminder?.timeSensitive ?? false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!reminder) navigation.goBack();
  }, [reminder, navigation]);

  if (!reminder) return null;

  const onToggleTimeSensitive = (value: boolean) => {
    if (value && tier === 'free') {
      navigation.navigate('Paywall');
      return;
    }
    setTimeSensitive(value);
  };

  const save = async () => {
    await updateReminder(reminder.id, {
      title: title.trim() || reminder.title,
      notes,
      dueDate: dueDate ? dueDate.toISOString() : null,
      repeat,
      timeSensitive,
    });
    navigation.goBack();
  };

  const confirmDelete = () => {
    Alert.alert(t.reminder.delete, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.reminder.delete,
        style: 'destructive',
        onPress: async () => {
          await deleteReminder(reminder.id);
          navigation.goBack();
        },
      },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16 }}>{t.common.cancel}</Text>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable onPress={save}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>{t.reminder.save}</Text>
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, title, notes, dueDate, repeat, timeSensitive]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={t.reminder.titleField}
          placeholderTextColor={theme.textSecondary}
          style={[styles.titleInput, { color: theme.text }]}
        />

        <Pressable
          onPress={() => setShowPicker(true)}
          style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Text style={[styles.rowLabel, { color: theme.text }]}>{t.reminder.date}</Text>
          <Text style={{ color: theme.primary, fontWeight: '600' }}>
            {dueDate
              ? dueDate.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })
              : '—'}
          </Text>
        </Pressable>

        {showPicker ? (
          <DateTimePicker
            value={dueDate ?? new Date()}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_, selected) => {
              if (Platform.OS !== 'ios') setShowPicker(false);
              if (selected) setDueDate(selected);
            }}
          />
        ) : null}

        <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.rowLabel, { color: theme.text }]}>{t.reminder.timeSensitive}</Text>
          <Switch value={timeSensitive} onValueChange={onToggleTimeSensitive} />
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{t.reminder.repeat}</Text>
        <View style={styles.chipsRow}>
          {REPEAT_OPTIONS.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => setRepeat(opt)}
              style={[
                styles.chip,
                {
                  backgroundColor: repeat === opt ? theme.primary : theme.surfaceAlt,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={{ color: repeat === opt ? theme.textInverse : theme.text, fontSize: 13 }}>
                {t.reminder.repeatOptions[opt]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{t.reminder.notes}</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          style={[styles.notesInput, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
        />

        <View style={styles.actions}>
          <PrimaryButton
            label={reminder.completed ? t.reminder.markUndone : t.reminder.markDone}
            variant="secondary"
            onPress={() => toggleComplete(reminder.id)}
          />
          <PrimaryButton label={t.reminder.save} onPress={save} />
          <PrimaryButton label={t.reminder.delete} variant="danger" onPress={confirmDelete} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  titleInput: { fontSize: 22, fontWeight: '700', marginBottom: 16, paddingVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  sectionLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginTop: 8, marginBottom: 8 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1 },
  notesInput: { minHeight: 80, borderRadius: 14, borderWidth: 1, padding: 14, fontSize: 15, textAlignVertical: 'top', marginBottom: 12 },
  actions: { gap: 10, marginTop: 12 },
});
