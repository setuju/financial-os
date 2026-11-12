/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/services/astropods.ts
 * │  Purpose   : AI Fallback classification using Astropods (M2M)
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  GitHub    : https://github.com/setuju
 * │  Website   : https://saturumah.net
 * │  Created   : 12-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   12-11-2026
 * @package   financial-os/backend
 * @license   MIT
 */

const TOKEN_URL = 'https://login.astropods.com/oauth2/token';

let cachedToken: { token: string, expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

  const clientId = process.env.ASTROPODS_CLIENT_ID;
  const clientSecret = process.env.ASTROPODS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Astropods credentials missing in environment variables.');
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) throw new Error(`Astropods auth failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return data.access_token;
}

export async function classifyCategoryWithAI(text: string, type: 'income' | 'expense'): Promise<string> {
  try {
    const token = await getToken();
    const url = 'https://api.astropods.com/v1/chat/completions';
    
    const prompt = `Classify this financial transaction: "${text}". Type: ${type}. Output ONLY one word from this list: food, groceries, transport, utilities, shopping, health, entertainment, subscription, gift, pocket_money, freelance, bonus, salary, investment, other. If none fit, invent a single-word lowercase category.`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0,
      }),
    });

    if (!res.ok) throw new Error(`Astropods API failed: ${res.status}`);
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const category = data.choices?.[0]?.message?.content?.trim().toLowerCase();
    
    if (category && /^[a-z_]+$/.test(category)) {
      return category;
    }
    return 'other';
  } catch (err) {
    console.error('[Astropods Fallback Error]', err);
    return 'other'; // Graceful degradation
  }
}
