import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { ENTITLEMENT_ID, OFFERING_ID, REVENUECAT_API_KEY_ANDROID, REVENUECAT_API_KEY_IOS } from './config';
import { SubscriptionTier } from '../types';

type PurchasesPackageLike = {
  identifier: string;
  packageType: string;
  product: { identifier: string; title: string; priceString: string; description: string };
};

interface SubscriptionContextValue {
  tier: SubscriptionTier;
  isReady: boolean;
  isNativeAvailable: boolean;
  packages: PurchasesPackageLike[];
  purchase: (pkg: PurchasesPackageLike) => Promise<void>;
  restore: () => Promise<void>;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

// react-native-purchases requires native code and is unavailable in Expo Go /
// web preview. It's loaded lazily and every call is guarded so the rest of
// the app keeps working (as "free tier") wherever the native module is missing.
function loadPurchasesModule(): typeof import('react-native-purchases').default | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-purchases').default;
  } catch {
    return null;
  }
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [isReady, setIsReady] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackageLike[]>([]);
  const Purchases = useMemo(loadPurchasesModule, []);
  const isNativeAvailable = Purchases !== null;

  const applyCustomerInfo = useCallback((customerInfo: { entitlements: { active: Record<string, unknown> } }) => {
    const active = Boolean(customerInfo.entitlements.active[ENTITLEMENT_ID]);
    setTier(active ? 'plus' : 'free');
  }, []);

  const refresh = useCallback(async () => {
    if (!Purchases) return;
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      applyCustomerInfo(customerInfo as never);
      const offerings = await Purchases.getOfferings();
      const offering = offerings.all[OFFERING_ID] ?? offerings.current;
      setPackages((offering?.availablePackages as PurchasesPackageLike[]) ?? []);
    } catch {
      // Network or configuration issue — keep whatever state we had.
    }
  }, [Purchases, applyCustomerInfo]);

  useEffect(() => {
    (async () => {
      if (!Purchases) {
        setIsReady(true);
        return;
      }
      const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
      if (!apiKey) {
        setIsReady(true);
        return;
      }
      try {
        Purchases.configure({ apiKey });
        await refresh();
      } finally {
        setIsReady(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const purchase = useCallback(
    async (pkg: PurchasesPackageLike) => {
      if (!Purchases) return;
      const result = await Purchases.purchasePackage(pkg as never);
      applyCustomerInfo(result.customerInfo as never);
    },
    [Purchases, applyCustomerInfo]
  );

  const restore = useCallback(async () => {
    if (!Purchases) return;
    const customerInfo = await Purchases.restorePurchases();
    applyCustomerInfo(customerInfo as never);
  }, [Purchases, applyCustomerInfo]);

  return (
    <SubscriptionContext.Provider
      value={{ tier, isReady, isNativeAvailable, packages, purchase, restore, refresh }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
