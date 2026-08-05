import * as chrono from 'chrono-node';
import { ParsedIntent } from '../types';
import { normalizeArabicDigits, parseArabicDate } from './arabicDateParser';

const ARABIC_RANGE = /[؀-ۿ]/;

function isArabic(text: string): boolean {
  return ARABIC_RANGE.test(text);
}

// The "(to|that)" group must not swallow the "to" that starts "tomorrow" —
// require a word boundary right after it.
const EN_REMINDER_TRIGGERS = /^(remind me|reminder|remember)\b\s*(?:(?:to|that)\b)?\s*/i;
const AR_REMINDER_TRIGGERS = /(ذكرني|ذكّرني|نبهني|فكرني)\s*/;

const EN_CHECKLIST_ADD = /^add\s+(.+?)\s+to\s+(?:the\s+|my\s+)?(.+?)(?:\s+list)?$/i;
const AR_CHECKLIST_ADD = /^ضيف\s+(.+?)\s+(?:الى|إلى|ل)\s*قائمة\s+(.+)$/;
const AR_CHECKLIST_ADD_NO_SPACE = /^ضيف\s+(.+?)\s+لقائمة\s+(.+)$/;

function titleCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function tryChecklistAdd(raw: string): ParsedIntent | null {
  const enMatch = raw.match(EN_CHECKLIST_ADD);
  if (enMatch) {
    const itemText = enMatch[1].trim();
    const listName = enMatch[2].trim();
    return { kind: 'checklist-add', listTitle: `${titleCase(listName)} list`, itemText: titleCase(itemText) };
  }

  const arMatch = raw.match(AR_CHECKLIST_ADD) ?? raw.match(AR_CHECKLIST_ADD_NO_SPACE);
  if (arMatch) {
    const itemText = arMatch[1].trim();
    const listName = arMatch[2].trim();
    return { kind: 'checklist-add', listTitle: `قائمة ${listName}`, itemText };
  }

  return null;
}

function tryReminder(raw: string, now: Date): ParsedIntent | null {
  const arabic = isArabic(raw);

  if (arabic) {
    // Normalize once so matchedText (always derived from a normalized copy
    // inside parseArabicDate) is guaranteed to be a literal substring of
    // withoutTrigger below, and the plain string replace can't silently
    // no-op on an Arabic-Indic vs. Western digit mismatch.
    const normalized = normalizeArabicDigits(raw);
    const hasTrigger = AR_REMINDER_TRIGGERS.test(normalized);
    const withoutTrigger = normalized.replace(AR_REMINDER_TRIGGERS, '').trim();
    const match = parseArabicDate(withoutTrigger, now) ?? parseArabicDate(normalized, now);
    if (!match) {
      return hasTrigger ? { kind: 'reminder', title: withoutTrigger || normalized, dueDate: null, isAllDay: false, repeat: 'none' } : null;
    }
    const title = withoutTrigger.replace(match.matchedText, '').replace(/\s+/g, ' ').trim() || withoutTrigger || normalized;
    return { kind: 'reminder', title, dueDate: match.date.toISOString(), isAllDay: false, repeat: 'none' };
  }

  const hasTrigger = EN_REMINDER_TRIGGERS.test(raw);
  const withoutTrigger = raw.replace(EN_REMINDER_TRIGGERS, '').trim();
  const results = chrono.parse(withoutTrigger, now, { forwardDate: true });
  if (results.length === 0) {
    return hasTrigger ? { kind: 'reminder', title: withoutTrigger || raw, dueDate: null, isAllDay: false, repeat: 'none' } : null;
  }
  const best = results[0];
  const rawTitle = (withoutTrigger.slice(0, best.index) + withoutTrigger.slice(best.index + best.text.length))
    .replace(/\s+/g, ' ')
    .trim()
    // Drop the connector left dangling when the date sits between the
    // trigger and the action, e.g. "remind me Sunday at 4 to call mom".
    .replace(/^(?:to|that)\b\s*/i, '');
  const title = rawTitle ? titleCase(rawTitle) : rawTitle;
  return {
    kind: 'reminder',
    title: title || withoutTrigger,
    dueDate: best.start.date().toISOString(),
    isAllDay: !best.start.isCertain('hour'),
    repeat: 'none',
  };
}

export function parseInput(raw: string, now: Date = new Date()): ParsedIntent {
  const text = raw.trim();
  if (!text) return { kind: 'note', title: '', content: '' };

  const checklist = tryChecklistAdd(text);
  if (checklist) return checklist;

  const reminder = tryReminder(text, now);
  if (reminder) return reminder;

  const firstLine = text.split('\n')[0].slice(0, 60);
  return { kind: 'note', title: firstLine, content: text };
}
