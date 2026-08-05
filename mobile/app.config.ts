import type { ExpoConfig } from 'expo/config';

const openAiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';
const openAiModel = process.env.EXPO_PUBLIC_OPENAI_MODEL ?? 'gpt-4o-mini';
const openAiBaseUrl = process.env.EXPO_PUBLIC_OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
const revenueCatIos = process.env.REVENUECAT_API_KEY_IOS ?? '';
const revenueCatAndroid = process.env.REVENUECAT_API_KEY_ANDROID ?? '';
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? '';

const config: ExpoConfig = {
  name: 'Waqtak',
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
        'Waqtak uses your location to trigger reminders when you arrive at a place you chose.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'Waqtak needs background location access so location-based reminders can fire even when the app is closed.',
    },
  },
  android: {
    package: 'com.hussien2925.waqtak',
    adaptiveIcon: {
      backgroundColor: '#3F6BFF',
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
    config: googleMapsApiKey ? { googleMaps: { apiKey: googleMapsApiKey } } : undefined,
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
          'Waqtak needs microphone access so you can talk to your reminders assistant.',
        speechRecognitionPermission:
          'Waqtak needs speech recognition access to turn what you say into reminders and notes.',
      },
    ],
    '@react-native-community/datetimepicker',
    'expo-font',
    [
      'expo-notifications',
      { icon: './assets/notification-icon.png', color: '#3F6BFF' },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Waqtak uses your location in the background to fire location-based reminders when you arrive at a place you chose.',
      },
    ],
  ],
  extra: {
    openAiApiKey: openAiKey,
    openAiModel,
    openAiBaseUrl,
    revenueCatApiKeyIos: revenueCatIos,
    revenueCatApiKeyAndroid: revenueCatAndroid,
    eas: { projectId: '' },
  },
};

export default config;
