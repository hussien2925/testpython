import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useChat } from '../state/ChatContext';
import { useChatController } from '../ai/useChatController';
import { ChatBubble } from '../components/ChatBubble';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ChatScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<Nav>();
  const { messages, clear } = useChat();
  const { send, isSending, aiEnabled } = useChatController();
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages.length, isSending]);

  const handleSend = async (text: string) => {
    const value = text.trim();
    if (!value) return;
    setDraft('');
    await send(value);
  };

  const confirmClear = () => {
    if (messages.length === 0) return;
    Alert.alert(t.chat.clearHistory, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.chat.clearHistory, style: 'destructive', onPress: () => clear() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t.chat.tab}</Text>
        {messages.length > 0 ? (
          <Pressable onPress={confirmClear} hitSlop={10}>
            <Text style={{ color: theme.textSecondary, fontSize: 20 }}>⋮</Text>
          </Pressable>
        ) : null}
      </View>

      {!aiEnabled ? (
        <View style={[styles.notice, { backgroundColor: theme.warning + '22', borderColor: theme.warning }]}>
          <Text style={{ color: theme.text, fontSize: 12, lineHeight: 17 }}>{t.chat.aiOffNotice}</Text>
        </View>
      ) : null}

      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>{t.chat.emptyTitle}</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>{t.chat.emptySubtitle}</Text>
          <View style={styles.tips}>
            {[t.chat.tipTime, t.chat.tipLocation, t.chat.tipChecklist].map((tip) => (
              <Pressable
                key={tip}
                onPress={() => setDraft(tip.replace(/^"|"$/g, ''))}
                style={[styles.tipChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <Text style={{ color: theme.text, fontSize: 13 }}>{tip}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <ChatBubble message={item} />}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {isSending ? (
        <View style={styles.thinkingRow}>
          <View style={[styles.thinkingBubble, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{t.chat.thinking}</Text>
          </View>
        </View>
      ) : null}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Pressable
            onPress={() => navigation.navigate('LocationPicker', { returnTo: 'chat' })}
            style={[styles.iconButton, { backgroundColor: theme.surfaceAlt }]}
            accessibilityLabel="add location reminder"
          >
            <Text style={{ fontSize: 18 }}>📍</Text>
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t.chat.inputPlaceholder}
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text }]}
            multiline
            onSubmitEditing={() => handleSend(draft)}
            editable={!isSending}
          />
          <VoiceInputButton onResult={(text) => handleSend(text)} />
          <Pressable
            onPress={() => handleSend(draft)}
            disabled={!draft.trim() || isSending}
            style={[
              styles.sendButton,
              { backgroundColor: theme.primary, opacity: !draft.trim() || isSending ? 0.4 : 1 },
            ]}
          >
            <Text style={{ color: theme.textInverse, fontSize: 16 }}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 30, fontWeight: '800' },
  notice: { marginHorizontal: 16, padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  tips: { alignSelf: 'stretch', gap: 8 },
  tipChip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 8 },
  thinkingRow: { paddingHorizontal: 16, marginBottom: 6 },
  thinkingBubble: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 6,
    borderRadius: 22,
    borderWidth: 1,
    gap: 6,
  },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, fontSize: 15, paddingHorizontal: 6, paddingVertical: 10, maxHeight: 120 },
  sendButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
