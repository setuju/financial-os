'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Loader2, X } from 'lucide-react';

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
type Phase = 'idle' | 'requesting' | 'listening';

const VOICE_TIMEOUT_MS = 15_000;
const SILENCE_HINT_MS = 5_000;

function friendlyError(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Chrome speech service is blocked or unreachable. Try Edge, or type instead. (Check chrome://settings/languages → Speech recognition.)';
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
  const [phase, setPhase] = useState<Phase>('idle');
  const [interim, setInterim] = useState('');
  const [micLevel, setMicLevel] = useState(0); // 0..100
  const [elapsedMs, setElapsedMs] = useState(0);
  const [showSilenceHint, setShowSilenceHint] = useState(false);

  const recRef = useRef<SR | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTsRef = useRef(0);
  const lastInterimTsRef = useRef(0);

  const emitError = (msg: string | null) => {
    onError?.(msg);
  };

  useEffect(() => {
    const w = window as unknown as SRWindow;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    setSupport(Ctor ? 'supported' : 'unsupported');
  }, []);

  const teardown = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (recRef.current) {
      try {
        recRef.current.abort();
      } catch {
        /* ignore */
      }
      recRef.current = null;
    }
    analyserRef.current = null;
  };

  const cancel = () => {
    teardown();
    setPhase('idle');
    setInterim('');
    setMicLevel(0);
    setElapsedMs(0);
    setShowSilenceHint(false);
  };

  useEffect(() => () => teardown(), []);

  const start = async () => {
    if (phase !== 'idle') return;
    emitError(null);
    setInterim('');
    setShowSilenceHint(false);

    if (support === 'unsupported') {
      emitError(
        'Voice input requires Chrome, Edge, or Safari. Firefox does not support Web Speech API — please type instead.',
      );
      return;
    }

    setPhase('requesting');

    // 1. Request mic (triggers dialog + gives us stream for audio meter)
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      setPhase('idle');
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        emitError(
          'Microphone blocked. Click the lock icon in your address bar → Allow microphone → Reload.',
        );
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        emitError('No microphone detected. Connect one and try again.');
      } else if (name === 'NotReadableError') {
        emitError('Microphone is in use by another app. Close it and retry.');
      } else {
        emitError(`Could not access microphone${name ? ` (${name})` : ''}.`);
      }
      return;
    }
    streamRef.current = stream;

    // 2. Setup audio meter (visual proof mic captures)
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
        const buf = new Uint8Array(analyser.frequencyBinCount);
        const loop = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) sum += buf[i];
          const avg = sum / buf.length;
          // amplify for visibility: 0..100
          const pct = Math.min(100, Math.round((avg / 128) * 100 * 2.5));
          setMicLevel(pct);
          if (pct > 8) lastInterimTsRef.current = Date.now();
          rafRef.current = requestAnimationFrame(loop);
        };
        loop();
      }
    } catch {
      /* meter is nice-to-have; continue without */
    }

    // 3. Start SpeechRecognition
    const w = window as unknown as SRWindow;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      teardown();
      setPhase('idle');
      emitError('Voice input is unavailable in this browser.');
      return;
    }

    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = true;

    rec.onresult = (e: SREvent) => {
      let interimText = '';
      let finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const txt = res[0]?.transcript ?? '';
        if (res.isFinal) finalText += txt;
        else interimText += txt;
      }
      if (interimText) {
        setInterim(interimText);
        lastInterimTsRef.current = Date.now();
      }
      if (finalText) {
        onTranscript(finalText.trim());
        cancel();
      }
    };

    rec.onerror = (e) => {
      const msg = friendlyError(e.error);
      if (msg) emitError(msg);
      teardown();
      setPhase('idle');
      setMicLevel(0);
      setElapsedMs(0);
    };

    rec.onend = () => {
      teardown();
      setPhase('idle');
      setMicLevel(0);
      setElapsedMs(0);
      setInterim('');
    };

    try {
      startTsRef.current = Date.now();
      lastInterimTsRef.current = Date.now();
      rec.start();
      setPhase('listening');

      tickRef.current = setInterval(() => {
        const el = Date.now() - startTsRef.current;
        setElapsedMs(el);
        // Silence hint: mic active but no speech
        if (
          el > SILENCE_HINT_MS &&
          Date.now() - lastInterimTsRef.current > SILENCE_HINT_MS
        ) {
          setShowSilenceHint(true);
        }
        if (el >= VOICE_TIMEOUT_MS) {
          try {
            rec.stop();
          } catch {
            /* ignore */
          }
        }
      }, 100);
    } catch {
      teardown();
      setPhase('idle');
      emitError('Could not start microphone. Try reloading the page.');
    }
  };

  if (support === 'unknown') return null;

  const unsupported = support === 'unsupported';

  return (
    <>
      <button
        type="button"
        onClick={start}
        disabled={phase !== 'idle' || unsupported}
        title={unsupported ? 'Voice requires Chrome, Edge, or Safari' : 'Speak your transaction'}
        aria-label="Speak your transaction"
        className={`flex items-center justify-center gap-2 rounded-lg border px-3 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          unsupported
            ? 'border-line bg-surface-sunken text-ink-faint'
            : phase === 'listening'
              ? 'border-danger/50 bg-danger-soft text-danger'
              : 'border-line-strong bg-surface-raised text-ink-soft hover:border-accent hover:text-accent'
        }`}
      >
        {phase === 'requesting' ? (
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        ) : phase === 'listening' ? (
          <Mic className="h-5 w-5 animate-pulse" />
        ) : unsupported ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
        <span className="hidden text-sm font-medium sm:inline">
          {phase === 'requesting'
            ? 'Allow mic…'
            : phase === 'listening'
              ? 'Listening'
              : unsupported
                ? 'N/A'
                : 'Speak'}
        </span>
      </button>

      {phase === 'listening' && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-50 flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2 rounded-2xl border border-line bg-ink px-5 py-4 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
              <span className="text-sm font-semibold">Listening…</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-white/60">
                {(elapsedMs / 1000).toFixed(1)}s / {(VOICE_TIMEOUT_MS / 1000).toFixed(0)}s
              </span>
              <button
                type="button"
                onClick={cancel}
                aria-label="Cancel voice input"
                className="rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Audio meter — visual proof mic is capturing */}
          <div className="flex items-center gap-2">
            <Mic className="h-3 w-3 flex-shrink-0 text-white/40" aria-hidden />
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-red-500 transition-[width] duration-100"
                style={{ width: `${micLevel}%` }}
              />
            </div>
          </div>

          {interim && (
            <p className="text-center text-xs italic text-white/80">&ldquo;{interim}&rdquo;</p>
          )}

          {!interim && showSilenceHint && (
            <p className="text-center text-xs text-white/70">
              {micLevel > 3
                ? 'Mic is working, but Chrome speech service isn\u2019t responding. Try Edge or type instead.'
                : 'Speak clearly into your microphone.'}
            </p>
          )}

          {!interim && !showSilenceHint && (
            <p className="text-center text-xs text-white/50">Speak now…</p>
          )}
        </div>
      )}
    </>
  );
}
