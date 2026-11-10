/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : frontend/components/journal/VoiceButton.tsx            │
 * │  Purpose   : Component: VoiceButton                                 │
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net                      │
 * │  GitHub    : https://github.com/setuju                            │
 * │  Website   : https://saturumah.net                              │
 * │  Created   : 10-11-2026                                             │
 * │  License   : MIT                                                  │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

'use client';

import { useEffect, useState } from 'react';
import { Mic, Loader2 } from 'lucide-react';

// Minimal typings for Web Speech API (not in lib.dom.d.ts)
interface SR {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
interface SREvent {
  resultIndex: number;
  results: {
    [i: number]: {
      isFinal: boolean;
      [j: number]: { transcript: string; confidence: number };
    };
    length: number;
  };
}
type SRCtor = new () => SR;
interface SRWindow extends Window {
  SpeechRecognition?: SRCtor;
  webkitSpeechRecognition?: SRCtor;
}

export default function VoiceButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const w = window as unknown as SRWindow;
    setSupported(!!(w.SpeechRecognition ?? w.webkitSpeechRecognition));
  }, []);

  if (supported === null) return null; // SSR: render nothing to avoid hydration mismatch
  if (supported === false) return null; // browser unsupported (e.g. older Firefox)

  const start = () => {
    const w = window as unknown as SRWindow;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e: SREvent) => {
      const transcript = e.results[0]?.[0]?.transcript ?? '';
      if (transcript) onTranscript(transcript);
    };
    rec.onerror = (e) => {
      setError(e.error === 'not-allowed' ? 'Microphone permission denied' : `Voice error: ${e.error}`);
      setListening(false);
    };
    rec.onend = () => setListening(false);

    setError(null);
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
      setError('Could not start microphone');
    }
  };

  return (
    <button
      type="button"
      onClick={start}
      disabled={listening}
      title={error ?? 'Speak your transaction'}
      className="flex items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface-raised px-3 text-ink-soft transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
    >
      {listening ? (
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
      <span className="hidden sm:inline text-sm font-medium">
        {listening ? 'Listening…' : 'Speak'}
      </span>
    </button>
  );
}
