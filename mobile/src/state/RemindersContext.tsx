import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { readJSON, writeJSON } from '../storage/storage';
import { Reminder, ReminderLocation, RepeatRule } from '../types';
import { cancelReminderNotification, scheduleReminderNotification } from '../notifications/notifications';
import { syncGeofences } from '../location/geofencing';

interface CreateReminderInput {
  title: string;
  notes?: string;
  dueDate: string | null;
  isAllDay?: boolean;
  repeat?: RepeatRule;
  timeSensitive?: boolean;
  location?: ReminderLocation | null;
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
  const geofenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await readJSON<Reminder[]>('reminders', []);
      setReminders(stored);
      setLoaded(true);
    })();
  }, []);

  // Debounce geofence syncs so a burst of edits doesn't hammer the OS API.
  useEffect(() => {
    if (!loaded) return;
    if (geofenceTimer.current) clearTimeout(geofenceTimer.current);
    geofenceTimer.current = setTimeout(() => {
      syncGeofences(reminders.filter((r) => !r.completed));
    }, 300);
    return () => {
      if (geofenceTimer.current) clearTimeout(geofenceTimer.current);
    };
  }, [reminders, loaded]);

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
        location: input.location ?? null,
        repeat: input.repeat ?? 'none',
        timeSensitive: input.timeSensitive ?? false,
        completed: false,
        createdAt: now,
        updatedAt: now,
        notificationId: null,
        geofenceRegionId: null,
      };
      if (reminder.dueDate) {
        reminder.notificationId = await scheduleReminderNotification(reminder);
      }
      if (reminder.location) {
        reminder.geofenceRegionId = `waqtak:${reminder.id}:${reminder.location.trigger}`;
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

      if (patch.location !== undefined) {
        updated.geofenceRegionId = updated.location
          ? `waqtak:${updated.id}:${updated.location.trigger}`
          : null;
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
