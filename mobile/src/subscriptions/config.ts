import Constants from 'expo-constants';
import type { Reminder } from '../types';

// RevenueCat public SDK (API) keys — safe to embed client-side. Configure the
// matching offering/products in the RevenueCat dashboard and App Store Connect
// / Google Play Console before shipping. See mobile/SUBSCRIPTIONS.md.
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export const REVENUECAT_API_KEY_IOS = extra.revenueCatApiKeyIos ?? '';
export const REVENUECAT_API_KEY_ANDROID = extra.revenueCatApiKeyAndroid ?? '';

export const ENTITLEMENT_ID = 'plus';
export const OFFERING_ID = 'default';

export const FREE_PLAN_LIMITS = {
  maxRemindersPerMonth: 5,
  maxAddresses: 2,
};

export function countRemindersThisMonth(reminders: Reminder[]): number {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return reminders.filter(
    (r) => new Date(r.createdAt).getTime() >= monthStart.getTime()
  ).length;
}
