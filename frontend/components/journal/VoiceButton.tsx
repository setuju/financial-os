'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

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

type Support = 'unknown' | 'supported' | 'unsupported';

const VOICE_TIMEOUT_MS = 15_000;

function errorMessage(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone blocked. Click the lock icon in the address bar → Allow microphone → Reload.';
    case 'no-speech':
      return "Didn't hear anything. Tap the mic and speak clearly.";
    case 'audio-capture':
      return 'No microphone found. Connect one and try again.';
    case 'network':
      return 'Voice recognition needs internet. Check your connection.';
    case 'aborted':
      return '';
    default:
      return `Voice error: ${code}`;
  }
}

export default function VoiceButton({
  onTranscript,
  onError,
}: {
  onTranscript: (text: string) => void;
  onError?: (error: string | null) => void;
}) {
  const [support, setSupport] = useState<Support>('unknown');
  const [listening, setListening] = useState(false);
  const [permissionState, setPermissionState] = useState<
    'unknown' | 'granted' | 'prompt' | 'denied'
  >('unknown');
  const recRef = useRef<SR | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitError = (msg: string | null) => onError?.(msg);

  // Detect support on mount
  useEffect(() => {
    const w = window as unknown as SRWindow;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    setSupport(Ctor ? 'supported' : 'unsupported');

    // Async permission state (best effort)
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((perm) => {
          setPermissionState(perm.state as 'granted' | 'prompt' | 'denied');
          perm.onchange = () =>
            setPermissionState(perm.state as 'granted' | 'prompt' | 'denied');
        })
        .catch(() => {
          /* older browsers: skip */
        });
    }
  }, []);

  const cleanup = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const rec = recRef.current;
    recRef.current = null;
    if (rec) {
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
    }
    setListening(false);
  };

  useEffect(() => () => cleanup(), []);

  const start = async () => {
    if (listening) return;
    emitError(null);

    // 1. Unsupported browser
    if (support === 'unsupported') {
      emitError(
        'Voice input requires Chrome, Edge, or Safari. Firefox does not support Web Speech API — please type instead.',
      );
      return;
    }

    // 2. Pre-request mic permission — THIS triggers the browser dialog
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermissionState('granted');
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      setPermissionState('denied');
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        emitError(
          'Microphone blocked. Click the lock icon in your address bar → Allow microphone → Reload.',
        );
      } else if (
        name === 'NotFoundError' ||
        name === 'DevicesNotFoundError'
      ) {
        emitError('No microphone detected. Connect one and try again.');
      } else if (name === 'NotReadableError') {
        emitError('Microphone is in use by another app. Close it and retry.');
      } else {
        emitError(
          `Could not access microphone${name ? ` (${name})` : ''}. Try reloading.`,
        );
      }
      return;
    }

    // 3. Start SpeechRecognition
    const w = window as unknown as SRWindow;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      emitError('Voice input is unavailable in this browser.');
      return;
    }

    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e: SREvent) => {
      const transcript = e.results[0]?.[0]?.transcript ?? '';
      if (transcript) onTranscript(transcript);
    };

    rec.onerror = (e) => {
      const msg = errorMessage(e.error);
      if (msg) emitError(msg);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setPermissionState('denied');
      }
      cleanup();
    };

    rec.onend = () => cleanup();

    try {
      rec.start();
      setListening(true);
      // Auto-stop after 15s of no final result
      timeoutRef.current = setTimeout(() => {
        if (recRef.current) {
          try {
            recRef.current.stop();
          } catch {
            /* ignore */
          }
        }
      }, VOICE_TIMEOUT_MS);
    } catch {
      emitError('Could not start microphone. Try reloading the page.');
      cleanup();
    }
  };

  if (support === 'unknown') return null;

  const unsupported = support === 'unsupported';
  const denied = permissionState === 'denied';

  const title = unsupported
    ? 'Voice input requires Chrome, Edge, or Safari — Firefox not supported'
    : denied
      ? 'Microphone blocked — enable it in browser settings'
      : 'Speak your transaction';

  return (
    <button
      type="button"
      onClick={start}
      disabled={listening || unsupported}
      title={title}
      aria-label={title}
      className={`flex items-center justify-center gap-2 rounded-lg border px-3 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        unsupported
          ? 'border-line bg-surface-sunken text-ink-faint'
          : 'border-line-strong bg-surface-raised text-ink-soft hover:border-accent hover:text-accent'
      }`}
    >
      {listening ? (
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
      ) : unsupported ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
      <span className="hidden text-sm font-medium sm:inline">
        {listening ? 'Listening…' : unsupported ? 'N/A' : 'Speak'}
      </span>
    </button>
  );
}
