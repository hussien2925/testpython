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

## حدود معروفة (مؤجلة لمرحلة لاحقة)

- **اختراق الوضع الصامت بالكامل:** يحتاج صلاحية Critical Alerts المقيّدة
  من أبل — التطبيق يستخدم حالياً Time Sensitive (يخترق أوضاع التركيز، ما
  يخترق المفتاح الفيزيائي للصامت).
- **الودجت (Widgets) و Live Activities:** تحتاج كود Swift أصلي منفصل.
- **حسابات المستخدمين ومزامنة السحابة:** البنية التحتية جاهزة في
  `supabase/` لكن غير مفعّلة في التطبيق.
- **نسخة أندرويد:** الكود يدعمها تقنياً، لم تُختبر أو تُجهّز للنشر.
