export type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ReminderLocation {
  latitude: number;
  longitude: number;
  radius: number;
  name: string;
}

export interface Reminder {
  id: string;
  title: string;
  notes: string;
  dueDate: string | null;
  isAllDay: boolean;
  location: ReminderLocation | null;
  repeat: RepeatRule;
  timeSensitive: boolean;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  notificationId: string | null;
}

export type NoteType = 'text' | 'checklist' | 'table';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface NoteTable {
  headers: string[];
  rows: string[][];
}

export interface Note {
  id: string;
  type: NoteType;
  title: string;
  content: string;
  items: ChecklistItem[];
  table: NoteTable | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ParsedIntent =
  | { kind: 'reminder'; title: string; dueDate: string | null; isAllDay: boolean; repeat: RepeatRule }
  | { kind: 'checklist-add'; listTitle: string; itemText: string }
  | { kind: 'note'; title: string; content: string };

export type SubscriptionTier = 'free' | 'plus';

export interface AppSettings {
  language: 'ar' | 'en';
  themePreference: 'system' | 'light' | 'dark';
  onboardingComplete: boolean;
}
