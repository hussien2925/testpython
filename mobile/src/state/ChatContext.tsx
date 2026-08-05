import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { readJSON, writeJSON } from '../storage/storage';
import { ChatArtifact, ChatMessage } from '../types';

interface ChatContextValue {
  messages: ChatMessage[];
  loaded: boolean;
  appendMessage: (
    role: ChatMessage['role'],
    content: string,
    artifacts?: ChatArtifact[]
  ) => Promise<ChatMessage>;
  clear: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const MAX_HISTORY = 100;

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await readJSON<ChatMessage[]>('chat', [] as ChatMessage[]);
      setMessages(stored);
      setLoaded(true);
    })();
  }, []);

  const persist = useCallback(async (next: ChatMessage[]) => {
    setMessages(next);
    await writeJSON('chat', next);
  }, []);

  const appendMessage = useCallback(
    async (role: ChatMessage['role'], content: string, artifacts?: ChatArtifact[]) => {
      const message: ChatMessage = {
        id: genId(),
        role,
        content,
        artifacts: artifacts ?? [],
        createdAt: new Date().toISOString(),
      };
      const next = [...messages, message].slice(-MAX_HISTORY);
      await persist(next);
      return message;
    },
    [messages, persist]
  );

  const clear = useCallback(async () => {
    await persist([]);
  }, [persist]);

  return (
    <ChatContext.Provider value={{ messages, loaded, appendMessage, clear }}>{children}</ChatContext.Provider>
  );
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
