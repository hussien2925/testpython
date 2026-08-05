import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Note } from '../types';

const TYPE_ICON: Record<Note['type'], string> = {
  text: '📝',
  checklist: '☑️',
  table: '📊',
};

function preview(note: Note): string {
  if (note.type === 'checklist') {
    const done = note.items.filter((i) => i.checked).length;
    return `${done}/${note.items.length} • ${note.items.slice(0, 3).map((i) => i.text).join(', ')}`;
  }
  if (note.type === 'table') {
    return note.table ? `${note.table.rows.length} rows` : '';
  }
  return note.content.slice(0, 80);
}

export function NoteListItem({ note, onPress }: { note: Note; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.icon}>{TYPE_ICON[note.type]}</Text>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {note.title || preview(note)}
        </Text>
        {note.pinned ? <Text style={styles.pin}>📌</Text> : null}
      </View>
      <Text style={[styles.preview, { color: theme.textSecondary }]} numberOfLines={2}>
        {preview(note)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  icon: { fontSize: 16, marginEnd: 8 },
  title: { fontSize: 16, fontWeight: '600', flex: 1 },
  pin: { fontSize: 13, marginStart: 6 },
  preview: { fontSize: 13, lineHeight: 18 },
});
