# Subscriptions (RevenueCat + Apple In-App Purchases)

This app gates a few features (unlimited reminders/notes, silent-mode-breaking
alarms, voice input, widgets) behind a **"Waqtak Plus"** auto-renewable
subscription, purchased through Apple's StoreKit and managed with
[RevenueCat](https://www.revenuecat.com) (free up to $2.5k/mo tracked revenue).
RevenueCat is used instead of raw StoreKit because it handles receipt
validation, renewals, restores, and cross-platform entitlements without a
backend server — appropriate for a free/indie app.

## 1. Create the products in App Store Connect

In **App Store Connect → your app → Monetization → Subscriptions**:

1. Create a Subscription Group, e.g. `waqtak_plus`.
2. Add two auto-renewable subscriptions:
   - `waqtak_plus_monthly` — $4.99/month
   - `waqtak_plus_yearly` — $34.99/year
3. Fill in the required localized display name, description, and review
   screenshot for each (Apple requires a screenshot of the paywall).
4. Submit them for review together with the app binary (first submission) or
   independently afterwards.

## 2. Configure RevenueCat

1. Create a RevenueCat account and a new "Waqtak" project.
2. Add an iOS app, enter the bundle ID `com.hussien2925.waqtak`, and connect
   it to App Store Connect (RevenueCat needs an App Store Connect API key —
   generate one under **Users and Access → Keys → App Store Connect API**).
3. Add the two products above as RevenueCat Products, attach them to an
   **Entitlement** named `plus` (must match `ENTITLEMENT_ID` in
   `src/subscriptions/config.ts`), and group them into an **Offering** named
   `default` (must match `OFFERING_ID`).
4. Copy the iOS **Public API key** (starts with `appl_`).

## 3. Wire the API key into the app

Do **not** hardcode the key in `app.json`. Instead, set it as an EAS secret
so it's injected at build time:

```bash
eas secret:create --scope project --name REVENUECAT_API_KEY_IOS --value appl_XXXXXXXX --type string
```

Then reference it from `app.config.js`/`app.json` `extra` at build time (or
switch `app.json` to `app.config.ts` and read `process.env.REVENUECAT_API_KEY_IOS`).
Until this is configured, the app runs fully functional in **free mode** —
`SubscriptionContext` detects the missing key and simply never unlocks Plus,
so development and non-IAP testing are unaffected.

## 4. Testing purchases

- RevenueCat/StoreKit purchases **do not work in Expo Go** — you need a
  development build (`eas build --profile development`) or a full
  build (`preview`/`production`).
- Use a **Sandbox Apple ID** (App Store Connect → Users and Access →
  Sandbox Testers) signed into the device's App Store settings to test
  purchases without being charged.
- Call `restore()` (exposed via `useSubscription()`, wired to the
  "Restore purchases" row in Settings and the paywall) to test restores.

## 5. Free plan limits

`FREE_PLAN_LIMITS` in `src/subscriptions/config.ts` caps the free tier at 15
reminders and 15 notes, and gates the "break through silent mode" toggle.
Adjust these to match whatever business model you land on.
