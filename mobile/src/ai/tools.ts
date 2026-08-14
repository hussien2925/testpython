import { OpenAiToolDefinition } from './openai';
import { RepeatRule, LocationTrigger } from '../types';

export const REPEAT_VALUES: RepeatRule[] = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
export const TRIGGER_VALUES: LocationTrigger[] = ['arrive', 'leave'];

export const AI_TOOLS: OpenAiToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'create_time_reminder',
      description:
        'Create a reminder that fires at a specific date and time. Use this for anything the user wants to be reminded about at a moment in time (e.g. "tomorrow at 9 call my mom"). Always resolve relative dates ("tomorrow", "بكرة", "next Sunday") into an absolute ISO 8601 timestamp using the CURRENT_DATE_TIME provided in the system prompt.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'What the user wants to be reminded of.' },
          dueDate: {
            type: 'string',
            description: 'Absolute ISO 8601 timestamp (with timezone offset) for when to fire.',
          },
          repeat: {
            type: 'string',
            enum: REPEAT_VALUES,
            description: 'How often the reminder repeats. Omit or use "none" for one-time reminders.',
          },
          timeSensitive: {
            type: 'boolean',
            description: 'True if the alert should break through Focus/Do Not Disturb.',
          },
        },
        required: ['title', 'dueDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_location_reminder',
      description:
        'Create a reminder that fires when the user physically arrives at (or leaves) a place. Use whenever the user mentions a place: "when I get to the airport", "عند وصولي للمطار", "لما أوصل البيت". The client geocodes locationQuery on-device — pass the place as the user said it plus useful context (city/country) when known.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'What to be reminded of on arrival/leaving.' },
          locationQuery: {
            type: 'string',
            description:
              'Natural-language address or place name to geocode. Prefer specific names ("King Abdulaziz International Airport, Jeddah") over vague ones.',
          },
          trigger: {
            type: 'string',
            enum: TRIGGER_VALUES,
            description: 'Fire on arrival ("arrive") or when leaving the area ("leave"). Default: arrive.',
          },
          radiusMeters: {
            type: 'number',
            description: 'Detection radius around the location in meters. Default 150.',
          },
        },
        required: ['title', 'locationQuery'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_note',
      description:
        'Save a free-form text note. Use for things the user wants to remember but that have no clear time or place attached.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'A short title (a few words).' },
          content: { type: 'string', description: 'The full body of the note.' },
        },
        required: ['title', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_to_checklist',
      description:
        'Add an item to a named checklist (creating the list if it does not exist yet). Use for phrases like "add milk to the grocery list" or "ضيف حليب لقائمة البقالة".',
      parameters: {
        type: 'object',
        properties: {
          listTitle: { type: 'string', description: 'The name of the checklist.' },
          itemText: { type: 'string', description: 'The item to add.' },
        },
        required: ['listTitle', 'itemText'],
      },
    },
  },
];

export function buildSystemPrompt(now: Date, language: 'ar' | 'en'): string {
  const iso = now.toISOString();
  const local = now.toString();
  const languageLine =
    language === 'ar'
      ? 'Reply in Arabic (colloquial Gulf/MSA, whichever matches the user). Keep every reply to one short sentence.'
      : 'Reply in English. Keep every reply to one short sentence.';

  return [
    'You are Nabhni — the built-in reminders assistant for a mobile app.',
    'You help the user capture time-based reminders, location-based reminders, notes, and checklist items — nothing else.',
    `CURRENT_DATE_TIME (ISO): ${iso}`,
    `CURRENT_DATE_TIME (local): ${local}`,
    languageLine,
    'Behavior rules:',
    '- FOCUS: Only process reminders, notes, checklists, and location-based alerts. Reject any other topic with "I only help with reminders, notes, and checklists."',
    '- If the user wants to be reminded of something, call exactly one of the tools rather than describing it in prose.',
    '- Time reminders: always resolve relative expressions using CURRENT_DATE_TIME. Assume the user\'s local timezone matches the timestamp shown.',
    '- Location reminders: IMPORTANT — if the user mentions a location not in their saved addresses:',
    '  * Try to geocode it naturally (e.g., "البيت" + user context → "Riyadh" → "Riyadh, Saudi Arabia")',
    '  * If unclear or not found, ask for clarification: "Which location? You can tap the map button to show me the exact place."',
    '  * Set trigger to "arrive" unless the user explicitly said "when I leave" or "on departure".',
    '- Notes vs checklist: single free-form text → create_note; short items added to a named list → add_to_checklist.',
    '- After a tool call, reply with one short confirmation sentence. Do not repeat details; the app renders a card.',
    '- Never fabricate coordinates. Only pass place NAME/QUERY and let the app geocode it.',
    '- Never invent product features. This app only handles reminders, notes, checklists locally.',
  ].join('\n');
}
