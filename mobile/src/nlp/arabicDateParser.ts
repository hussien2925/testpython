// Lightweight rule-based Arabic natural-language date/time parser.
// Chrono-node (used for English) has no reliable Arabic support, so common
// colloquial Gulf/MSA reminder phrasings are matched with regex instead.

export interface ArabicDateMatch {
  date: Date;
  matchedText: string;
}

const WEEKDAYS: Record<string, number> = {
  // JS Date.getDay(): 0 = Sunday ... 6 = Saturday
  'الاحد': 0,
  'الأحد': 0,
  'احد': 0,
  'الاثنين': 1,
  'الإثنين': 1,
  'اثنين': 1,
  'الثلاثاء': 2,
  'ثلاثاء': 2,
  'الاربعاء': 3,
  'الأربعاء': 3,
  'اربعاء': 3,
  'الخميس': 4,
  'خميس': 4,
  'الجمعة': 5,
  'جمعة': 5,
  'السبت': 6,
  'سبت': 6,
};

const NUMBER_WORDS: Record<string, number> = {
  'واحد': 1, 'واحدة': 1, 'إحدى': 1, 'احدى': 1,
  'اثنين': 2, 'اثنتين': 2, 'ثنتين': 2,
  'ثلاثة': 3, 'ثلاث': 3,
  'اربعة': 4, 'أربعة': 4, 'اربع': 4,
  'خمسة': 5, 'خمس': 5,
  'ستة': 6, 'ست': 6,
  'سبعة': 7, 'سبع': 7,
  'ثمانية': 8, 'ثماني': 8,
  'تسعة': 9, 'تسع': 9,
  'عشرة': 10, 'عشر': 10,
  'إحدى عشر': 11, 'احدى عشر': 11,
  'اثنا عشر': 12, 'اثني عشر': 12, 'اثناعشر': 12,
};

export function normalizeArabicDigits(input: string): string {
  const arabicIndic = '٠١٢٣٤٥٦٧٨٩';
  return input.replace(/[٠-٩]/g, (d) => String(arabicIndic.indexOf(d)));
}

function wordsToNumber(text: string): number | null {
  const cleaned = text.trim();
  if (NUMBER_WORDS[cleaned] !== undefined) return NUMBER_WORDS[cleaned];
  const digitMatch = normalizeArabicDigits(cleaned).match(/\d+/);
  if (digitMatch) return parseInt(digitMatch[0], 10);
  return null;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function applyTimeOfDay(base: Date, text: string): { date: Date; consumed: string } | null {
  const timeRegex =
    /الساعة\s*([0-9٠-٩]{1,2}|[؀-ۿ]+)(?:\s*[:٫]\s*([0-9٠-٩]{1,2}))?(?:\s*(الا ربع|إلا ربع|وربع|ونص|والنص))?\s*(صباحا|صباحاً|مساء|مساءً|ظهرا|ظهراً|عصرا|عصراً|ليلا|ليلاً)?/;
  const match = normalizeArabicDigits(text).match(timeRegex);
  if (!match) return null;

  const rawHour = match[1];
  let hour = wordsToNumber(rawHour);
  if (hour === null) return null;
  let minute = match[2] ? parseInt(match[2], 10) : 0;

  const fraction = match[3];
  if (fraction === 'وربع') minute = 15;
  else if (fraction === 'ونص' || fraction === 'والنص') minute = 30;
  else if (fraction === 'الا ربع' || fraction === 'إلا ربع') {
    hour = hour - 1;
    minute = 45;
  }

  const period = match[4];
  if (hour === 12) hour = period && period.startsWith('صباح') ? 0 : 12;
  if (period) {
    if ((period.startsWith('مساء') || period.startsWith('عصر') || period.startsWith('ليل')) && hour < 12) {
      hour += 12;
    }
  } else if (hour >= 1 && hour <= 6) {
    // No AM/PM marker and a low hour number colloquially defaults to the
    // nearer upcoming time; scheduling logic below rolls to the next day
    // automatically if this already passed today, so keep as-is (24h AM).
  }

  const result = new Date(base);
  result.setHours(hour, minute, 0, 0);
  return { date: result, consumed: match[0] };
}

function findRelativeDuration(text: string, now: Date): ArabicDateMatch | null {
  const t = normalizeArabicDigits(text);

  const dualUnits: Array<[RegExp, (n: number) => number]> = [
    [/بعد\s+يومين/, () => 2 * 24 * 60],
    [/بعد\s+اسبوعين|بعد\s+أسبوعين/, () => 2 * 7 * 24 * 60],
    [/بعد\s+ساعتين/, () => 2 * 60],
    [/بعد\s+شهرين/, () => 2 * 30 * 24 * 60],
  ];
  for (const [regex, toMinutes] of dualUnits) {
    const m = t.match(regex);
    if (m) {
      const date = new Date(now.getTime() + toMinutes(2) * 60000);
      return { date, matchedText: m[0] };
    }
  }

  const halfQuarter = t.match(/بعد\s+(نص|ربع)\s+ساعة/);
  if (halfQuarter) {
    const minutes = halfQuarter[1] === 'نص' ? 30 : 15;
    return { date: new Date(now.getTime() + minutes * 60000), matchedText: halfQuarter[0] };
  }

  const relative = t.match(
    /بعد\s+([0-9]+|[؀-ۿ]+)\s*(دقيقة|دقايق|دقائق|ساعة|ساعات|يوم|ايام|أيام|اسبوع|أسبوع|اسابيع|أسابيع|شهر|شهور|أشهر)/
  );
  if (relative) {
    const amount = wordsToNumber(relative[1]) ?? 1;
    const unit = relative[2];
    let minutes = 0;
    if (unit.includes('دقي')) minutes = amount;
    else if (unit.includes('ساع')) minutes = amount * 60;
    else if (unit.includes('يوم') || unit.includes('ايام') || unit.includes('أيام')) minutes = amount * 24 * 60;
    else if (unit.includes('اسبوع') || unit.includes('أسبوع')) minutes = amount * 7 * 24 * 60;
    else if (unit.includes('شهر')) minutes = amount * 30 * 24 * 60;
    return { date: new Date(now.getTime() + minutes * 60000), matchedText: relative[0] };
  }

  return null;
}

export function parseArabicDate(rawText: string, now: Date = new Date()): ArabicDateMatch | null {
  // Normalize once so every matchedText fragment returned below is guaranteed
  // to be a literal substring of the normalized text — callers that strip
  // matchedText out of their own (equally normalized) copy of the input can
  // then rely on a plain string replace instead of re-deriving offsets.
  const text = normalizeArabicDigits(rawText);
  const relative = findRelativeDuration(text, now);
  if (relative) {
    const withTime = applyTimeOfDay(relative.date, text);
    return withTime ? { date: withTime.date, matchedText: relative.matchedText + ' ' + withTime.consumed } : relative;
  }

  let baseDay: Date | null = null;
  let matchedDayText = '';

  if (/اليوم|الليلة/.test(text)) {
    baseDay = startOfDay(now);
    matchedDayText = text.match(/اليوم|الليلة/)?.[0] ?? '';
  } else if (/بعد بكرة|بعد غد|بعد غداً/.test(text)) {
    baseDay = startOfDay(new Date(now.getTime() + 2 * 24 * 60 * 60000));
    matchedDayText = text.match(/بعد بكرة|بعد غد|بعد غداً/)?.[0] ?? '';
  } else if (/بكرة|غدا|غداً|غد/.test(text)) {
    baseDay = startOfDay(new Date(now.getTime() + 24 * 60 * 60000));
    matchedDayText = text.match(/بكرة|غدا|غداً|غد/)?.[0] ?? '';
  } else {
    for (const [word, weekday] of Object.entries(WEEKDAYS)) {
      const regex = new RegExp(`(?:يوم\\s+)?${word}`);
      const m = text.match(regex);
      if (m) {
        const currentDay = now.getDay();
        let diff = weekday - currentDay;
        if (diff < 0) diff += 7;
        baseDay = startOfDay(new Date(now.getTime() + diff * 24 * 60 * 60000));
        matchedDayText = m[0];
        break;
      }
    }
  }

  if (!baseDay) return null;

  const withTime = applyTimeOfDay(baseDay, text);
  if (withTime) {
    let finalDate = withTime.date;
    // "today"/weekday-today with a time already past today with no explicit
    // day-after-tomorrow etc. rolls to the next matching day, not the past.
    if (finalDate.getTime() <= now.getTime() && /اليوم|الليلة/.test(matchedDayText) === false) {
      finalDate = new Date(finalDate.getTime() + 7 * 24 * 60 * 60000);
    }
    return { date: finalDate, matchedText: `${matchedDayText} ${withTime.consumed}`.trim() };
  }

  return { date: baseDay, matchedText: matchedDayText };
}
