'use client';

import { useState } from 'react';
import { Camera, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  onExtracted: (text: string) => void;
}

const MAX_DIM = 1024;
const JPEG_QUALITY = 0.75;
const OCR_TIMEOUT_MS = 120_000;

// Direct backend URL — bypasses Vercel function overhead (Hobby plan caps
// at 10s; OCR.space + Groq fallback can legitimately exceed that).
// CORS is verified: origin allowlist + allowedHeaders include x-session-id.
const DIRECT_API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : 'https://financial-api.saturumah.net');

async function resizeToDataUrl(file: File): Promise<string> {
  // Android Chrome may hand back HEIC; canvas can't decode it.
  const isHeic = /heic|heif/i.test(file.type) || /\.heic$|\.heif$/i.test(file.name);
  if (isHeic) {
    throw new Error('image_format_heic');
  }

  // Use FileReader to get a data: URL instead of URL.createObjectURL.
  // The blob: URL was being blocked by our own Content-Security-Policy
  // (img-src 'self' data: https:), causing a silent img.onerror.
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('file_reader_failed'));
    reader.readAsDataURL(file);
  });

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
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
    img.onerror = () => reject(new Error('image_load_failed'));
    img.src = dataUrl;
  });
}

async function getSessionId(): Promise<string | null> {
  try {
    const r = await fetch('/api/session-id', { cache: 'no-store' });
    if (!r.ok) return null;
    const j = (await r.json()) as { id?: string };
    return j.id ?? null;
  } catch {
    return null;
  }
}

export default function ReceiptScanButton({ onExtracted }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    const t0 = performance.now();

    try {
      const dataUrl = await resizeToDataUrl(file);
      const payloadKb = Math.round(dataUrl.length / 1024);

      const sessionId = await getSessionId();
      if (!sessionId) {
        setError('Session expired. Log in again.');
        return;
      }

      const res = await fetch(`${DIRECT_API_URL}/receipts/ocr`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({ image: dataUrl }),
        signal: AbortSignal.timeout(OCR_TIMEOUT_MS),
      });

      const elapsedMs = Math.round(performance.now() - t0);
      const data = (await res.json().catch(() => ({}))) as {
        extractedText?: string;
        error?: string;
        reason?: string;
      };

      if (!res.ok || !data.extractedText) {
        // Diagnostic visible on mobile — shows HTTP status, error code,
        // elapsed time, payload size. Screenshot-able.
        if (data.error === 'ocr_unconfigured') {
          setError(`Vision AI not configured (${elapsedMs}ms)`);
        } else if (data.error === 'receipt_unreadable') {
          setError(`Unreadable image (${payloadKb}KB, ${elapsedMs}ms)`);
        } else if (data.error === 'ocr_upstream_error') {
          const reason = (data.reason ?? '').slice(0, 60);
          setError(`OCR upstream failed: ${reason} (${elapsedMs}ms)`);
        } else {
          setError(`HTTP ${res.status} (${elapsedMs}ms, ${payloadKb}KB)`);
        }
        return;
      }

      const elapsed2 = Math.round(performance.now() - t0);
      // eslint-disable-next-line no-console
      console.info(`[OCR] success in ${elapsed2}ms, ${payloadKb}KB`);
      onExtracted(data.extractedText);
    } catch (err: unknown) {
      const elapsedMs = Math.round(performance.now() - t0);
      // eslint-disable-next-line no-console
      console.error('[OCR Upload Error]', err, `(${elapsedMs}ms)`);
      if (err instanceof Error) {
        if (err.name === 'TimeoutError') {
          setError(`Timed out after ${Math.round(elapsedMs / 1000)}s`);
        } else if (err.message === 'image_format_heic') {
          setError('HEIC photo not supported. Use camera or JPG/PNG.');
        } else if (err.message === 'image_load_failed') {
          setError('Could not decode image.');
        } else if (err.message === 'no_canvas_ctx') {
          setError('Browser canvas unavailable. Reload.');
        } else {
          setError(`${err.message.slice(0, 40)} (${elapsedMs}ms)`);
        }
      } else {
        setError(`Unknown error (${elapsedMs}ms)`);
      }
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="relative flex flex-col w-full">
      <button
        type="button"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-70"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        Scan Receipt
      </button>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        disabled={loading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        title=""
      />

      {error && (
        <div className="absolute -bottom-6 left-0 w-full flex items-center justify-center gap-1 text-[10px] text-danger text-center">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}
    </div>
  );
}
