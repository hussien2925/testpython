import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { readJSON, writeJSON } from '../storage/storage';
import { Reminder, RepeatRule } from '../types';
import { cancelReminderNotification, scheduleReminderNotification } from '../notifications/notifications';

interface CreateReminderInput {
  title: string;
  notes?: string;
  dueDate: string | null;
  isAllDay?: boolean;
  repeat?: RepeatRule;
  timeSensitive?: boolean;
}

interface RemindersContextValue {
  reminders: Reminder[];
  loaded: boolean;
  addReminder: (input: CreateReminderInput) => Promise<Reminder>;
  updateReminder: (id: string, patch: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
}

const RemindersContext = createContext<RemindersContextValue | null>(null);

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await readJSON<Reminder[]>('reminders', []);
      setReminders(stored);
      setLoaded(true);
    })();
  }, []);

  const persist = useCallback(async (next: Reminder[]) => {
    setReminders(next);
    await writeJSON('reminders', next);
  }, []);

  const addReminder = useCallback(
    async (input: CreateReminderInput) => {
      const now = new Date().toISOString();
      const reminder: Reminder = {
        id: genId(),
        title: input.title,
        notes: input.notes ?? '',
        dueDate: input.dueDate,
        isAllDay: input.isAllDay ?? false,
        location: null,
        repeat: input.repeat ?? 'none',
        timeSensitive: input.timeSensitive ?? false,
        completed: false,
        createdAt: now,
        updatedAt: now,
        notificationId: null,
      };
      if (reminder.dueDate) {
        reminder.notificationId = await scheduleReminderNotification(reminder);
      }
      await persist([reminder, ...reminders]);
      return reminder;
    },
    [reminders, persist]
  );

  const updateReminder = useCallback(
    async (id: string, patch: Partial<Reminder>) => {
      const existing = reminders.find((r) => r.id === id);
      if (!existing) return;
      const updated: Reminder = { ...existing, ...patch, updatedAt: new Date().toISOString() };

      const dueDateChanged = patch.dueDate !== undefined && patch.dueDate !== existing.dueDate;
      const timeSensitiveChanged = patch.timeSensitive !== undefined && patch.timeSensitive !== existing.timeSensitive;
      if (dueDateChanged || timeSensitiveChanged) {
        if (existing.notificationId) await cancelReminderNotification(existing.notificationId);
        updated.notificationId = updated.dueDate ? await scheduleReminderNotification(updated) : null;
      }

      await persist(reminders.map((r) => (r.id === id ? updated : r)));
    },
    [reminders, persist]
  );

  const deleteReminder = useCallback(
    async (id: string) => {
      const existing = reminders.find((r) => r.id === id);
      if (existing?.notificationId) await cancelReminderNotification(existing.notificationId);
      await persist(reminders.filter((r) => r.id !== id));
    },
    [reminders, persist]
  );

  const toggleComplete = useCallback(
    async (id: string) => {
      const existing = reminders.find((r) => r.id === id);
      if (!existing) return;
      const completed = !existing.completed;
      let notificationId = existing.notificationId;
      if (completed && notificationId) {
        await cancelReminderNotification(notificationId);
        notificationId = null;
      }
      await persist(
        reminders.map((r) =>
          r.id === id ? { ...r, completed, notificationId, updatedAt: new Date().toISOString() } : r
        )
      );
    },
    [reminders, persist]
  );

  return (
    <RemindersContext.Provider
      value={{ reminders, loaded, addReminder, updateReminder, deleteReminder, toggleComplete }}
    >
      {children}
    </RemindersContext.Provider>
  );
}

export function useReminders(): RemindersContextValue {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders must be used within RemindersProvider');
  return ctx;
}
