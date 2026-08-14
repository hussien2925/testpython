export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: undefined;
  Compose: { prefill?: string } | undefined;
  ReminderDetail: { id: string };
  Paywall: undefined;
  LocationPicker: { returnTo?: 'chat' | 'detail' | 'addresses'; prefillTitle?: string } | undefined;
};

export type TabParamList = {
  Chat: undefined;
  Reminders: undefined;
  Home: undefined;
  Addresses: undefined;
  Settings: undefined;
};
