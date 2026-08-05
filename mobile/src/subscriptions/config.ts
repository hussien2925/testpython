import Constants from 'expo-constants';

// RevenueCat public SDK (API) keys — safe to embed client-side. Configure the
// matching offering/products in the RevenueCat dashboard and App Store Connect
// / Google Play Console before shipping. See mobile/SUBSCRIPTIONS.md.
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export const REVENUECAT_API_KEY_IOS = extra.revenueCatApiKeyIos ?? '';
export const REVENUECAT_API_KEY_ANDROID = extra.revenueCatApiKeyAndroid ?? '';

export const ENTITLEMENT_ID = 'plus';
export const OFFERING_ID = 'default';

export const FREE_PLAN_LIMITS = {
  maxReminders: 15,
  maxNotes: 15,
};
