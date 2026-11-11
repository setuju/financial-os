'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Loader2, X, Square } from 'lucide-react';

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

const SILENCE_FINALIZE_MS = 3000;
const HARD_TIMEOUT_MS = 60_000;

function friendlyError(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Chrome speech service blocked. Try Edge, or type. (chrome://settings/languages → Speech recognition)';
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
  const [accumulated, setAccumulated] = useState('');
  const [interim, setInterim] = useState('');
  const [micLevel, setMicLevel] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const recRef = useRef<SR | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTsRef = useRef(0);
  const lastResultTsRef = useRef(0);
  const accumulatedRef = useRef('');
  const cancelledRef = useRef(false);

  const emitError = (msg: string | null) => onError?.(msg);

  useEffect(() => {
    const w = window as unknown as SRWindow;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    setSupport(Ctor ? 'supported' : 'unsupported');
  }, []);

  const cleanupSideEffects = () => {
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
    analyserRef.current = null;
    recRef.current = null;
  };

  const resetState = () => {
    setPhase('idle');
    setAccumulated('');
    setInterim('');
    setMicLevel(0);
    setElapsedMs(0);
    accumulatedRef.current = '';
  };

  const finalize = () => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
  };

  const cancel = () => {
    cancelledRef.current = true;
    try {
      recRef.current?.abort();
    } catch {
      /* ignore */
    }
    cleanupSideEffects();
    resetState();
  };

  useEffect(
    () => () => {
      cancelledRef.current = true;
      cleanupSideEffects();
    },
    [],
  );

  const start = async () => {
    if (phase !== 'idle') return;
    emitError(null);
    resetState();
    cancelledRef.current = false;

    if (support === 'unsupported') {
      emitError(
        'Voice requires Chrome, Edge, or Safari. Firefox not supported — please type instead.',
      );
      return;
    }

    setPhase('requesting');

    // Device presence check
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((d) => d.kind === 'audioinput');
      if (mics.length === 0) {
        setPhase('idle');
        emitError('No microphone hardware detected. Connect a mic and reload.');
        return;
      }
    } catch {
      /* skip */
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      const message = err instanceof Error ? err.message : '';
      setPhase('idle');

      let permState: 'granted' | 'prompt' | 'denied' | 'unknown' = 'unknown';
      try {
        const p = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        });
        permState = p.state as 'granted' | 'prompt' | 'denied';
      } catch {
        /* skip */
      }

      // eslint-disable-next-line no-console
      console.warn('[voice] getUserMedia failed', { name, message, permState });

      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        if (permState === 'granted') {
          emitError(
            'Chrome permission is ALLOWED, but OS blocked the mic. Windows 11: Settings → Privacy & security → Microphone → enable "Microphone access", "Let apps access your microphone", and "Let desktop apps access your microphone".',
          );
        } else if (permState === 'denied') {
          emitError(
            'Site blocked mic. Click the lock icon → Microphone → Allow → Reload.',
          );
        } else {
          emitError('Mic access denied. Check both browser and OS settings.');
        }
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        emitError('No microphone detected.');
      } else if (name === 'NotReadableError') {
        emitError('Mic locked by another app (Zoom/Teams/Discord). Close it.');
      } else if (name === 'SecurityError') {
        emitError('Blocked by browser security policy. Check https + private mode.');
      } else {
        emitError(`Could not access mic${name ? ` (${name})` : ''}.`);
      }
      return;
    }
    streamRef.current = stream;

    // Audio meter
    try {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        audioCtxRef.current = ctx;
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        analyserRef.current = analyser;
        const buf = new Uint8Array(analyser.frequencyBinCount);
        const loop = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) sum += buf[i];
          const pct = Math.min(
            100,
            Math.round((sum / buf.length / 128) * 100 * 2.5),
          );
          setMicLevel(pct);
          rafRef.current = requestAnimationFrame(loop);
        };
        loop();
      }
    } catch {
      /* meter is optional */
    }

    const w = window as unknown as SRWindow;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      cleanupSideEffects();
      setPhase('idle');
      emitError('Voice unavailable in this browser.');
      return;
    }

    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = 'en-US';
    rec.continuous = true; // KEY FIX: don't auto-stop after first phrase
    rec.interimResults = true;

    rec.onresult = (e: SREvent) => {
      lastResultTsRef.current = Date.now();
      let newFinal = '';
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const txt = (res[0]?.transcript ?? '').trim();
        if (!txt) continue;
        if (res.isFinal) newFinal += txt + ' ';
        else interimText += txt + ' ';
      }
      if (newFinal) {
        accumulatedRef.current =
          (accumulatedRef.current + ' ' + newFinal).trim() + ' ';
        setAccumulated(accumulatedRef.current.trim());
      }
      setInterim(interimText.trim());
    };

    rec.onerror = (e) => {
      if (e.error === 'aborted' || cancelledRef.current) return;
      const msg = friendlyError(e.error);
      if (msg) emitError(msg);
    };

    rec.onend = () => {
      if (cancelledRef.current) {
        cleanupSideEffects();
        resetState();
        return;
      }
      const final = accumulatedRef.current.trim();
      if (final) onTranscript(final);
      cleanupSideEffects();
      resetState();
    };

    try {
      startTsRef.current = Date.now();
      lastResultTsRef.current = Date.now();
      rec.start();
      setPhase('listening');

      tickRef.current = setInterval(() => {
        const el = Date.now() - startTsRef.current;
        setElapsedMs(el);
        const sinceLast = Date.now() - lastResultTsRef.current;

        // Auto-finalize: 3s silence AFTER having some accumulated text
        if (accumulatedRef.current && sinceLast > SILENCE_FINALIZE_MS) {
          try {
            rec.stop();
          } catch {
            /* ignore */
          }
          return;
        }
        // Hard timeout
        if (el >= HARD_TIMEOUT_MS) {
          try {
            rec.stop();
          } catch {
            /* ignore */
          }
        }
      }, 100);
    } catch {
      cleanupSideEffects();
      setPhase('idle');
      emitError('Could not start microphone. Try reloading.');
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
        title={
          unsupported
            ? 'Voice requires Chrome, Edge, or Safari'
            : 'Speak your transaction(s)'
        }
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
          className="fixed bottom-6 left-1/2 z-50 flex w-[min(92vw,460px)] -translate-x-1/2 flex-col gap-3 rounded-2xl border border-line bg-ink px-5 py-4 text-white shadow-2xl"
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
                {(elapsedMs / 1000).toFixed(1)}s /{' '}
                {(HARD_TIMEOUT_MS / 1000).toFixed(0)}s
              </span>
              <button
                type="button"
                onClick={cancel}
                aria-label="Cancel voice input"
                title="Cancel (discard)"
                className="rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Mic
              className={`h-3 w-3 flex-shrink-0 ${micLevel > 5 ? 'text-emerald-400' : 'text-white/40'}`}
              aria-hidden
            />
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-red-500 transition-[width] duration-100"
                style={{ width: `${micLevel}%` }}
              />
            </div>
          </div>

          {(accumulated || interim) && (
            <p className="text-sm leading-relaxed text-white">
              {accumulated}
              {interim && (
                <span className="italic text-white/60"> {interim}</span>
              )}
            </p>
          )}

          {!accumulated && !interim && (
            <p className="text-center text-xs text-white/50">
              Speak now — say one or more items, then click Stop (or pause 3s)
            </p>
          )}

          <button
            type="button"
            onClick={finalize}
            disabled={!accumulated && !interim}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-40"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            Stop &amp; insert
          </button>
        </div>
      )}
    </>
  );
}
