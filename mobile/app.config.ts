import type { ExpoConfig } from 'expo/config';

const openAiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';
const openAiModel = process.env.EXPO_PUBLIC_OPENAI_MODEL ?? 'gpt-4o-mini';
const openAiBaseUrl = process.env.EXPO_PUBLIC_OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
const revenueCatIos = process.env.REVENUECAT_API_KEY_IOS ?? '';
const revenueCatAndroid = process.env.REVENUECAT_API_KEY_ANDROID ?? '';
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? '';
const easProjectId = process.env.EAS_PROJECT_ID ?? 'c095fc00-8146-4219-bde7-f5985b557107';

const config: ExpoConfig = {
  // Internal identifiers (slug/scheme/bundleIdentifier/package) are kept as
  // "waqtak" on purpose even after the rebrand — they're tied to the
  // already-linked EAS project and the Apple/Google credentials generated
  // for this bundle ID. Changing them would mean a brand-new App ID and
  // re-doing device registration. Only the user-facing name/icon changed.
  name: 'نبهني',
  slug: 'waqtak',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'waqtak',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.hussien2925.waqtak',
    supportsTablet: false,
    infoPlist: {
      UIBackgroundModes: ['remote-notification', 'location', 'fetch'],
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        'Nabhni uses your location to trigger reminders when you arrive at a place you chose.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'Nabhni needs background location access so location-based reminders can fire even when the app is closed.',
    },
  },
  android: {
    package: 'com.hussien2925.waqtak',
    adaptiveIcon: {
      backgroundColor: '#150F3D',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    permissions: [
      'RECEIVE_BOOT_COMPLETED',
      'SCHEDULE_EXACT_ALARM',
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-localization',
    'expo-sqlite',
    [
      'expo-speech-recognition',
      {
        microphonePermission:
          'Nabhni needs microphone access so you can talk to your reminders assistant.',
        speechRecognitionPermission:
          'Nabhni needs speech recognition access to turn what you say into reminders and notes.',
      },
    ],
    '@react-native-community/datetimepicker',
    'expo-font',
    [
      'expo-notifications',
      { icon: './assets/notification-icon.png', color: '#FFB020' },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Nabhni uses your location in the background to fire location-based reminders when you arrive at a place you chose.',
      },
    ],
    // Only touches AppDelegate/Podfile/AndroidManifest when a key is present,
    // so builds without GOOGLE_MAPS_API_KEY keep working exactly as before
    // (Apple Maps on iOS, Play-services default map on Android).
    ...(googleMapsApiKey
      ? [
          [
            'react-native-maps',
            {
              iosGoogleMapsApiKey: googleMapsApiKey,
              androidGoogleMapsApiKey: googleMapsApiKey,
            },
          ] as [string, Record<string, string>],
        ]
      : []),
  ],
  extra: {
    openAiApiKey: openAiKey,
    openAiModel,
    openAiBaseUrl,
    revenueCatApiKeyIos: revenueCatIos,
    revenueCatApiKeyAndroid: revenueCatAndroid,
    googleMapsConfigured: Boolean(googleMapsApiKey),
    eas: { projectId: easProjectId },
  },
};

export default config;
