# برومبتات تصميم لقطات شاشة App Store — نبهني (Nabhni)

**المقاس المطلوب لكل الصور: 1284×2778 بكسل، عمودي (Portrait)** — هذا المقاس
الرسمي لشاشة ٦.٥ بوصة عند أبل. أضف هذا الرقم صراحة في كل برومبت لأن أغلب
أدوات توليد الصور تحتاج تُطلب منها المقاس بالتحديد.

## هوية بصرية مشتركة (كررها في كل البرومبتات الخمسة عشان تطلع متناسقة)

```
App name: "نبهني" (Nabhni), an Arabic-first smart reminders app.
Color palette: deep navy-purple gradient background (#211A5C to #0D0C2E)
for the top status/headline area, clean light background (#F5F7FB) for the
app content area, primary blue accent (#3F6BFF), teal/mint accent (#22C3A6),
warm gold accent (#FFB020).
UI style: modern minimal iOS app, rounded cards with soft shadows, RTL
Arabic layout (text and icons mirrored right-to-left), bold Arabic
typography (Noto Kufi Arabic style), a translucent frosted-glass
(glassmorphism) bottom tab bar with 4 icons.
Composition: bold white Arabic headline text over the dark navy gradient
in the top third of the image, with a realistic iPhone screen mockup (no
device bezel needed, edge-to-edge screenshot style) filling the rest,
showing real, legible Arabic UI text (not lorem ipsum / gibberish —
render actual correct Arabic words as specified below).
Output size: 1284x2778 pixels, portrait, PNG, no rounded device corners
needed (App Store crops that automatically).
```

---

## الصورة ١ — المحادثة الذكية

```
[shared style above]

Headline (large bold white, centered): "تكلم... وخلّه يتذكر بدالك"
Subheadline (smaller, lighter white): "محادثة ذكية تفهم العربي والإنجليزي"

Screen content below the headline: a chat interface titled "محادثة" at
the top. Show a chat bubble sequence, right-aligned bubbles are the user
(blue background, white text), left-aligned bubbles are the assistant
(white background, dark text):
- User: "ذكرني بكرة الساعة ٩ أتصل بأمي"
- Assistant: "تمام، جاهز ✅"
- A white card below with a blue border showing an alarm clock icon,
  label "تذكير", bold title "اتصل بأمي", and subtext "خميس، ٩:٠٠ صباحاً"
- User: "لما أوصل المطار ذكرني آخذ الشاحن"
- A white card with a teal/mint border showing a pin icon, label
  "تذكير موقع", bold title "آخذ الشاحن", subtext "عند الوصول — مطار
  الملك عبدالعزيز"

At the very bottom: a rounded pill-shaped text input bar with placeholder
text "اكتب لنبهني…" and a small blue circular microphone button, then the
frosted-glass bottom tab bar with 4 icons (chat bubble, alarm clock,
notebook, gear) — the chat bubble icon is the active/highlighted one.
```

---

## الصورة ٢ — تذكيرات المواقع

```
[shared style above]

Headline: "تذكيرات توصلك أينما رحت"
Subheadline: "تحدد مكان، وتنبيهك يطلع لحظة وصولك"

Screen content: the top portion shows a simplified map view (light
blue-gray with faint white road lines) with a red map pin in the center
surrounded by a soft teal translucent circle (representing a geofence
radius). Below the map, a white rounded bottom sheet slides up containing:
- Title: "تذكير موقع جديد"
- Label "العنوان" with value "آخذ الشاحن معي"
- Label "يشتغل عند" with two pill buttons: "الوصول" (selected, blue) and
  "المغادرة" (unselected, gray outline)
- Label "نصف قطر الاستشعار" with three pill buttons: "100م", "250م"
  (selected, blue), "500م"
- A full-width blue button at the bottom: "حفظ تذكير الموقع"

Frosted-glass bottom tab bar at the very bottom, alarm clock icon active.
```

---

## الصورة ٣ — كل التذكيرات

```
[shared style above]

Headline: "كل تذكيراتك في مكان وحد"
Subheadline: "وقتية، ومواقع، منظمة بشكل واضح"

Screen content: page title "التذكيرات", below it three filter pill
buttons in a row: "نشطة" (selected, blue), "مكتملة", "الكل".
Below that, a section label "اليوم" followed by two reminder rows (white
rounded cards): one titled "اتصل بأمي" with subtext "٩:٠٠ صباحاً" and an
empty circular checkbox; another titled "اجتماع الفريق" (strikethrough
text, grayed out) with a filled blue checkmark checkbox.
Then a section label "تذكيرات الأماكن" followed by two more reminder
cards with a small teal pin icon and location name, plus a small teal
pill badge reading "عند الوصول" or "عند المغادرة" respectively — titles
"آخذ الشاحن" (location: مطار الملك عبدالعزيز) and "أطفي الفرن" (location:
المنزل).
Then a section label "القادمة" with two or three more simple reminder
rows with future dates like "الأحد، ١٠:٣٠ صباحاً" and "الجمعة القادمة".

Frosted-glass bottom tab bar at the bottom, alarm clock icon active.
```

---

## الصورة ٤ — الملاحظات

```
[shared style above]

Headline: "ملاحظات وقوائم منظّمة"
Subheadline: "نصوص، قوائم، وجداول — كلها بدون إنترنت"

Screen content: page title "الملاحظات". Below it, three white rounded
note cards stacked vertically:
1. A checklist card titled "قائمة البقالة" with a checklist icon, listing
   four items with round checkboxes: "حليب" (checked, strikethrough),
   "خبز" (unchecked), "تمر" (unchecked), "قهوة" (checked, strikethrough)
2. A plain text note card titled "أفكار اجتماع الغد" with a pencil/note
   icon and preview text "نراجع خطة الربع الأخير ونجهز العرض قبل الساعة
   العاشرة صباحاً..."
3. A table-style note card titled "مصاريف الرحلة" with a small chart/grid
   icon and preview text "جدول بالمصاريف اليومية — فندق، مواصلات، أكل"

Frosted-glass bottom tab bar at the bottom, notebook icon active.
```

---

## الصورة ٥ — نبهني بلس (الاشتراك)

```
[shared style above]

Headline: "نبهني بلس — بدون حدود"
Subheadline: "تذكيرات، عناوين، وتنبيهات تخترق الوضع الصامت"

Screen content: centered layout with a sparkle emoji/icon at the top,
bold title "نبهني بلس", subtitle "تذكيرات غير محدودة وتنبيهات تخترق
الوضع الصامت". Below, a right-aligned checklist of four features, each
with a small teal checkmark:
- "تذكيرات وعناوين بلا حدود"
- "تنبيهات تخترق الوضع الصامت"
- "إدخال صوتي غير محدود"
- "ودجت الشاشة الرئيسية"

Below that, two side-by-side pricing cards: one labeled "سنوي" with price
"$34.99" (highlighted with a blue border, marked as best value), and one
labeled "شهري" with price "$4.99" (plain gray border).

Frosted-glass bottom tab bar at the bottom, gear/settings icon active.
```

---

## ملاحظة مهمة

أدوات توليد الصور بالذكاء الاصطناعي (بما فيها GPT-4o/DALL-E) **غالباً
تخربط النص العربي** — تطلع حروف غير متصلة أو مقلوبة أو مشوّهة، خصوصاً
بجمل طويلة. لو صار كذا:

1. جرب توليد الصورة **بدون نص داخلها** (احذف كل الأسطر اللي فيها كلام
   عربي من البرومبت، خله يركز بس على التخطيط والألوان والعناصر البصرية)
2. ثم ضيف النص العربي **يدوياً فوق الصورة** ببرنامج تصميم (Canva، Figma،
   Photoshop) — أضمن طريقة تطلع الحروف صحيحة ومتصلة
