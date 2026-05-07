import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

/**
 * Call Claude and parse JSON response
 * @param {string} userPrompt
 * @param {string} systemPrompt
 * @returns {Promise<object>}
 */
export async function callClaudeJSON(userPrompt, systemPrompt) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt + '\n\nRespect: respond ONLY with valid JSON. No markdown fences, no explanation, no preamble.',
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');

  const cleaned = text.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON from text
    const match = cleaned.match(/[\[{][\s\S]*[\]}]/);
    if (match) return JSON.parse(match[0]);
    throw new Error(`Claude returned non-JSON: ${cleaned.substring(0, 200)}`);
  }
}

/**
 * Call Claude and return raw text
 * @param {string} userPrompt
 * @param {string} systemPrompt
 * @returns {Promise<string>}
 */
export async function callClaudeText(userPrompt, systemPrompt) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
}

export default { callClaudeJSON, callClaudeText };
