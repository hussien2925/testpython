import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { readJSON, writeJSON } from '../storage/storage';
import { ChecklistItem, Note, NoteType } from '../types';

interface CreateNoteInput {
  type: NoteType;
  title: string;
  content?: string;
  items?: ChecklistItem[];
}

interface NotesContextValue {
  notes: Note[];
  loaded: boolean;
  addNote: (input: CreateNoteInput) => Promise<Note>;
  updateNote: (id: string, patch: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  appendToChecklist: (listTitle: string, itemText: string) => Promise<Note>;
  toggleChecklistItem: (noteId: string, itemId: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextValue | null>(null);

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await readJSON<Note[]>('notes', []);
      setNotes(stored);
      setLoaded(true);
    })();
  }, []);

  const persist = useCallback(async (next: Note[]) => {
    setNotes(next);
    await writeJSON('notes', next);
  }, []);

  const addNote = useCallback(
    async (input: CreateNoteInput) => {
      const now = new Date().toISOString();
      const note: Note = {
        id: genId(),
        type: input.type,
        title: input.title,
        content: input.content ?? '',
        items: input.items ?? [],
        table: input.type === 'table' ? { headers: ['A', 'B'], rows: [['', '']] } : null,
        pinned: false,
        createdAt: now,
        updatedAt: now,
      };
      await persist([note, ...notes]);
      return note;
    },
    [notes, persist]
  );

  const updateNote = useCallback(
    async (id: string, patch: Partial<Note>) => {
      await persist(
        notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n))
      );
    },
    [notes, persist]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      await persist(notes.filter((n) => n.id !== id));
    },
    [notes, persist]
  );

  const togglePin = useCallback(
    async (id: string) => {
      await persist(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
    },
    [notes, persist]
  );

  const appendToChecklist = useCallback(
    async (listTitle: string, itemText: string) => {
      const normalized = listTitle.trim().toLowerCase();
      const existing = notes.find((n) => n.type === 'checklist' && n.title.trim().toLowerCase() === normalized);
      const newItem: ChecklistItem = { id: genId(), text: itemText, checked: false };

      if (existing) {
        const updated: Note = {
          ...existing,
          items: [...existing.items, newItem],
          updatedAt: new Date().toISOString(),
        };
        await persist(notes.map((n) => (n.id === existing.id ? updated : n)));
        return updated;
      }

      const now = new Date().toISOString();
      const created: Note = {
        id: genId(),
        type: 'checklist',
        title: listTitle,
        content: '',
        items: [newItem],
        table: null,
        pinned: false,
        createdAt: now,
        updatedAt: now,
      };
      await persist([created, ...notes]);
      return created;
    },
    [notes, persist]
  );

  const toggleChecklistItem = useCallback(
    async (noteId: string, itemId: string) => {
      const existing = notes.find((n) => n.id === noteId);
      if (!existing) return;
      const items = existing.items.map((it) => (it.id === itemId ? { ...it, checked: !it.checked } : it));
      await persist(notes.map((n) => (n.id === noteId ? { ...n, items, updatedAt: new Date().toISOString() } : n)));
    },
    [notes, persist]
  );

  return (
    <NotesContext.Provider
      value={{ notes, loaded, addNote, updateNote, deleteNote, togglePin, appendToChecklist, toggleChecklistItem }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes(): NotesContextValue {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
}
