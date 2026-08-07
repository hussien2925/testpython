# نبهني (Nabhni)

تطبيق تذكيرات ذكي — تكتب أو تتكلم بشكل طبيعي بالعربي أو الإنجليزي، وتطبيق
يحوّلها تلقائياً لتذكير وقتي، تذكير موقع ("لما أوصل البيت")، ملاحظة، أو عنصر
في قائمة. يعمل بدون إنترنت للتذكيرات الأساسية، ومع مفتاح OpenAI يشتغل شات
ذكي حقيقي. مجاني بالكامل مع اشتراك اختياري "نبهني بلس" عبر اشتراكات أبل.

## التقنية المستخدمة

- **Expo (React Native) + TypeScript** — SDK 57.
- **OpenAI (Function Calling)** للمحادثة الذكية — يعمل بمحلل محلي بسيط بدونه.
- **expo-notifications** للتنبيهات المحلية (بما فيها Time Sensitive).
- **expo-location + expo-task-manager** لتذكيرات المواقع (Geofencing).
- **expo-speech-recognition** للإدخال الصوتي.
- **RevenueCat + StoreKit** للاشتراكات (راجع `SUBSCRIPTIONS.md`).
- **Supabase** — بنية تحتية جاهزة للحسابات/المزامنة (`supabase/`)، غير
  مفعّلة في التطبيق حالياً (مرحلة قادمة).
- **EAS Build/Submit** لبناء ورفع التطبيق بدون جهاز ماك.

## التشغيل محلياً (تطوير)

```bash
cd mobile
npm install
npx expo start
```

Expo Go يعرض الواجهات بسرعة، لكن الصوت/الإشعارات/الاشتراكات/المواقع تحتاج
بناء مخصص (`eas build --profile development`) لأنها تعتمد على كود أصلي.

---

## من هنا إلى App Store — الحالة الحالية

✅ **جاهز:** الاسم (نبهني)، الأيقونة، شاشة السبلاش، حساب Apple Developer
مربوط (Team: SKHAA FOR INFORMATION TECHNOLOGY EST — `88FB8VDXCT`)، نسخة
تجريبية (`preview`) مبنية ومُختبرة على جهاز حقيقي.

⬜ **ناقص:** نسخة **production** (بدل preview)، سجل التطبيق في App Store
Connect، لقطات الشاشة، الوصف، ورفعها فعلياً للمراجعة.

### 1. تأكد من رابطي الخصوصية والشروط

`SettingsScreen` يشير حالياً لـ `hussainmofareh.com/nabhni` — **لازم
يكون في محتوى فعلي على هذا الرابط قبل الإرسال للمراجعة**، وإلا أبل يرفض
التطبيق مباشرة (Guideline 5.1.1). لو الصفحة لسة فاضية، جهزها أول شي.

### 2. أنشئ سجل التطبيق في App Store Connect

على [appstoreconnect.apple.com](https://appstoreconnect.apple.com):

1. **My Apps** → **+** → **New App**
2. **Platform:** iOS
3. **Name:** نبهني (أو "Nabhni" لو حاب اسم إنجليزي بالمتجر — الاسمين
   منفصلين عن اسم الآيفون نفسه)
4. **Primary Language:** Arabic
5. **Bundle ID:** اختر `com.hussien2925.waqtak` من القائمة (موجود مسبقاً
   من بناء EAS)
6. **SKU:** أي نص فريد، مثلاً `nabhni-ios-001`

بعد الإنشاء، من صفحة التطبيق → **App Information**، انسخ **Apple ID**
(رقم يشبه `6473xxxxxxx`) — هذا هو الـ `ascAppId`.

### 3. حدّث `eas.json`

افتح `mobile/eas.json`، وحط الـ Apple ID اللي نسخته:

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "alkhaldyssalem@gmail.com",
      "appleTeamId": "88FB8VDXCT",
      "ascAppId": "ضع الرقم هنا"
    }
  }
}
```

### 4. ابنِ نسخة الإنتاج

```bash
cd mobile
git pull
eas build --profile production --platform ios
```

**الفرق عن `preview`:** هذا البناء موقّع بـ **App Store provisioning
profile** (مو Ad Hoc محدود بأجهزة مسجلة) — صالح للرفع الفعلي للمتجر.

### 5. ارفعه لـ App Store Connect

```bash
eas submit --profile production --platform ios
```

يرفع ملف `.ipa` مباشرة. يستغرق دقائق، وبعدها يظهر تحت **TestFlight** في
App Store Connect (معالجة أبل الداخلية تاخذ ١٥-٩٠ دقيقة إضافية).

### 6. اختبار TestFlight (موصى به قبل الإرسال للمراجعة العامة)

من App Store Connect → **TestFlight** → أضف نفسك كـ **Internal Tester**
(بنفس Apple ID) → حمّل تطبيق **TestFlight** من App Store على آيفونك →
جرّب النسخة الموقّعة رسمياً قبل ما ترسلها للمراجعة.

### 7. عبّي بيانات المتجر (App Store tab, مو TestFlight)

- **Screenshots:** لازم مقاس ٦.٩ بوصة (iPhone 16 Pro Max أو مشابه) على
  الأقل — خذها من التطبيق مباشرة (Simulator أو جهازك: زر الطاقة+الصوت معاً)
- **Description / Keywords / Support URL:** اكتبها بالعربي (نفس
  Primary Language)
- **Privacy Policy URL:** `https://hussainmofareh.com/nabhni`
- **App Privacy (Data Collection):** حدد بصدق — التطبيق يجمع: الموقع
  (لتذكيرات الأماكن)، محتوى المحادثة (يُرسل لـ OpenAI إذا مفعّل)، بيانات
  الشراء (RevenueCat إذا مفعّل). لا تخفي هذا — أبل يتحقق ويرفض لو غير دقيق
- **Age Rating:** عبّي الاستبيان (على الأغلب 4+)

### 8. أرسل للمراجعة

زر **Add for Review** ثم **Submit to App Review** أعلى الصفحة. المراجعة
عادة تاخذ ٢٤-٤٨ ساعة.

---

## نقاط قد تسبب رفض من أبل — راجعها قبل الإرسال

- **صلاحية الموقع الدائم (Always):** أبل يتحقق أن الوصف اللي يظهر
  للمستخدم (`NSLocationAlwaysAndWhenInUseUsageDescription` في
  `app.config.ts`) يشرح **بوضوح** ليش التطبيق يحتاجه — موجود حالياً ويشرح
  استخدام تذكيرات المواقع، لازم يبقى كذا.
- **زر "Restore Purchases":** موجود في الإعدادات وشاشة الاشتراك — مطلوب
  إجبارياً من أبل (Guideline 3.1.2)، لا تحذفه.
- **الأسعار والمدة بوضوح في شاشة الاشتراك:** `PaywallScreen` يعرض هذا
  تلقائياً من RevenueCat إذا كانت المنتجات مُعدّة، وإلا تظهر رسالة "غير
  مُعدّة بعد" — تأكد أن المنتجات مُفعّلة في App Store Connect (راجع
  `SUBSCRIPTIONS.md`) قبل الإرسال، أو أزل الميزة مؤقتاً لو ما بتفعّلها.
- **استدعاء OpenAI من التطبيق مباشرة:** المفتاح مُدمج في البناء (راجع
  التحذير الأمني في `.env.example`) — مقبول من أبل تقنياً، لكن راقب حدود
  استخدام حسابك في OpenAI حتى ما يوصل الحد ويتوقف الشات لكل المستخدمين.

---

## من هنا إلى Google Play — الإجراء

### 1. أنشئ حسابك على Google Play Console

على [play.google.com/console](https://play.google.com/console):

1. **All Apps** → **Create App**
2. **App name:** نبهني (أو أي اسم إنجليزي تفضله للمتجر)
3. **Default language:** Arabic (إن وجدت الخيار)
4. اقبل الشروط وأنهِ الإنشاء

### 2. أنشئ مفتاح تحقق Google Play (API Key)

للرفع التلقائي عبر `eas submit`:

1. في Google Play Console → **Setup** (أسفل اليسار)
2. اذهب لـ **API access**
3. أنشئ **Service Account** جديد (أو استخدم موجود)
4. حمّل **private key** (JSON file) وسميه `google-service-account.json`
5. ضعه في مجلد `mobile/` (في `.gitignore` بالفعل — لا تكوّمه في git)

### 3. حدّث أو تحقق من `app.config.ts`

تأكد أن `bundleIdentifier` مختلف عن iOS:

```typescript
export default {
  expo: {
    name: 'نبهني',
    slug: 'nabhni',
    scheme: 'nabhni',
    android: {
      package: 'com.hussien2925.nabhni',  // مختلف عن iOS bundle ID
      versionCode: 1,
      icon: './assets/icon.png',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0D0C2E'
      },
      splash: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#0D0C2E'
      },
      permissions: [
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.POST_NOTIFICATIONS'
      ],
      usesExpo: true
    }
  }
};
```

### 4. حدّث `eas.json` للإنتاج (Android)

أضف section الـ Android إلى `submit`:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "alkhaldyssalem@gmail.com",
        "appleTeamId": "88FB8VDXCT",
        "ascAppId": "6798878094"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  },
  "build": {
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

**`buildType: "aab"`** = Android App Bundle (الصيغة الحديثة اللي جوجل بتفرضها على تطبيقات جديدة).

### 5. ابنِ نسخة الإنتاج (Android)

```bash
cd mobile
eas build --profile production --platform android
```

هذا يبني AAB موقّع بمفتاح الإنتاج — جاهز للرفع لمتجر جوجل.

### 6. ارفعه لـ Google Play

```bash
eas submit --profile production --platform android
```

يرفع الـ AAB مباشرة **للمسودة** (Draft) في Google Play Console — ما يرفع فعلياً للناس إلا بعد ما تضغط "Publish" يدوياً في الـ Console.

### 7. عبّي متجر جوجل (Google Play Console)

على [play.google.com/console](https://play.google.com/console) → App الخاصة بك:

#### **App details** و **Images**

- **Icon & Feature Graphic:** صور مطلوبة بأحجام معيّنة (هنا يختلف عن أبل)
  - أيقونة التطبيق: ٥١٢ × ٥١٢ PNG
  - صورة الميزات (Feature Graphic): ١٠٢٤ × ٥٠٠ PNG
  - لقطات شاشة: حد أدنى ٢ لقطة (أيفون وأندرويد منفصلة عن بعضهم)

#### **Store Listing**

- **Title:** نبهني
- **Short description:** (تحت ٨٠ حرف) — "تذكيرات ذكية بالمحادثة"
- **Full description:** انسخ من `store-assets/app-store-description.md` (أو عدّله لجوجل)
- **Tagline:** (optional) "التطبيق اللي يتذكر بدالك"
- **Screenshots:** نفس الـ ٥ screenshots من App Store لكن بمقاسات أندرويد — حد أدنى ٤.٧ بوصة (١٠٨٠ × ١٩٢٠ pixel)
- **Support Email:** (مطلوب) ضع بريد اتصال مثل `support@hussainmofareh.com` أو `hussien2925@gmail.com`
- **Privacy Policy:** رابط `https://hussainmofareh.com/nabhni`
- **App Accessibility:** أكمل الحقول المطلوبة

#### **Content Rating Questionnaire**

على **Content rating** → اضغط **Manage** → أجب على الاستبيان:

- تطبيق عربي/إنجليزي، تذكيرات وملاحظات عادية — على الأغلب **الفئة العمرية: Everyone** (أو 4+ مساوٍ لـ أبل)
- اختر **لا يوجد محتوى عنيف/جنسي/غير مناسب** ونهاية الاستبيان

#### **Privacy and Security**

الذهاب إلى **Data Safety**:

- **Data types collected:**
  - Location (لتذكيرات المواقع) — `"Essential"`
  - Messages/Chat data (إذا فعّلت OpenAI) — `"Optional"`
  - Purchase data (RevenueCat) — `"Essential"` (إن كان الاشتراك فعّال)
- **Data shared with third parties:** نعم (OpenAI و RevenueCat إن كانوا مفعّلين)
- **Data deletion:** كيفية حذف البيانات — وضح أن التطبيق يحفظ محلياً
- **Security practices:** جرّب توصيف ممارسات الأمان البسيطة

### 8. أرسل للمراجعة

من **Release management** → **Releases** → **In production**:

1. اضغط **Create new release**
2. أضف الـ AAB (يجب يكون موجود من الخطوة ٦)
3. عبّي نص الإصدار (Release notes) — مثلاً "الإصدار الأول"
4. اضغط **Review release**
5. اضغط **Start rollout to production**

**ملاحظة:** جوجل عادة يستغرق بين ٢-٤ ساعات للمراجعة (أسرع من أبل). لو الكود أو الأذونات فيها مشكلة، جوجل يرفضه مع شرح واضح — استقبل الرسالة وعدّل ثم أعد الرفع.

### 9. الفروقات الرئيسية بين أبل وجوجل

| الجانب | أبل (App Store) | جوجل (Google Play) |
|--------|------------------|-------------------|
| **صيغة البناء** | `.ipa` | `.aab` (Android App Bundle) |
| **المراجعة** | ٢٤-٤٨ ساعة | ٢-٤ ساعات |
| **رفع الأيقونات** | طلب واحد (iPhone 6.5") | أحجام مختلفة + صورة ميزات |
| **سياسة الخصوصية** | مطلوبة، لكن جوجل أقل صرامة في الفحص | مطلوبة + نموذج Data Safety تفصيلي |
| **الأسعار** | اشتراكات عبر StoreKit | اشتراكات عبر Google Play Billing |
| **النشر** | مباشري بعد الموافقة | يدويّ (تختار متى تضغط Publish) |

---

## حدود معروفة (مؤجلة لمرحلة لاحقة)

- **اختراق الوضع الصامت بالكامل:** يحتاج صلاحية Critical Alerts المقيّدة
  من أبل — التطبيق يستخدم حالياً Time Sensitive (يخترق أوضاع التركيز، ما
  يخترق المفتاح الفيزيائي للصامت).
- **الودجت (Widgets) و Live Activities:** تحتاج كود Swift أصلي منفصل.
- **حسابات المستخدمين ومزامنة السحابة:** البنية التحتية جاهزة في
  `supabase/` لكن غير مفعّلة في التطبيق.
- **اختبار أندرويد:** الكود يدعمها تقنياً (React Native/Expo)، لكن لم
  تُختبر الأسلوب الكامل على جهاز حقيقي أو محاكي — قد تحتاج تعديلات في
  التنبيهات أو الأذونات حسب نسخة Android.
