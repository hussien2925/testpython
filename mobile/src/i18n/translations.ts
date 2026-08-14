export interface TranslationShape {
  appName: string;
  onboarding: {
    title1: string; body1: string; title2: string; body2: string; title3: string; body3: string;
    getStarted: string; next: string; skip: string;
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
    featureAddresses: string; monthly: string; yearly: string; bestValue: string; subscribe: string;
    restore: string; terms: string; maybeLater: string; freeLimitReached: string;
  };
  common: { cancel: string; done: string; loading: string; error: string; ok: string };
  chat: {
    tab: string;
    inputPlaceholder: string;
    emptyTitle: string;
    emptySubtitle: string;
    tipTime: string;
    tipLocation: string;
    tipChecklist: string;
    thinking: string;
    aiOffNotice: string;
    reminderCard: string;
    locationReminderCard: string;
    noteCard: string;
    checklistCard: string;
    clearHistory: string;
    reminderCreatedFor: string;
    locationCreatedFor: string;
    noteSaved: string;
    itemAddedTo: string;
    error: string;
    at: string;
    arriveTrigger: string;
    leaveTrigger: string;
  };
  location: {
    pickerTitle: string;
    searchPlaceholder: string;
    searchButton: string;
    triggerLabel: string;
    triggerArrive: string;
    triggerLeave: string;
    radiusLabel: string;
    permissionNeeded: string;
    noResults: string;
    save: string;
    onArrival: string;
    onLeaving: string;
    locationRemindersHeader: string;
    upcomingRemindersHeader: string;
  };
  home: {
    title: string;
    reminders: string;
    notes: string;
    emptyReminders: string;
    emptyNotes: string;
    composePlaceholder: string;
    today: string;
    upcoming: string;
    completed: string;
    tabActive: string;
    tabDone: string;
    tabAll: string;
  };
}

export const translations: Record<'en' | 'ar', TranslationShape> = {
  en: {
    appName: 'Nabhni',
    onboarding: {
      title1: 'Talk, and it remembers',
      body1: 'Type or speak naturally — "remind me Sunday at 4" — and Nabhni turns it into a real reminder.',
      title2: 'Notes that stay organized',
      body2: 'Checklists, tables, and plain notes, all searchable and available offline.',
      title3: 'Alarms that get through',
      body3: 'Time-sensitive reminders can break through Focus and Do Not Disturb.',
      getStarted: 'Get started',
      next: 'Next',
      skip: 'Skip',
    },
    home: {
      title: 'Nabhni',
      reminders: 'Reminders',
      notes: 'Notes',
      emptyReminders: 'No reminders yet. Head over to the chat and describe what you need.',
      emptyNotes: 'No notes yet. Add your first note or checklist.',
      composePlaceholder: 'Remind me… or add a note…',
      today: 'Today',
      upcoming: 'Upcoming',
      completed: 'Completed',
      tabActive: 'Active',
      tabDone: 'Done',
      tabAll: 'All',
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
      plus: 'Nabhni Plus',
      manage: 'Manage subscription',
      restorePurchases: 'Restore purchases',
      notifications: 'Notification permissions',
      about: 'About',
      privacyPolicy: 'Privacy Policy',
      terms: 'Terms of Use',
      version: 'Version',
    },
    paywall: {
      title: 'Nabhni Plus',
      subtitle: 'Unlimited reminders, addresses, voice input, and alarms that break through silent mode.',
      featureUnlimited: 'Unlimited reminders, notes & addresses',
      featureVoice: 'Unlimited voice input',
      featureSilent: 'Silent-mode-breaking alarms',
      featureAddresses: 'Unlimited saved addresses',
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
    chat: {
      tab: 'Chat',
      inputPlaceholder: 'Ask Nabhni…',
      emptyTitle: 'What should I remember for you?',
      emptySubtitle: 'Talk to me like a friend. I turn what you say into reminders, notes, or checklist items — no menus.',
      tipTime: '"Remind me tomorrow at 9 to call mom"',
      tipLocation: '"When I get to the airport, remind me to grab water"',
      tipChecklist: '"Add milk to my grocery list"',
      thinking: 'Thinking…',
      aiOffNotice: 'AI is off — running offline, works only for simple phrasings. Add an OpenAI key in .env for full smart chat.',
      reminderCard: 'Reminder',
      locationReminderCard: 'Location reminder',
      noteCard: 'Note',
      checklistCard: 'Checklist',
      clearHistory: 'Clear conversation',
      reminderCreatedFor: 'Reminder set',
      locationCreatedFor: 'Location reminder set',
      noteSaved: 'Note saved',
      itemAddedTo: 'Added to',
      error: 'Couldn\'t complete that',
      at: 'at',
      arriveTrigger: 'On arrival',
      leaveTrigger: 'When leaving',
    },
    location: {
      pickerTitle: 'Pick a place',
      searchPlaceholder: 'Search a place, address, or landmark',
      searchButton: 'Search',
      triggerLabel: 'Fire when',
      triggerArrive: 'I arrive',
      triggerLeave: 'I leave',
      radiusLabel: 'Detection radius',
      permissionNeeded: 'Nabhni needs location permission — enable it in Settings so location reminders can fire.',
      noResults: 'No places found for that search.',
      save: 'Save location reminder',
      onArrival: 'On arrival',
      onLeaving: 'On leaving',
      locationRemindersHeader: 'Location reminders',
      upcomingRemindersHeader: 'Upcoming',
    },
  },
  ar: {
    appName: 'نبهني',
    onboarding: {
      title1: 'سولف وبيذكرك',
      body1: 'اكتب أو تكلم بشكل طبيعي — "ذكرني الأحد الساعة ٤" — ونبهني يحوّلها إلى تذكير حقيقي.',
      title2: 'ملاحظات منظمة دايم',
      body2: 'قوائم، جداول، وملاحظات نصية، كلها قابلة للبحث ومتوفرة بدون إنترنت.',
      title3: 'تنبيهات توصلك فعلاً',
      body3: 'التذكيرات المهمة تقدر تخترق وضع التركيز والصامت.',
      getStarted: 'ابدأ الآن',
      next: 'التالي',
      skip: 'تخطي',
    },
    home: {
      title: 'نبهني',
      reminders: 'التذكيرات',
      notes: 'الملاحظات',
      emptyReminders: 'ما فيه تذكيرات بعد. روح للشات واحكيلي وش تبي أذكرك فيه.',
      emptyNotes: 'ما فيه ملاحظات بعد. أضف أول ملاحظة أو قائمة.',
      composePlaceholder: 'ذكرني… أو أضف ملاحظة…',
      today: 'اليوم',
      upcoming: 'القادمة',
      completed: 'مكتملة',
      tabActive: 'نشطة',
      tabDone: 'مكتملة',
      tabAll: 'الكل',
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
      plus: 'نبهني بلس',
      manage: 'إدارة الاشتراك',
      restorePurchases: 'استعادة المشتريات',
      notifications: 'أذونات الإشعارات',
      about: 'حول التطبيق',
      privacyPolicy: 'سياسة الخصوصية',
      terms: 'شروط الاستخدام',
      version: 'الإصدار',
    },
    paywall: {
      title: 'نبهني بلس',
      subtitle: 'تذكيرات وعناوين وصوتي بلا حدود، وتنبيهات تخترق الوضع الصامت.',
      featureUnlimited: 'تذكيرات وملاحظات وعناوين بلا حدود',
      featureVoice: 'إدخال صوتي بلا حدود',
      featureSilent: 'تنبيهات تخترق الوضع الصامت',
      featureAddresses: 'عناوين مسجلة بلا حدود',
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
    chat: {
      tab: 'محادثة',
      inputPlaceholder: 'اكتب لنبهني…',
      emptyTitle: 'وش أذكرك فيه؟',
      emptySubtitle: 'كلمني عادي. أحول كلامك لتذكير أو ملاحظة أو عنصر في قائمة — بدون قوائم ولا خطوات.',
      tipTime: '"ذكرني بكرة الساعة ٩ أتصل بأمي"',
      tipLocation: '"لما أوصل المطار ذكرني آخذ معي مويه"',
      tipChecklist: '"ضيف حليب لقائمة البقالة"',
      thinking: 'أفكّر…',
      aiOffNotice: 'الذكاء الاصطناعي مطفي — النظام يشتغل بتحليل بسيط بدون إنترنت. أضف مفتاح OpenAI في ملف .env لتفعيل المحادثة الكاملة.',
      reminderCard: 'تذكير',
      locationReminderCard: 'تذكير موقع',
      noteCard: 'ملاحظة',
      checklistCard: 'قائمة',
      clearHistory: 'مسح المحادثة',
      reminderCreatedFor: 'تم إعداد التذكير',
      locationCreatedFor: 'تم إعداد تذكير الموقع',
      noteSaved: 'الملاحظة محفوظة',
      itemAddedTo: 'أضيف إلى',
      error: 'ما قدرت أكمل الطلب',
      at: '—',
      arriveTrigger: 'عند الوصول',
      leaveTrigger: 'عند المغادرة',
    },
    location: {
      pickerTitle: 'اختر المكان',
      searchPlaceholder: 'ابحث عن مكان أو عنوان أو معلم',
      searchButton: 'بحث',
      triggerLabel: 'يشتغل عند',
      triggerArrive: 'الوصول',
      triggerLeave: 'المغادرة',
      radiusLabel: 'نصف قطر الاستشعار',
      permissionNeeded: 'نبهني يحتاج إذن الموقع — فعّله من الإعدادات عشان تذكيرات الأماكن تشتغل.',
      noResults: 'ما لقيت أماكن مطابقة.',
      save: 'حفظ تذكير الموقع',
      onArrival: 'عند الوصول',
      onLeaving: 'عند المغادرة',
      locationRemindersHeader: 'تذكيرات الأماكن',
      upcomingRemindersHeader: 'القادمة',
    },
  },
};

export type Language = keyof typeof translations;
