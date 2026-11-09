'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';

interface Props {
  onExtracted: (text: string) => void;
}

interface OcrResponse {
  ok?: boolean;
  extractedText?: string;
  provider?: string;
  error?: string;
  reason?: string;
}

const MAX_DIM = 1600;
const JPEG_QUALITY = 0.85;

async function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const maxSide = Math.max(width, height);
      if (maxSide > MAX_DIM) {
        const scale = MAX_DIM / maxSide;
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('no_canvas_ctx')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image_load_failed')); };
    img.src = url;
  });
}

export default function ReceiptScanButton({ onExtracted }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const dataUrl = await resizeToDataUrl(file);
      const res = await fetch('/api/proxy/receipts/ocr', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
        signal: AbortSignal.timeout(45_000),
      });
      const data = (await res.json().catch(() => ({}))) as OcrResponse;
      if (!res.ok || !data.extractedText) {
        if (data.error === 'ocr_unconfigured') setError('Receipt scanning is not configured on the backend.');
        else if (data.error === 'receipt_unreadable') setError('Could not read that image. Try a clearer photo.');
        else setError('Could not extract text from receipt. Please try again.');
        return;
      }
      onExtracted(data.extractedText);
    } catch (err) {
      if (err instanceof Error && err.name === 'TimeoutError') setError('Scan timed out. Backend may be waking up — try again.');
      else setError('Network error during scan.');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="mb-3">
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-raised px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Camera className="h-3.5 w-3.5" aria-hidden />}
          {loading ? 'Scanning receipt…' : 'Scan receipt'}
        </button>
        <span className="text-xs text-ink-faint">or attach a photo — vision AI extracts the text (not stored)</span>
      </div>
      {error && (
        <p className="mt-2 rounded-md border border-danger/30 bg-danger-soft px-2.5 py-1.5 text-xs text-danger">{error}</p>
      )}
    </div>
  );
}
