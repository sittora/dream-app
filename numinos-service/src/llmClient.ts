import { LLM_DEFAULT_PARAMS, SYMBOLIC_GRAPH_SYSTEM_PROMPT } from './prompts/symbolicGraph.js';

export interface LLMResponse { text: string }

export async function callLLM(prompt: string, userMessages: string[], mock?: { text: string }): Promise<LLMResponse> {
  if (mock) return { text: mock.text };
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set for LLM calls');

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYMBOLIC_GRAPH_SYSTEM_PROMPT },
      ...userMessages.map(c => ({ role: 'user', content: c })),
    ],
    temperature: LLM_DEFAULT_PARAMS.temperature,
    top_p: LLM_DEFAULT_PARAMS.top_p,
    max_tokens: 1500,
    response_format: 'json_object'
  } as any;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error('LLM call failed: ' + (await res.text()));
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || '';
  return { text };
}
