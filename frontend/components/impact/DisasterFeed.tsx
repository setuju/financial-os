'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';

interface DisasterReport {
  id: string; title: string; source: string; date: string; url: string;
}

export default function DisasterFeed() {
  const [disasters, setDisasters] = useState<DisasterReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/disasters')
      .then((res) => res.json())
      .then((data) => setDisasters(data.disasters || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mt-8 flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-ink-faint" /></div>;
  if (disasters.length === 0) return null;

  return (
    <div className="mt-8 rounded-xl border border-line bg-surface-raised p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        Live Global Alerts & Partner News
      </h3>
      <ul className="space-y-3">
        {disasters.map((d) => (
          <li key={d.id} className="border-l-2 border-amber-500/30 pl-3">
            <a href={d.url} target="_blank" rel="noopener noreferrer" className="group flex items-start justify-between gap-2 text-sm text-ink hover:text-accent">
              <span>
                <strong className="font-medium">{d.title}</strong>
                <span className="mt-0.5 block text-xs text-ink-soft">{d.source} · {d.date}</span>
              </span>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-ink-faint group-hover:text-accent" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
