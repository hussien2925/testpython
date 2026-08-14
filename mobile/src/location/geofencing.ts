import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder } from '../types';

export const GEOFENCE_TASK = 'waqtak.geofence.v1';

interface GeofenceTaskPayload {
  data: {
    eventType: Location.LocationGeofencingEventType;
    region: Location.LocationRegion & { identifier: string };
  };
  error?: { message: string } | null;
}

// The task body must be registered at module load time (before any React
// component renders) so the OS can hand off geofencing callbacks to it even
// when the app is killed. Guard against double-registration during HMR.
if (Platform.OS !== 'web' && !TaskManager.isTaskDefined(GEOFENCE_TASK)) {
  TaskManager.defineTask(GEOFENCE_TASK, async (payload: unknown) => {
    const { data, error } = payload as GeofenceTaskPayload;
    if (error || !data?.region) return;

    const identifier = data.region.identifier;
    if (!identifier?.startsWith('waqtak:')) return;

    const [, reminderId, expectedTriggerRaw] = identifier.split(':');
    const expectedTrigger = expectedTriggerRaw as 'arrive' | 'leave' | 'passing';
    const firedTrigger = data.eventType === Location.LocationGeofencingEventType.Enter ? 'arrive' : 'leave';

    // For passing, fire on both enter and leave; for arrive/leave, fire only on the specific trigger
    if (expectedTrigger !== 'passing' && firedTrigger !== expectedTrigger) return;

    try {
      const raw = await import('@react-native-async-storage/async-storage').then((m) => m.default.getItem('waqtak.reminders.v1'));
      if (!raw) return;
      const reminders = JSON.parse(raw) as Reminder[];
      const reminder = reminders.find((r) => r.id === reminderId);
      if (!reminder || reminder.completed) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.location?.name ?? undefined,
          sound: 'default',
          interruptionLevel: reminder.timeSensitive ? 'timeSensitive' : 'active',
        },
        trigger: null,
      });
    } catch {
      // Swallow — the task must never throw or iOS deregisters it.
    }
  });
}

export interface GeofenceRegion {
  identifier: string;
  latitude: number;
  longitude: number;
  radius: number;
  notifyOnEnter: boolean;
  notifyOnExit: boolean;
}

export function buildRegionForReminder(reminder: Reminder): GeofenceRegion | null {
  if (!reminder.location || reminder.completed) return null;
  const { latitude, longitude, radius, trigger } = reminder.location;
  return {
    identifier: `waqtak:${reminder.id}:${trigger}`,
    latitude,
    longitude,
    radius: Math.max(radius, 50),
    notifyOnEnter: trigger === 'arrive' || trigger === 'passing',
    notifyOnExit: trigger === 'leave' || trigger === 'passing',
  };
}

export async function syncGeofences(reminders: Reminder[]): Promise<void> {
  if (Platform.OS === 'web') return;

  const regions = reminders.map(buildRegionForReminder).filter((r): r is GeofenceRegion => r !== null);

  if (regions.length === 0) {
    if (await Location.hasStartedGeofencingAsync(GEOFENCE_TASK).catch(() => false)) {
      await Location.stopGeofencingAsync(GEOFENCE_TASK).catch(() => undefined);
    }
    return;
  }

  const fg = await Location.getForegroundPermissionsAsync();
  if (!fg.granted) return;

  try {
    await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
  } catch {
    // Common causes: too many regions (iOS caps at 20), background permission
    // missing, or Play Services unavailable. The reminder is still saved —
    // it just won't fire until the environment supports it.
  }
}

export async function requestLocationPermissions(): Promise<{ foreground: boolean; background: boolean }> {
  if (Platform.OS === 'web') return { foreground: false, background: false };
  const fg = await Location.requestForegroundPermissionsAsync();
  if (!fg.granted) return { foreground: false, background: false };
  const bg = await Location.requestBackgroundPermissionsAsync();
  return { foreground: fg.granted, background: bg.granted };
}
