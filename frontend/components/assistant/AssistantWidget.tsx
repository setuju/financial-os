/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/components/assistant/AssistantWidget.tsx
 * │  Purpose   : Component: AssistantWidget
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  GitHub    : https://github.com/setuju
 * │  Website   : https://saturumah.net
 * │  Created   : 10-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

/**
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Send, Sparkles, X } from 'lucide-react';

type Msg = { role: 'user' | 'assistant'; content: string };
type ChatResp = { reply?: string; model?: string; version?: string; error?: string };

const MAX_INPUT = 1000;
const MAX_HISTORY = 6;

function renderRich(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re = /`([^`]+)`|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(<span key={key++}>{text.slice(last, m.index)}</span>);
    if (m[1] !== undefined) {
      nodes.push(<code key={key++} className="rounded bg-surface px-1 py-0.5 font-mono text-[0.85em] text-accent">{m[1]}</code>);
    } else if (m[2] !== undefined) {
      nodes.push(<strong key={key++} className="font-semibold">{m[2]}</strong>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(<span key={key++}>{text.slice(last)}</span>);
  return nodes;
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, error]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    if (text.length > MAX_INPUT) {
      setError(`Message too long (max ${MAX_INPUT} chars).`);
      return;
    }
    setError(null);
    setLoading(true);
    setSlow(false);
    const slowTimer = setTimeout(() => setSlow(true), 3000);
    const history = messages.slice(-MAX_HISTORY);
    try {
      const res = await fetch('/api/proxy/assistant/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
        signal: AbortSignal.timeout(65_000),
      });
      const data = (await res.json().catch(() => ({}))) as ChatResp;
      if (!res.ok) {
        if (data.error === 'assistant_unconfigured') {
          setError('Assistant is not configured on the backend (OPENROUTER_API_KEY missing).');
        } else if (
          data.error === 'upstream_error' ||
          data.error === 'upstream_unreachable'
        ) {
          setError('Assistant is temporarily unavailable. Please try again.');
        } else {
          setError(`Request failed (${res.status}).`);
        }
        return;
      }
      const reply = data.reply?.trim();
      if (!reply) {
        setError('Empty reply from assistant.');
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: text },
        { role: 'assistant', content: reply },
      ]);
      setInput('');
    } catch (e) {
      if (e instanceof Error && e.name === 'TimeoutError') {
        setError('Request timed out. Backend may be waking up — try again.');
      } else {
        setError('Network error. Check connection and retry.');
      }
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setSlow(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          aria-label="Open assistant"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform hover:scale-105 hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Financial OS assistant"
          className="fixed bottom-5 right-5 z-50 flex h-[520px] w-[380px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-xl border border-line bg-surface-raised shadow-2xl"
        >
          <header className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-ink">Financial OS Assistant</span>
            </div>
            <button
              type="button"
              aria-label="Close assistant"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && !error && (
              <div className="rounded-lg bg-surface-sunken p-3 text-sm text-ink-soft">
                Hi! I can explain features, input syntax, filters, exports, and troubleshooting. Try:
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>&ldquo;How do I add a transaction?&rdquo;</li>
                  <li>&ldquo;What is ethical surplus?&rdquo;</li>
                  <li>&ldquo;How do I export a PDF?&rdquo;</li>
                </ul>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                    m.role === 'user'
                      ? 'bg-accent text-white'
                      : 'bg-surface-sunken text-ink'
                  }`}
                >
                  {m.role === 'assistant' ? renderRich(m.content) : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-lg bg-surface-sunken px-3 py-2 text-sm text-ink-soft">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{slow ? 'Waking backend (up to 50s on first use)…' : 'Thinking…'}</span>
                </div>
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
                {error}
              </div>
            )}
          </div>

          <div className="border-t border-line p-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT))}
              onKeyDown={onKey}
              placeholder="Ask about the app… (Enter sends, Shift+Enter newline)"
              rows={2}
              maxLength={MAX_INPUT}
              disabled={loading}
              className="w-full resize-none rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-ink-faint">
                {input.length}/{MAX_INPUT}
              </span>
              <button
                type="button"
                onClick={() => void send()}
                disabled={loading || input.trim().length === 0}
                className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
