export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: undefined;
  Compose: { prefill?: string } | undefined;
  ReminderDetail: { id: string };
  NoteDetail: { id: string };
  Paywall: undefined;
  LocationPicker: { returnTo?: 'chat' | 'detail'; prefillTitle?: string } | undefined;
};

export type TabParamList = {
  Chat: undefined;
  Reminders: undefined;
  Notes: undefined;
  Settings: undefined;
};
