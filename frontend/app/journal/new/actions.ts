/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/app/journal/new/actions.ts
 * │  Purpose   : Actions
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  GitHub    : https://github.com/setuju
 * │  Website   : https://saturumah.net
 * │  Created   : 10-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

/**
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

'use server';

import { redirect } from 'next/navigation';
import { serverCreateTransaction as createTransaction } from '@/lib/api-server';

export async function submitTransaction(formData: FormData): Promise<void> {
  const text = String(formData.get('text') ?? '').trim();
  if (!text) {
    redirect('/journal/new?error=empty');
  }
  const result = await createTransaction(text);
  if (!result.ok) {
    redirect(`/journal/new?error=${result.error}`);
  }
  redirect('/journal');
}
