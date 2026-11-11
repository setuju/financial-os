'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function submitTransactions(formData: FormData) {
  const txsJson = String(formData.get('transactions') ?? '[]');
  let txs = [];
  try { txs = JSON.parse(txsJson); } catch { redirect('/journal/new?error=invalid_json'); }
  
  if (txs.length === 0) redirect('/journal/new?error=empty');

  const sessionId = cookies().get('fos_session_id')?.value || '';
  const backendUrl = process.env.API_URL || 'http://localhost:3001';
  
  const res = await fetch(`${backendUrl}/transactions/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Session-Id': sessionId },
    body: JSON.stringify({ transactions: txs }),
  });
  
  if (!res.ok) {
    const text = await res.text();
    let msg = 'failed';
    try {
      const errData = JSON.parse(text);
      msg = errData.message || errData.error || 'failed';
    } catch {
      msg = text.slice(0, 60) || 'failed';
    }
    console.error('Backend raw error:', text);
    redirect('/journal/new?error=' + encodeURIComponent(msg));
  }
  redirect('/journal');
}
