export type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type LocationTrigger = 'arrive' | 'leave';

export interface ReminderLocation {
  latitude: number;
  longitude: number;
  radius: number;
  name: string;
  trigger: LocationTrigger;
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
  geofenceRegionId: string | null;
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

export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatArtifact =
  | { kind: 'reminder-created'; reminderId: string }
  | { kind: 'location-reminder-created'; reminderId: string }
  | { kind: 'note-created'; noteId: string }
  | { kind: 'checklist-updated'; noteId: string; itemText: string }
  | { kind: 'error'; message: string };

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  artifacts: ChatArtifact[];
  createdAt: string;
}
