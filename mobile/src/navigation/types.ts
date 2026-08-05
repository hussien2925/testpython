export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: undefined;
  Compose: { prefill?: string } | undefined;
  ReminderDetail: { id: string };
  NoteDetail: { id: string };
  Paywall: undefined;
};

export type TabParamList = {
  Home: undefined;
  Notes: undefined;
  Settings: undefined;
};
