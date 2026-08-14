export type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type LocationTrigger = 'arrive' | 'leave' | 'passing';

export interface Address {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

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

export type ParsedIntent =
  | { kind: 'reminder'; title: string; dueDate: string | null; isAllDay: boolean; repeat: RepeatRule };

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
  | { kind: 'error'; message: string };

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  artifacts: ChatArtifact[];
  createdAt: string;
}
