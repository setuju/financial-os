import { getHealth } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const health = await getHealth();
  const isOk = health?.status === 'ok';

  const wrapperClass = !health
    ? 'border-red-200 bg-red-50'
    : isOk
      ? 'border-green-200 bg-green-50'
      : 'border-yellow-200 bg-yellow-50';

  const badge = !health ? 'Unreachable' : isOk ? 'Healthy' : 'Degraded';

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold">Financial OS</h1>
        <p className="mb-8 text-gray-600">
          Personal finance with natural-language input and ethical surplus allocation.
        </p>

        <div className={`rounded-lg border p-6 ${wrapperClass}`}>
          <h2 className="mb-4 text-lg font-semibold">Backend Status: {badge}</h2>
          {health ? (
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-gray-600">PostgreSQL</dt>
              <dd>{health.pg === 'ok' ? 'ok' : 'fail'}</dd>
              <dt className="text-gray-600">Redis</dt>
              <dd>{health.redis === 'ok' ? 'ok' : 'fail'}</dd>
              <dt className="text-gray-600">Uptime</dt>
              <dd>{health.uptime}s</dd>
              <dt className="text-gray-600">Probe latency</dt>
              <dd>{health.latencyMs}ms</dd>
            </dl>
          ) : (
            <p className="text-sm text-gray-700">
              Cannot reach backend at <code>http://localhost:3001/health</code>. Make sure it is running.
            </p>
          )}
        </div>

        <p className="mt-8 text-xs text-gray-500">
          Hackathon build — Sesi 3 scaffold. Anti-Budget parser &amp; AG Grid coming next.
        </p>
      </div>
    </main>
  );
}
