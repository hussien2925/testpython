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

// iOS Region Monitoring via Geofencing Implementation
// ====================================================
// This module implements location-based reminders using iOS CLLocationManager
// Region Monitoring (via Expo Location.startGeofencingAsync). This approach:
//
// 1. Does NOT require 'location' in UIBackgroundModes (removed from app.config.ts)
//    - Region monitoring works independently without continuous GPS tracking
//    - Apple allows background region monitoring without explicit background location declaration
//    - The system only wakes the app when entering/leaving registered regions
//
// 2. Uses CLCircularRegion for geofence boundaries
//    - Built via buildRegionForReminder() from reminder location data
//    - Supports three trigger types: 'arrive' (notifyOnEnter), 'leave' (notifyOnExit), 'passing' (both)
//
// 3. Manages up to 20 concurrent regions per platform limit
//    - iOS: 20 regions max (enforced by CLLocationManager)
//    - Android: ~100 regions (Play Services limit)
//    - Excess reminders fail silently; saved but won't fire until other geofences clear
//
// 4. Lifecycle: Registration → TaskManager callback → Notification delivery
//    - syncGeofences() called on reminder changes (create/update/delete)
//    - Compares current reminders with registered regions, updates as needed
//    - Unused regions automatically cleared; new ones registered

// The task body must be registered at module load time (before any React
// component renders) so the OS can hand off geofencing callbacks to it even
// when the app is killed. Guard against double-registration during HMR.
if (Platform.OS !== 'web' && !TaskManager.isTaskDefined(GEOFENCE_TASK)) {
  TaskManager.defineTask(GEOFENCE_TASK, async (payload: unknown) => {
    // Background task triggered by OS when user enters/leaves a registered region.
    // Runs even with app terminated; must complete within iOS time constraints (~10s).
    const { data, error } = payload as GeofenceTaskPayload;
    if (error || !data?.region) return;

    const identifier = data.region.identifier;
    if (!identifier?.startsWith('waqtak:')) return;

    // Identifier format: 'waqtak:<reminderId>:<trigger>'
    // Example: 'waqtak:abc123:arrive' or 'waqtak:def456:passing'
    const [, reminderId, expectedTriggerRaw] = identifier.split(':');
    const expectedTrigger = expectedTriggerRaw as 'arrive' | 'leave' | 'passing';
    const firedTrigger = data.eventType === Location.LocationGeofencingEventType.Enter ? 'arrive' : 'leave';

    // Trigger matching logic:
    // - 'arrive': only fire on Enter events
    // - 'leave': only fire on Exit events
    // - 'passing': fire on both Enter and Exit events (continuous monitoring)
    if (expectedTrigger !== 'passing' && firedTrigger !== expectedTrigger) return;

    try {
      // Fetch reminder from local storage to verify it still exists and isn't completed.
      // Must do this in the background task since reminder state can change while app is killed.
      const raw = await import('@react-native-async-storage/async-storage').then((m) => m.default.getItem('waqtak.reminders.v1'));
      if (!raw) return;
      const reminders = JSON.parse(raw) as Reminder[];
      const reminder = reminders.find((r) => r.id === reminderId);
      if (!reminder || reminder.completed) return;

      // Schedule local notification to alert user; use timeSensitive level if user marked it urgent.
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
      // Swallow errors — task must never throw or iOS deregisters the entire task handler.
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
  // Converts a location-based reminder into a CLCircularRegion-compatible geofence.
  // Returns null if reminder has no location or is already completed (no need to monitor).
  if (!reminder.location || reminder.completed) return null;
  const { latitude, longitude, radius, trigger } = reminder.location;
  return {
    identifier: `waqtak:${reminder.id}:${trigger}`,
    latitude,
    longitude,
    radius: Math.max(radius, 50), // Enforce minimum 50m radius; iOS has accuracy limits
    notifyOnEnter: trigger === 'arrive' || trigger === 'passing',
    notifyOnExit: trigger === 'leave' || trigger === 'passing',
  };
}

export async function syncGeofences(reminders: Reminder[]): Promise<void> {
  // Synchronizes registered geofences with current reminders.
  // Called after reminder create/update/delete to ensure active regions match active reminders.
  // This is the primary API contract for geofence lifecycle management.
  if (Platform.OS === 'web') return;

  // Build CLCircularRegion objects from reminders with valid locations.
  const regions = reminders.map(buildRegionForReminder).filter((r): r is GeofenceRegion => r !== null);

  if (regions.length === 0) {
    // No active location reminders; stop geofencing if running.
    if (await Location.hasStartedGeofencingAsync(GEOFENCE_TASK).catch(() => false)) {
      await Location.stopGeofencingAsync(GEOFENCE_TASK).catch(() => undefined);
    }
    return;
  }

  // Require foreground permission; background permission is optional but improves reliability.
  const fg = await Location.getForegroundPermissionsAsync();
  if (!fg.granted) return;

  try {
    // Register all regions with the OS. Calling this multiple times resets the region set
    // (old regions are removed, new ones added). iOS automatically manages the region lifecycle.
    await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
  } catch {
    // Silent fail. Common causes:
    // - iOS: >20 regions (iOS caps at 20 concurrent regions)
    // - Android: Play Services unavailable or not installed
    // - Missing background permissions (on some Android versions)
    // Reminders are still saved; geofencing will resume when constraints are lifted.
  }
}

export async function requestLocationPermissions(): Promise<{ foreground: boolean; background: boolean }> {
  if (Platform.OS === 'web') return { foreground: false, background: false };
  const fg = await Location.requestForegroundPermissionsAsync();
  if (!fg.granted) return { foreground: false, background: false };
  const bg = await Location.requestBackgroundPermissionsAsync();
  return { foreground: fg.granted, background: bg.granted };
}
