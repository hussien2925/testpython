import Constants from 'expo-constants';

interface OpenAiExtra {
  openAiApiKey?: string;
  openAiModel?: string;
  openAiBaseUrl?: string;
}

const extra = (Constants.expoConfig?.extra ?? {}) as OpenAiExtra;

export const OPENAI_API_KEY = extra.openAiApiKey ?? '';
export const OPENAI_MODEL = extra.openAiModel ?? 'gpt-4o';
export const OPENAI_BASE_URL = extra.openAiBaseUrl ?? 'https://api.openai.com/v1';

export function isOpenAiConfigured(): boolean {
  return OPENAI_API_KEY.length > 0;
}

export interface OpenAiToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface OpenAiMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
}

export interface OpenAiToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface OpenAiChatResponse {
  text: string;
  toolCalls: OpenAiToolCall[];
  raw: OpenAiMessage;
}

interface RequestOptions {
  messages: OpenAiMessage[];
  tools?: OpenAiToolDefinition[];
  toolChoice?: 'auto' | 'required' | 'none';
  temperature?: number;
  signal?: AbortSignal;
}

export async function callOpenAi(options: RequestOptions): Promise<OpenAiChatResponse> {
  if (!isOpenAiConfigured()) {
    throw new Error('OPENAI_NOT_CONFIGURED');
  }

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: options.messages,
      tools: options.tools,
      tool_choice: options.toolChoice ?? (options.tools ? 'auto' : undefined),
      temperature: options.temperature ?? 0.3,
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const json = (await response.json()) as {
    choices: Array<{ message: OpenAiMessage }>;
  };

  const message = json.choices[0]?.message;
  if (!message) throw new Error('OpenAI returned an empty response');

  const toolCalls: OpenAiToolCall[] = (message.tool_calls ?? []).map((call) => {
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(call.function.arguments || '{}') as Record<string, unknown>;
    } catch {
      // Malformed arguments — pass an empty object so the caller can surface
      // an error instead of crashing on the JSON parse.
    }
    return { id: call.id, name: call.function.name, args: parsed };
  });

  return {
    text: message.content ?? '',
    toolCalls,
    raw: message,
  };
}
