'use client';

import { useRef, useState } from 'react';
import { AlertCircle, Camera, Loader2 } from 'lucide-react';

type Props = {
  onExtracted: (text: string) => void;
};

const MAX_DIM = 1600;
const JPEG_QUALITY = 0.85;

function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      const scale = Math.min(1, MAX_DIM / Math.max(width, height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('canvas ctx unavailable'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image load failed'));
    };
    img.src = url;
  });
}

const ERR_MAP: Record<string, string> = {
  ocr_unconfigured: 'Receipt scan is not configured on the backend.',
  receipt_unreadable: 'Could not read the receipt. Try a clearer photo.',
  ocr_upstream_error: 'Receipt reader is temporarily unavailable. Try again.',
  image_too_large: 'Image too large. Try a smaller photo.',
  invalid_image_format: 'Unsupported image format. Use JPG or PNG.',
};

interface OcrResp {
  ok?: boolean;
  extractedText?: string;
  error?: string;
}

export default function ReceiptScanButton({ onExtracted }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (file.size > 20 * 1024 * 1024) {
      setError('Image too large (max 20 MB). Try a smaller photo.');
      return;
    }
    setLoading(true);
    try {
      const dataUrl = await resizeToDataUrl(file);
      const res = await fetch('/api/proxy/receipts/ocr', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
        signal: AbortSignal.timeout(65_000),
      });
      const data = (await res.json().catch(() => ({}))) as OcrResp;
      if (!res.ok || !data.ok) {
        setError(ERR_MAP[data.error ?? ''] ?? 'Could not read receipt.');
        return;
      }
      if (data.extractedText) {
        onExtracted(data.extractedText);
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'TimeoutError') {
        setError('Request timed out. Try again.');
      } else {
        setError('Network error. Check connection.');
      }
    } finally {
      setLoading(false);
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex flex-col">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        aria-label="Scan receipt"
        title="Scan receipt (photo or file)"
        className="flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface-raised px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-sunken disabled:opacity-60 sm:h-full sm:py-0 sm:px-3"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
        <span>{loading ? 'Reading…' : 'Scan'}</span>
      </button>
      {error && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-danger">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
