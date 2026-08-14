import { useCallback, useMemo, useState } from 'react';
import { useChat } from '../state/ChatContext';
import { useReminders } from '../state/RemindersContext';
import { useSubscription } from '../subscriptions/SubscriptionContext';
import { useI18n } from '../i18n/I18nContext';
import { callOpenAi, isOpenAiConfigured, OpenAiMessage } from './openai';
import { AI_TOOLS, buildSystemPrompt, REPEAT_VALUES, TRIGGER_VALUES } from './tools';
import { parseInput } from '../nlp/parser';
import { geocodePlace } from '../location/geocoding';
import { countRemindersThisMonth, FREE_PLAN_LIMITS } from '../subscriptions/config';
import { ChatArtifact, LocationTrigger, RepeatRule } from '../types';

interface ToolResult {
  artifact: ChatArtifact;
  humanSummary: string;
}

interface ChatController {
  send: (rawText: string) => Promise<void>;
  isSending: boolean;
  aiEnabled: boolean;
  lastError: string | null;
}

export function useChatController(): ChatController {
  const { messages, appendMessage } = useChat();
  const { reminders, addReminder } = useReminders();
  const { tier } = useSubscription();
  const { lang, t } = useI18n();
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const aiEnabled = useMemo(() => isOpenAiConfigured(), []);

  const runTool = useCallback(
    async (name: string, args: Record<string, unknown>): Promise<ToolResult> => {
      switch (name) {
        case 'create_time_reminder': {
          if (tier === 'free' && countRemindersThisMonth(reminders) >= FREE_PLAN_LIMITS.maxRemindersPerMonth) {
            return {
              artifact: { kind: 'error', message: 'free_reminder_limit' },
              humanSummary: lang === 'ar'
                ? `وصلت لحد ٥ تذكيرات هذا الشهر. اشترك في بلس علشان تذكيرات بلا حدود.`
                : 'You\'ve hit the 5-reminder monthly limit on the free plan. Subscribe to Plus for unlimited reminders.',
            };
          }
          const title = String(args.title ?? '').trim() || t.reminder.title;
          const dueDate = String(args.dueDate ?? '');
          const repeatArg = args.repeat;
          const repeat: RepeatRule = REPEAT_VALUES.includes(repeatArg as RepeatRule)
            ? (repeatArg as RepeatRule)
            : 'none';
          const timeSensitive = Boolean(args.timeSensitive);
          const parsed = new Date(dueDate);
          if (Number.isNaN(parsed.getTime())) {
            return {
              artifact: { kind: 'error', message: 'invalid_date' },
              humanSummary: lang === 'ar' ? 'ما فهمت التاريخ.' : 'I couldn\'t understand the date.',
            };
          }
          const reminder = await addReminder({
            title,
            dueDate: parsed.toISOString(),
            repeat,
            timeSensitive,
          });
          return {
            artifact: { kind: 'reminder-created', reminderId: reminder.id },
            humanSummary: title,
          };
        }

        case 'create_location_reminder': {
          if (tier === 'free' && countRemindersThisMonth(reminders) >= FREE_PLAN_LIMITS.maxRemindersPerMonth) {
            return {
              artifact: { kind: 'error', message: 'free_reminder_limit' },
              humanSummary: lang === 'ar'
                ? `وصلت لحد ٥ تذكيرات هذا الشهر. اشترك في بلس علشان تذكيرات بلا حدود.`
                : 'You\'ve hit the 5-reminder monthly limit on the free plan. Subscribe to Plus for unlimited reminders.',
            };
          }
          const title = String(args.title ?? '').trim() || t.reminder.title;
          const query = String(args.locationQuery ?? '').trim();
          const triggerArg = args.trigger;
          const trigger: LocationTrigger = TRIGGER_VALUES.includes(triggerArg as LocationTrigger)
            ? (triggerArg as LocationTrigger)
            : 'arrive';
          const radius = Math.max(50, Math.min(2000, Number(args.radiusMeters ?? 150)));
          if (!query) {
            return {
              artifact: { kind: 'error', message: 'missing_location' },
              humanSummary: lang === 'ar' ? 'حدد لي المكان بالضبط.' : 'Which place exactly?',
            };
          }
          const places = await geocodePlace(query);
          const best = places[0];
          if (!best) {
            return {
              artifact: { kind: 'error', message: 'geocode_failed' },
              humanSummary:
                lang === 'ar'
                  ? `ما لقيت "${query}" على الخريطة.`
                  : `I couldn\'t find "${query}" on the map.`,
            };
          }
          const reminder = await addReminder({
            title,
            dueDate: null,
            location: {
              latitude: best.latitude,
              longitude: best.longitude,
              radius,
              name: best.label,
              trigger,
            },
          });
          return {
            artifact: { kind: 'location-reminder-created', reminderId: reminder.id },
            humanSummary: `${title} @ ${best.label}`,
          };
        }

        default:
          return { artifact: { kind: 'error', message: `unknown_tool:${name}` }, humanSummary: t.common.error };
      }
    },
    [addReminder, lang, t, tier, reminders]
  );

  const sendViaAi = useCallback(
    async (userText: string) => {
      const history: OpenAiMessage[] = [
        { role: 'system', content: buildSystemPrompt(new Date(), lang) },
        ...messages.slice(-16).map<OpenAiMessage>((m) => ({
          role: m.role === 'system' ? 'assistant' : m.role,
          content: m.content,
        })),
        { role: 'user', content: userText },
      ];

      const first = await callOpenAi({ messages: history, tools: AI_TOOLS });

      if (first.toolCalls.length === 0) {
        const reply = first.text.trim() || (lang === 'ar' ? 'تمّ.' : 'Done.');
        await appendMessage('assistant', reply);
        return;
      }

      const artifacts: ChatArtifact[] = [];
      const toolMessages: OpenAiMessage[] = [];
      for (const call of first.toolCalls) {
        const result = await runTool(call.name, call.args);
        artifacts.push(result.artifact);
        toolMessages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify({ ok: result.artifact.kind !== 'error', summary: result.humanSummary }),
        });
      }

      const followUp = await callOpenAi({
        messages: [...history, first.raw, ...toolMessages],
        tools: AI_TOOLS,
        toolChoice: 'none',
      });
      const reply = followUp.text.trim() || (lang === 'ar' ? 'تمّ.' : 'Done.');
      await appendMessage('assistant', reply, artifacts);
    },
    [messages, lang, appendMessage, runTool]
  );

  const sendViaLocalFallback = useCallback(
    async (userText: string) => {
      const intent = parseInput(userText);
      if (intent.kind !== 'reminder' || !intent.dueDate) {
        await appendMessage('assistant', lang === 'ar' ? 'أحتاج تاريخ أو وقت بالضبط.' : 'I need a specific date or time.');
        return;
      }
      if (tier === 'free' && countRemindersThisMonth(reminders) >= FREE_PLAN_LIMITS.maxRemindersPerMonth) {
        await appendMessage(
          'assistant',
          lang === 'ar'
            ? 'وصلت لحد ٥ تذكيرات هذا الشهر. اشترك في بلس علشان تذكيرات بلا حدود.'
            : 'You\'ve hit the 5-reminder monthly limit on the free plan. Subscribe to Plus for unlimited reminders.'
        );
        return;
      }
      const reminder = await addReminder({
        title: intent.title,
        dueDate: intent.dueDate,
        isAllDay: intent.isAllDay,
        repeat: intent.repeat,
      });
      await appendMessage('assistant', lang === 'ar' ? 'جاهز.' : 'Set.', [
        { kind: 'reminder-created', reminderId: reminder.id },
      ]);
    },
    [addReminder, appendMessage, lang, tier, reminders]
  );

  const send = useCallback(
    async (rawText: string) => {
      const userText = rawText.trim();
      if (!userText || isSending) return;
      setIsSending(true);
      setLastError(null);
      await appendMessage('user', userText);
      try {
        if (aiEnabled) {
          await sendViaAi(userText);
        } else {
          await sendViaLocalFallback(userText);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setLastError(message);
        await appendMessage(
          'assistant',
          lang === 'ar'
            ? 'صار خطأ. حاول لاحقاً.'
            : 'Something went wrong. Try again later.'
        );
      } finally {
        setIsSending(false);
      }
    },
    [isSending, appendMessage, aiEnabled, sendViaAi, sendViaLocalFallback, lang]
  );

  return { send, isSending, aiEnabled, lastError };
}
