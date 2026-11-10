/**
 * Root discovery page — GET / returns HTML index of the API.
 * Does NOT replace any existing endpoint. JSON endpoints unchanged.
 */
import type { FastifyPluginAsync } from 'fastify';

const ENDPOINTS = [
  { method: 'GET', path: '/health', desc: 'PG + Redis + uptime' },
  { method: 'GET', path: '/goals', desc: 'Goals list' },
  { method: 'POST', path: '/goals', desc: 'Create goal' },
  { method: 'DELETE', path: '/goals/:id', desc: 'Delete goal' },
  { method: 'GET', path: '/transactions?limit&offset', desc: 'List transactions' },
  { method: 'POST', path: '/transactions', desc: 'Parse + insert (natural language)' },
  { method: 'PUT', path: '/transactions/:id', desc: 'Update (re-parse raw_text)' },
  { method: 'DELETE', path: '/transactions/:id', desc: 'Delete transaction' },
  { method: 'GET', path: '/transactions/search?q=', desc: 'Elasticsearch full-text' },
  { method: 'GET', path: '/reports/summary', desc: 'Aggregated buckets (period × type × projections)' },
  { method: 'GET', path: '/surplus/current', desc: 'Current income/expense/surplus' },
  { method: 'GET', path: '/surplus/predictions', desc: 'Oracle predictions' },
  { method: 'POST', path: '/surplus/predict', desc: 'Create prediction' },
  { method: 'PUT', path: '/surplus/predict/:id', desc: 'Update prediction' },
  { method: 'DELETE', path: '/surplus/predict/:id', desc: 'Delete prediction' },
  { method: 'POST', path: '/surplus/predictions/:id/achieve', desc: 'Mark achieved' },
  { method: 'GET', path: '/impact/receivers', desc: 'Vetted recipients' },
  { method: 'GET', path: '/impact/surplus', desc: 'Verified + in-progress + history' },
  { method: 'GET', path: '/impact/payouts', desc: 'Donation log' },
  { method: 'DELETE', path: '/impact/payouts/:id', desc: 'Soft-delete log entry' },
  { method: 'GET', path: '/impact/horizon-commitment', desc: 'Next month bills' },
  { method: 'POST', path: '/impact/payout', desc: 'PayPal Payouts (sandbox)' },
  { method: 'POST', path: '/receipts/ocr', desc: 'Gemini Vision receipt scan' },
  { method: 'POST', path: '/assistant/chat', desc: 'Scoped AI chat' },
  { method: 'GET', path: '/assistant/info', desc: 'Assistant config' },
  { method: 'POST', path: '/demo/signup', desc: 'Create session (name → password)' },
  { method: 'POST', path: '/demo/login', desc: 'Verify session' },
  { method: 'POST', path: '/demo/reset', desc: 'Reset session data' },
];

const METHOD_COLORS: Record<string, string> = {
  GET: '#10b981',
  POST: '#0070ba',
  PUT: '#d97706',
  DELETE: '#e11d48',
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c] as string));
}

function renderHtml(): string {
  const rows = ENDPOINTS.map(
    (e) => `
      <tr>
        <td><span class="method" style="background:${METHOD_COLORS[e.method]}22;color:${METHOD_COLORS[e.method]}">${e.method}</span></td>
        <td><code>${escapeHtml(e.path)}</code></td>
        <td class="desc">${escapeHtml(e.desc)}</td>
      </tr>`,
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Financial OS API</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:#fafafa;color:#18181b;padding:32px 24px;line-height:1.5}
    .wrap{max-width:960px;margin:0 auto}
    header{display:flex;align-items:center;gap:12px;margin-bottom:24px}
    .logo{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:10px;background:#0070ba;color:#fff;font-weight:600;font-size:18px}
    h1{font-size:24px;font-weight:600;letter-spacing:-0.02em}
    .sub{color:#52525b;font-size:13px;margin-top:2px}
    .status{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:#d1fae5;color:#059669;font-size:12px;font-weight:500;margin-left:auto}
    .status::before{content:'';width:6px;height:6px;border-radius:50%;background:#059669}
    .actions{display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap}
    .actions a{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:500;text-decoration:none;transition:background .15s}
    .btn-primary{background:#0070ba;color:#fff}
    .btn-primary:hover{background:#005ea6}
    .btn-secondary{background:#fff;color:#18181b;border:1px solid #d4d4d8}
    .btn-secondary:hover{background:#f4f4f5}
    .card{background:#fff;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{text-align:left;padding:10px 14px;background:#f4f4f5;font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#71717a;border-bottom:1px solid #e4e4e7}
    td{padding:10px 14px;border-bottom:1px solid #f4f4f5}
    tr:last-child td{border-bottom:none}
    tr:hover td{background:#fafafa}
    .method{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;font-family:ui-monospace,monospace;letter-spacing:0.02em}
    code{font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:12px;color:#18181b}
    .desc{color:#52525b;font-size:12px}
    footer{margin-top:24px;padding-top:16px;border-top:1px solid #e4e4e7;color:#71717a;font-size:12px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px}
    footer a{color:#0070ba;text-decoration:none}
    footer a:hover{text-decoration:underline}
    .note{margin-top:16px;padding:10px 14px;background:#fef3c7;border:1px solid #fde68a;border-radius:8px;font-size:12px;color:#92400e}
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="logo">OS</div>
      <div>
        <h1>Financial OS API</h1>
        <div class="sub">Natural-language finance · PayPal Payouts sandbox</div>
      </div>
      <div class="status" id="status">Checking…</div>
    </header>

    <div class="actions">
      <a href="https://financial.saturumah.net" class="btn-primary">Open app →</a>
      <a href="/health" class="btn-secondary">/health</a>
      <a href="/assistant/info" class="btn-secondary">/assistant/info</a>
      <a href="https://github.com/setuju/financial-os" class="btn-secondary">GitHub</a>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr><th style="width:80px">Method</th><th style="width:35%">Path</th><th>Description</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div class="note">
      <strong>Sandbox only.</strong> PayPal runs against Sandbox — no real money moves.
      Auth: most endpoints require <code>X-Session-Id</code> header (from <code>POST /demo/signup</code> or <code>/demo/login</code>).
    </div>

    <footer>
      <div>Built for <a href="https://paypalaihackathon.devpost.com/">PayPal AI Hackathon 2026</a> · MIT License</div>
      <div><a href="https://saturumah.net">saturumah.net</a></div>
    </footer>
  </div>

  <script>
    fetch('/health')
      .then(r => r.json())
      .then(d => {
        const el = document.getElementById('status');
        el.textContent = d.status === 'ok' ? 'Healthy' : 'Degraded';
        if (d.status !== 'ok') {
          el.style.background = '#fef3c7';
          el.style.color = '#d97706';
        }
      })
      .catch(() => {
        const el = document.getElementById('status');
        el.textContent = 'Offline';
        el.style.background = '#ffe4e6';
        el.style.color = '#e11d48';
      });
  </script>
</body>
</html>`;
}

const rootRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (req, reply) => {
    // Allow JSON consumers via Accept header
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return reply.send({
        name: 'Financial OS API',
        version: '1.0.0',
        status: 'ok',
        docs_web: '/',
        health: '/health',
        frontend: 'https://financial.saturumah.net',
        endpoints: ENDPOINTS.map((e) => ({ method: e.method, path: e.path, desc: e.desc })),
        note: 'Sandbox only — PayPal runs against sandbox.',
      });
    }
    return reply
      .code(200)
      .header('content-type', 'text/html; charset=utf-8')
      .header('cache-control', 'public, max-age=300')
      .send(renderHtml());
  });
};

export default rootRoutes;
