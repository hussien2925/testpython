export interface TranslationShape {
  appName: string;
  onboarding: {
    title1: string; body1: string; title2: string; body2: string; title3: string; body3: string;
    getStarted: string; next: string; skip: string;
  };
  home: {
    title: string; reminders: string; notes: string; emptyReminders: string; emptyNotes: string;
    composePlaceholder: string; today: string; upcoming: string; completed: string;
  };
  compose: {
    title: string; placeholder: string; listen: string; save: string; detectedReminder: string;
    detectedChecklist: string; detectedNote: string; due: string; noDate: string; micPermissionDenied: string;
  };
  reminder: {
    title: string; titleField: string; date: string; allDay: string; repeat: string; timeSensitive: string;
    notes: string; save: string; delete: string; markDone: string; markUndone: string;
    repeatOptions: { none: string; daily: string; weekly: string; monthly: string; yearly: string };
  };
  note: {
    title: string; type: string; typeText: string; typeChecklist: string; typeTable: string;
    addItem: string; addRow: string; addColumn: string; save: string; delete: string; pin: string; unpin: string;
  };
  settings: {
    title: string; language: string; theme: string; themeSystem: string; themeLight: string; themeDark: string;
    subscription: string; free: string; plus: string; manage: string; restorePurchases: string;
    notifications: string; about: string; privacyPolicy: string; terms: string; version: string;
  };
  paywall: {
    title: string; subtitle: string; featureUnlimited: string; featureVoice: string; featureSilent: string;
    featureWidgets: string; monthly: string; yearly: string; bestValue: string; subscribe: string;
    restore: string; terms: string; maybeLater: string; freeLimitReached: string;
  };
  common: { cancel: string; done: string; loading: string; error: string; ok: string };
}

export const translations: Record<'en' | 'ar', TranslationShape> = {
  en: {
    appName: 'Waqtak',
    onboarding: {
      title1: 'Talk, and it remembers',
      body1: 'Type or speak naturally — "remind me Sunday at 4" — and Waqtak turns it into a real reminder.',
      title2: 'Notes that stay organized',
      body2: 'Checklists, tables, and plain notes, all searchable and available offline.',
      title3: 'Alarms that get through',
      body3: 'Time-sensitive reminders can break through Focus and Do Not Disturb.',
      getStarted: 'Get started',
      next: 'Next',
      skip: 'Skip',
    },
    home: {
      title: 'Waqtak',
      reminders: 'Reminders',
      notes: 'Notes',
      emptyReminders: 'No reminders yet. Try "remind me tomorrow at 9 to call mom".',
      emptyNotes: 'No notes yet. Add your first note or checklist.',
      composePlaceholder: 'Remind me… or add a note…',
      today: 'Today',
      upcoming: 'Upcoming',
      completed: 'Completed',
    },
    compose: {
      title: 'New',
      placeholder: 'e.g. "Remind me Sunday at 4pm" or "Add milk to grocery list"',
      listen: 'Listening…',
      save: 'Save',
      detectedReminder: 'Reminder detected',
      detectedChecklist: 'Adding to checklist',
      detectedNote: 'Saving as note',
      due: 'Due',
      noDate: 'No date — saved as a note',
      micPermissionDenied: 'Microphone and speech recognition access is needed for voice input. Enable it in Settings.',
    },
    reminder: {
      title: 'Reminder',
      titleField: 'Title',
      date: 'Date & time',
      allDay: 'All day',
      repeat: 'Repeat',
      timeSensitive: 'Break through silent mode',
      notes: 'Notes',
      save: 'Save',
      delete: 'Delete',
      markDone: 'Mark done',
      markUndone: 'Mark not done',
      repeatOptions: { none: 'Never', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' },
    },
    note: {
      title: 'Note',
      type: 'Type',
      typeText: 'Text',
      typeChecklist: 'Checklist',
      typeTable: 'Table',
      addItem: 'Add item',
      addRow: 'Add row',
      addColumn: 'Add column',
      save: 'Save',
      delete: 'Delete',
      pin: 'Pin',
      unpin: 'Unpin',
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      theme: 'Appearance',
      themeSystem: 'System',
      themeLight: 'Light',
      themeDark: 'Dark',
      subscription: 'Subscription',
      free: 'Free plan',
      plus: 'Waqtak Plus',
      manage: 'Manage subscription',
      restorePurchases: 'Restore purchases',
      notifications: 'Notification permissions',
      about: 'About',
      privacyPolicy: 'Privacy Policy',
      terms: 'Terms of Use',
      version: 'Version',
    },
    paywall: {
      title: 'Waqtak Plus',
      subtitle: 'Unlimited reminders, unlimited notes, and alarms that break through silent mode.',
      featureUnlimited: 'Unlimited reminders & notes',
      featureVoice: 'Unlimited voice input',
      featureSilent: 'Silent-mode-breaking alarms',
      featureWidgets: 'Home screen widgets & Live Activities',
      monthly: 'Monthly',
      yearly: 'Yearly',
      bestValue: 'Best value',
      subscribe: 'Subscribe',
      restore: 'Restore purchases',
      terms: 'By subscribing you agree to the Terms of Use and Privacy Policy. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the period. Manage or cancel anytime in your Apple ID account settings.',
      maybeLater: 'Maybe later',
      freeLimitReached: 'You’ve reached the free plan limit',
    },
    common: {
      cancel: 'Cancel',
      done: 'Done',
      loading: 'Loading…',
      error: 'Something went wrong',
      ok: 'OK',
    },
  },
  ar: {
    appName: 'وقتك',
    onboarding: {
      title1: 'احكيله وبيتذكر',
      body1: 'اكتب أو تكلم بشكل طبيعي — "ذكرني الأحد الساعة ٤" — ووقتك يحوّلها إلى تذكير حقيقي.',
      title2: 'ملاحظات منظمة دايم',
      body2: 'قوائم، جداول، وملاحظات نصية، كلها قابلة للبحث ومتوفرة بدون إنترنت.',
      title3: 'تنبيهات توصلك فعلاً',
      body3: 'التذكيرات المهمة تقدر تخترق وضع التركيز والصامت.',
      getStarted: 'ابدأ الآن',
      next: 'التالي',
      skip: 'تخطي',
    },
    home: {
      title: 'وقتك',
      reminders: 'التذكيرات',
      notes: 'الملاحظات',
      emptyReminders: 'لا توجد تذكيرات بعد. جرّب "ذكرني بكرة الساعة ٩ أتصل بأمي".',
      emptyNotes: 'لا توجد ملاحظات بعد. أضف أول ملاحظة أو قائمة.',
      composePlaceholder: 'ذكرني… أو أضف ملاحظة…',
      today: 'اليوم',
      upcoming: 'القادمة',
      completed: 'مكتملة',
    },
    compose: {
      title: 'جديد',
      placeholder: 'مثال: "ذكرني الأحد الساعة ٤" أو "ضيف حليب لقائمة البقالة"',
      listen: 'جارِ الاستماع…',
      save: 'حفظ',
      detectedReminder: 'تم اكتشاف تذكير',
      detectedChecklist: 'إضافة إلى القائمة',
      detectedNote: 'يُحفظ كملاحظة',
      due: 'الموعد',
      noDate: 'بدون موعد — سيُحفظ كملاحظة',
      micPermissionDenied: 'يحتاج الإدخال الصوتي إذن الوصول للميكروفون والتعرف على الكلام. فعّله من الإعدادات.',
    },
    reminder: {
      title: 'تذكير',
      titleField: 'العنوان',
      date: 'التاريخ والوقت',
      allDay: 'طوال اليوم',
      repeat: 'التكرار',
      timeSensitive: 'يخترق الوضع الصامت',
      notes: 'ملاحظات',
      save: 'حفظ',
      delete: 'حذف',
      markDone: 'وضع كمكتمل',
      markUndone: 'إلغاء الإكتمال',
      repeatOptions: { none: 'أبداً', daily: 'يومياً', weekly: 'أسبوعياً', monthly: 'شهرياً', yearly: 'سنوياً' },
    },
    note: {
      title: 'ملاحظة',
      type: 'النوع',
      typeText: 'نص',
      typeChecklist: 'قائمة',
      typeTable: 'جدول',
      addItem: 'إضافة عنصر',
      addRow: 'إضافة صف',
      addColumn: 'إضافة عمود',
      save: 'حفظ',
      delete: 'حذف',
      pin: 'تثبيت',
      unpin: 'إلغاء التثبيت',
    },
    settings: {
      title: 'الإعدادات',
      language: 'اللغة',
      theme: 'المظهر',
      themeSystem: 'حسب النظام',
      themeLight: 'فاتح',
      themeDark: 'داكن',
      subscription: 'الاشتراك',
      free: 'الخطة المجانية',
      plus: 'وقتك بلس',
      manage: 'إدارة الاشتراك',
      restorePurchases: 'استعادة المشتريات',
      notifications: 'أذونات الإشعارات',
      about: 'حول التطبيق',
      privacyPolicy: 'سياسة الخصوصية',
      terms: 'شروط الاستخدام',
      version: 'الإصدار',
    },
    paywall: {
      title: 'وقتك بلس',
      subtitle: 'تذكيرات وملاحظات غير محدودة، وتنبيهات تخترق الوضع الصامت.',
      featureUnlimited: 'تذكيرات وملاحظات بلا حدود',
      featureVoice: 'إدخال صوتي غير محدود',
      featureSilent: 'تنبيهات تخترق الوضع الصامت',
      featureWidgets: 'ودجت الشاشة الرئيسية و Live Activities',
      monthly: 'شهري',
      yearly: 'سنوي',
      bestValue: 'أفضل قيمة',
      subscribe: 'اشترك الآن',
      restore: 'استعادة المشتريات',
      terms: 'بالاشتراك أنت توافق على شروط الاستخدام وسياسة الخصوصية. يتجدد الاشتراك تلقائياً ما لم يُلغَ قبل ٢٤ ساعة على الأقل من نهاية الفترة. يمكنك الإدارة أو الإلغاء في أي وقت من إعدادات معرف Apple الخاص بك.',
      maybeLater: 'ربما لاحقاً',
      freeLimitReached: 'وصلت للحد الأقصى للخطة المجانية',
    },
    common: {
      cancel: 'إلغاء',
      done: 'تم',
      loading: 'جارِ التحميل…',
      error: 'حدث خطأ ما',
      ok: 'حسناً',
    },
  },
};

export type Language = keyof typeof translations;
