'use server';

import { redirect } from 'next/navigation';
import { createTransaction } from '@/lib/api';

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
