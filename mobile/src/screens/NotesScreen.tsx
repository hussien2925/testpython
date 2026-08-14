import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useNotes } from '../state/NotesContext';
import { useSubscription } from '../subscriptions/SubscriptionContext';
import { NoteListItem } from '../components/NoteListItem';
import { EmptyState } from '../components/EmptyState';
import { RootStackParamList } from '../navigation/types';
import { NoteType } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const NEW_NOTE_OPTIONS: { type: NoteType; icon: string; labelKey: 'typeText' | 'typeChecklist' | 'typeTable' }[] = [
  { type: 'text', icon: '📝', labelKey: 'typeText' },
  { type: 'checklist', icon: '☑️', labelKey: 'typeChecklist' },
  { type: 'table', icon: '📊', labelKey: 'typeTable' },
];

export function NotesScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<Nav>();
  const { notes, addNote } = useNotes();
  const { tier } = useSubscription();
  const [showNewMenu, setShowNewMenu] = useState(false);

  const sorted = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes]);

  const createNote = async (type: NoteType) => {
    setShowNewMenu(false);
    const created = await addNote({ type, title: '' });
    navigation.navigate('NoteDetail', { id: created.id });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t.home.notes}</Text>
        <Pressable
          onPress={() => setShowNewMenu((v) => !v)}
          style={[styles.addButton, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.addIcon}>+</Text>
        </Pressable>
      </View>

      {showNewMenu ? (
        <View style={[styles.menu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {NEW_NOTE_OPTIONS.map((opt) => (
            <Pressable key={opt.type} style={styles.menuItem} onPress={() => createNote(opt.type)}>
              <Text style={styles.menuIcon}>{opt.icon}</Text>
              <Text style={[styles.menuLabel, { color: theme.text }]}>{t.note[opt.labelKey]}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {sorted.length === 0 ? (
        <EmptyState icon="🗒️" message={t.home.emptyNotes} />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <NoteListItem note={item} onPress={() => navigation.navigate('NoteDetail', { id: item.id })} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 30, fontWeight: '800' },
  addButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  addIcon: { color: '#fff', fontSize: 22, fontWeight: '600', marginTop: -2 },
  menu: { marginHorizontal: 16, marginBottom: 12, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  menuIcon: { fontSize: 16 },
  menuLabel: { fontSize: 15, fontWeight: '500' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
});
