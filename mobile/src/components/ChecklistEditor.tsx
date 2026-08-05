import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { ChecklistItem } from '../types';

interface Props {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ChecklistEditor({ items, onChange }: Props) {
  const theme = useTheme();
  const { t } = useI18n();
  const [draft, setDraft] = useState('');

  const toggle = (id: string) => {
    onChange(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const updateText = (id: string, text: string) => {
    onChange(items.map((i) => (i.id === id ? { ...i, text } : i)));
  };

  const addItem = () => {
    const text = draft.trim();
    if (!text) return;
    onChange([...items, { id: genId(), text, checked: false }]);
    setDraft('');
  };

  return (
    <View>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <Pressable onPress={() => toggle(item.id)} hitSlop={8}>
            <View
              style={[
                styles.checkbox,
                { borderColor: theme.primary, backgroundColor: item.checked ? theme.primary : 'transparent' },
              ]}
            >
              {item.checked ? <Text style={styles.check}>✓</Text> : null}
            </View>
          </Pressable>
          <TextInput
            value={item.text}
            onChangeText={(text) => updateText(item.id, text)}
            style={[
              styles.input,
              { color: theme.text, textDecorationLine: item.checked ? 'line-through' : 'none' },
            ]}
          />
          <Pressable onPress={() => removeItem(item.id)} hitSlop={8}>
            <Text style={{ color: theme.textSecondary }}>✕</Text>
          </Pressable>
        </View>
      ))}
      <View style={styles.row}>
        <View style={[styles.checkbox, { borderColor: theme.border }]} />
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={t.note.addItem}
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }]}
          onSubmitEditing={addItem}
          returnKeyType="done"
          blurOnSubmit={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 10,
  },
  check: { color: '#fff', fontSize: 12, fontWeight: '700' },
  input: { flex: 1, fontSize: 16, paddingVertical: 4 },
});
