import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useNotes } from '../state/NotesContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { ChecklistEditor } from '../components/ChecklistEditor';
import { RootStackParamList } from '../navigation/types';
import { ChecklistItem, NoteTable } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type DetailRoute = RouteProp<RootStackParamList, 'NoteDetail'>;

function TableEditor({ table, onChange }: { table: NoteTable; onChange: (t: NoteTable) => void }) {
  const theme = useTheme();
  const { t } = useI18n();

  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    const rows = table.rows.map((row, r) => (r === rowIdx ? row.map((cell, c) => (c === colIdx ? value : cell)) : row));
    onChange({ ...table, rows });
  };

  const updateHeader = (colIdx: number, value: string) => {
    const headers = table.headers.map((h, i) => (i === colIdx ? value : h));
    onChange({ ...table, headers });
  };

  const addRow = () => onChange({ ...table, rows: [...table.rows, table.headers.map(() => '')] });
  const addColumn = () =>
    onChange({ headers: [...table.headers, `Col ${table.headers.length + 1}`], rows: table.rows.map((r) => [...r, '']) });

  return (
    <View>
      <ScrollView horizontal>
        <View>
          <View style={styles.tableRow}>
            {table.headers.map((h, i) => (
              <TextInput
                key={i}
                value={h}
                onChangeText={(v) => updateHeader(i, v)}
                style={[styles.tableCell, styles.tableHeaderCell, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}
              />
            ))}
          </View>
          {table.rows.map((row, r) => (
            <View key={r} style={styles.tableRow}>
              {row.map((cell, c) => (
                <TextInput
                  key={c}
                  value={cell}
                  onChangeText={(v) => updateCell(r, c, v)}
                  style={[styles.tableCell, { color: theme.text, borderColor: theme.border }]}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.tableActions}>
        <Pressable onPress={addRow}>
          <Text style={{ color: theme.primary }}>+ {t.note.addRow}</Text>
        </Pressable>
        <Pressable onPress={addColumn}>
          <Text style={{ color: theme.primary }}>+ {t.note.addColumn}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function NoteDetailScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<Nav>();
  const route = useRoute<DetailRoute>();
  const { notes, updateNote, deleteNote, togglePin } = useNotes();

  const note = notes.find((n) => n.id === route.params.id);

  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [items, setItems] = useState<ChecklistItem[]>(note?.items ?? []);
  const [table, setTable] = useState<NoteTable>(note?.table ?? { headers: ['A', 'B'], rows: [['', '']] });

  useEffect(() => {
    if (!note) navigation.goBack();
  }, [note, navigation]);

  useEffect(() => {
    if (!note) return;
    const timeout = setTimeout(() => {
      updateNote(note.id, { title, content, items, table });
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, items, table]);

  if (!note) return null;

  const confirmDelete = () => {
    Alert.alert(t.note.delete, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.note.delete,
        style: 'destructive',
        onPress: async () => {
          await deleteNote(note.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16 }}>{t.common.done}</Text>
        </Pressable>
        <Pressable onPress={() => togglePin(note.id)}>
          <Text style={{ fontSize: 18 }}>{note.pinned ? '📌' : '📍'}</Text>
        </Pressable>
        <Pressable onPress={confirmDelete}>
          <Text style={{ color: theme.danger, fontSize: 16 }}>{t.note.delete}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={t.note.title}
          placeholderTextColor={theme.textSecondary}
          style={[styles.titleInput, { color: theme.text }]}
        />

        {note.type === 'text' ? (
          <TextInput
            value={content}
            onChangeText={setContent}
            multiline
            placeholder={t.note.typeText}
            placeholderTextColor={theme.textSecondary}
            style={[styles.contentInput, { color: theme.text }]}
          />
        ) : null}

        {note.type === 'checklist' ? <ChecklistEditor items={items} onChange={setItems} /> : null}

        {note.type === 'table' ? <TableEditor table={table} onChange={setTable} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  content: { padding: 16, paddingBottom: 40 },
  titleInput: { fontSize: 22, fontWeight: '700', marginBottom: 12, paddingVertical: 8 },
  contentInput: { fontSize: 16, minHeight: 200, textAlignVertical: 'top' },
  tableRow: { flexDirection: 'row' },
  tableCell: { minWidth: 100, padding: 10, borderWidth: 0.5, fontSize: 14 },
  tableHeaderCell: { fontWeight: '700' },
  tableActions: { flexDirection: 'row', gap: 20, marginTop: 12 },
});
