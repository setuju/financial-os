'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';

interface Props {
  onExtracted: (text: string) => void;
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
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const dataUrl = await resizeToDataUrl(file);
      const res = await fetch('/api/proxy/receipts/ocr', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
        signal: AbortSignal.timeout(45_000),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.extractedText) {
        onExtracted(data.extractedText);
      }
    } catch {
      // ignored
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <input type="file" accept="image/*" capture="environment" className="hidden" ref={inputRef} onChange={handleFile} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-70"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        Scan Receipt
      </button>
    </>
  );
}
