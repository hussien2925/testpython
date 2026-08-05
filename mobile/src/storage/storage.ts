import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  reminders: 'waqtak.reminders.v1',
  notes: 'waqtak.notes.v1',
  settings: 'waqtak.settings.v1',
  subscription: 'waqtak.subscription.v1',
} as const;

export type StorageKey = keyof typeof KEYS;

export async function readJSON<T>(key: StorageKey, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(KEYS[key]);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON<T>(key: StorageKey, value: T): Promise<void> {
  await AsyncStorage.setItem(KEYS[key], JSON.stringify(value));
}
