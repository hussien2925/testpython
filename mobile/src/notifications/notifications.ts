import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let channelReady = false;

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android' || channelReady) return;
  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    bypassDnd: true,
  });
  channelReady = true;
}

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: true,
      allowBadge: true,
      allowCriticalAlerts: false,
    },
  });
  return requested.granted;
}

function repeatToTrigger(reminder: Reminder, date: Date): Notifications.NotificationTriggerInput {
  switch (reminder.repeat) {
    case 'daily':
      return { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: date.getHours(), minute: date.getMinutes() };
    case 'weekly':
      return {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: date.getDay() + 1,
        hour: date.getHours(),
        minute: date.getMinutes(),
      };
    case 'monthly':
      return {
        type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
      };
    case 'yearly':
      return {
        type: Notifications.SchedulableTriggerInputTypes.YEARLY,
        day: date.getDate(),
        month: date.getMonth() + 1,
        hour: date.getHours(),
        minute: date.getMinutes(),
      };
    default:
      return { type: Notifications.SchedulableTriggerInputTypes.DATE, date };
  }
}

export async function scheduleReminderNotification(reminder: Reminder): Promise<string | null> {
  if (!reminder.dueDate) return null;
  const date = new Date(reminder.dueDate);
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) return null;

  await ensureAndroidChannel();
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: reminder.title,
      body: reminder.notes || undefined,
      sound: 'default',
      // Time-sensitive interruption level lets the alert break through Focus modes on iOS 15+.
      // Fully bypassing the physical silent switch requires Apple's restricted Critical Alerts
      // entitlement, which is granted only for specific safety/health use cases.
      interruptionLevel: reminder.timeSensitive ? 'timeSensitive' : 'active',
      categoryIdentifier: 'reminder',
    },
    trigger: repeatToTrigger(reminder, date),
  });
  return id;
}

export async function cancelReminderNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // already fired or cancelled
  }
}

export async function setupNotificationCategories(): Promise<void> {
  await Notifications.setNotificationCategoryAsync('reminder', [
    { identifier: 'complete', buttonTitle: 'Done', options: { opensAppToForeground: false } },
  ]);
}
