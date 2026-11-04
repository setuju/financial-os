export type HealthResponse = {
  status: 'ok' | 'degraded';
  pg: 'ok' | 'fail';
  redis: 'ok' | 'fail';
  uptime: number;
  latencyMs: number;
};

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function getHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as HealthResponse;
  } catch {
    return null;
  }
}
