import { OpenAiToolDefinition } from './openai';
import { RepeatRule, LocationTrigger } from '../types';

export const REPEAT_VALUES: RepeatRule[] = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
export const TRIGGER_VALUES: LocationTrigger[] = ['arrive', 'leave', 'passing'];

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
        'Create a reminder that fires based on location: arrival, departure, or passing by. Use whenever the user mentions a place: "when I get to the airport", "عند وصولي للمطار", "لما أوصل البيت", "when passing by". The client geocodes locationQuery on-device — pass the place as the user said it plus useful context (city/country) when known.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'What to be reminded of on arrival/leaving/passing.' },
          locationQuery: {
            type: 'string',
            description:
              'Natural-language address or place name to geocode. Prefer specific names ("King Abdulaziz International Airport, Jeddah") over vague ones.',
          },
          trigger: {
            type: 'string',
            enum: TRIGGER_VALUES,
            description: 'Fire on arrival ("arrive"), when leaving ("leave"), or when passing nearby ("passing"). Default: arrive.',
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
    'You help the user capture time-based reminders and location-based reminders — nothing else.',
    `CURRENT_DATE_TIME (ISO): ${iso}`,
    `CURRENT_DATE_TIME (local): ${local}`,
    languageLine,
    'Behavior rules:',
    '- FOCUS: Only process reminders and location-based alerts. Reject any other topic with "I only help with reminders."',
    '- If the user wants to be reminded of something, call exactly one of the tools rather than describing it in prose.',
    '- Time reminders: always resolve relative expressions using CURRENT_DATE_TIME. Assume the user\'s local timezone matches the timestamp shown.',
    '- Location reminders: IMPORTANT — if the user mentions a location not in their saved addresses:',
    '  * Try to geocode it naturally (e.g., "البيت" + user context → "Riyadh" → "Riyadh, Saudi Arabia")',
    '  * If unclear or not found, ask for clarification: "Which location? You can tap the map button to show me the exact place."',
    '  * Set trigger to "arrive" unless the user explicitly said "when I leave", "on departure", or "when passing by".',
    '  * Use "passing" for continuous monitoring (e.g., "remind me when I pass by the coffee shop").',
    '- After a tool call, reply with one short confirmation sentence. Do not repeat details; the app renders a card.',
    '- Never fabricate coordinates. Only pass place NAME/QUERY and let the app geocode it.',
    '- Never invent product features. This app only handles reminders locally.',
  ].join('\n');
}
