/**
 * Root discovery page — GET / returns branded status + tech stack.
 * No endpoint listing (security).
 * JSON fallback only for Accept: application/json (brand info only).
 */
import type { FastifyPluginAsync } from 'fastify';

interface Tech {
  name: string;
  slug: string | null; // SimpleIcons slug, null → fallback letter badge
  color: string;       // brand color
  href: string;
  category: 'app' | 'api' | 'data' | 'ai' | 'pay' | 'host';
}

const TECHS: Tech[] = [
  // App
  { name: 'Next.js 14', slug: 'nextdotjs', color: '#000000', href: 'https://nextjs.org', category: 'app' },
  { name: 'TypeScript', slug: 'typescript', color: '#3178c6', href: 'https://www.typescriptlang.org', category: 'app' },
  { name: 'Tailwind CSS', slug: 'tailwindcss', color: '#06b6d4', href: 'https://tailwindcss.com', category: 'app' },
  { name: 'Bryntum Gantt 8', slug: null, color: '#7c3aed', href: 'https://bryntum.com', category: 'app' },
  // API
  { name: 'Fastify 4', slug: 'fastify', color: '#000000', href: 'https://fastify.dev', category: 'api' },
  { name: 'Node.js 20', slug: 'nodedotjs', color: '#5fa04e', href: 'https://nodejs.org', category: 'api' },
  // Data
  { name: 'PostgreSQL', slug: 'postgresql', color: '#4169e1', href: 'https://neon.tech', category: 'data' },
  { name: 'Redis', slug: 'redis', color: '#dc382d', href: 'https://upstash.com', category: 'data' },
  { name: 'Elastic Cloud', slug: 'elasticsearch', color: '#005571', href: 'https://elastic.co', category: 'data' },
  // AI
  { name: 'Google Gemini', slug: 'googlegemini', color: '#8e75b2', href: 'https://deepmind.google/technologies/gemini', category: 'ai' },
  { name: 'OpenRouter', slug: null, color: '#111827', href: 'https://openrouter.ai', category: 'ai' },
  // Payments
  { name: 'PayPal Payouts', slug: 'paypal', color: '#003087', href: 'https://developer.paypal.com/docs/payouts', category: 'pay' },
  { name: 'APIMatic', slug: null, color: '#4f46e5', href: 'https://apimatic.io', category: 'pay' },
  // Host
  { name: 'Vercel', slug: 'vercel', color: '#000000', href: 'https://vercel.com', category: 'host' },
  { name: 'Render', slug: null, color: '#46e3b7', href: 'https://render.com', category: 'host' },
];

const CATEGORY_LABEL: Record<Tech['category'], string> = {
  app: 'Application',
  api: 'API',
  data: 'Data',
  ai: 'AI',
  pay: 'Payments',
  host: 'Hosting',
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c] as string));
}

function renderTechCard(t: Tech): string {
  const icon = t.slug
    ? `<img src="https://cdn.simpleicons.org/${t.slug}/${t.color.replace('#', '')}" alt="" loading="lazy" width="20" height="20">`
    : `<span class="fallback" style="background:${t.color}">${escapeHtml(t.name.charAt(0))}</span>`;
  return `
    <a href="${t.href}" target="_blank" rel="noopener noreferrer" class="tech" title="${escapeHtml(t.name)}">
      ${icon}
      <span>${escapeHtml(t.name)}</span>
    </a>`;
}

function renderHtml(): string {
  const grouped: Record<string, string> = {};
  for (const cat of ['app', 'api', 'data', 'ai', 'pay', 'host']) {
    const items = TECHS.filter((t) => t.category === cat).map(renderTechCard).join('');
    grouped[cat] = `
      <div class="tech-group">
        <div class="tech-label">${CATEGORY_LABEL[cat as Tech['category']]}</div>
        <div class="tech-grid">${items}</div>
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Financial OS API — Status</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:#fafafa;color:#18181b;padding:40px 24px;line-height:1.5;min-height:100vh}
    .wrap{max-width:880px;margin:0 auto}

    /* Header */
    header{text-align:center;margin-bottom:32px}
    .logo{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:14px;background:#0070ba;color:#fff;font-weight:700;font-size:22px;box-shadow:0 2px 8px rgba(0,112,186,0.2)}
    h1{font-size:28px;font-weight:600;letter-spacing:-0.02em;margin-top:14px}
    .sub{color:#52525b;font-size:14px;margin-top:4px}
    .version{display:inline-block;margin-left:8px;padding:2px 8px;border-radius:6px;background:#f4f4f5;color:#71717a;font-size:11px;font-family:ui-monospace,monospace;vertical-align:middle}

    /* Status card */
    .status-card{background:#fff;border:1px solid #e4e4e7;border-radius:16px;padding:28px;margin-bottom:20px;text-align:center}
    .online-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px}
    .online-badge.ok{background:#d1fae5;color:#059669}
    .online-badge.degraded{background:#fef3c7;color:#d97706}
    .online-badge.offline{background:#ffe4e6;color:#e11d48}
    .online-badge.loading{background:#f4f4f5;color:#71717a}
    .online-badge::before{content:'';width:8px;height:8px;border-radius:50%;background:currentColor;animation:pulse 2s infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    .metrics{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:20px;padding-top:20px;border-top:1px solid #f4f4f5}
    .metric{text-align:center}
    .metric-label{font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#a1a1aa;margin-bottom:4px}
    .metric-value{font-size:15px;font-weight:600;font-family:ui-monospace,monospace;color:#18181b}
    .metric-value .ok{color:#059669}
    .metric-value .fail{color:#e11d48}

    /* Actions */
    .actions{display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap;justify-content:center}
    .actions a{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:10px;font-size:14px;font-weight:500;text-decoration:none;transition:transform .15s,background .15s}
    .btn-primary{background:#0070ba;color:#fff}
    .btn-primary:hover{background:#005ea6;transform:translateY(-1px)}
    .btn-secondary{background:#fff;color:#18181b;border:1px solid #d4d4d8}
    .btn-secondary:hover{background:#f4f4f5;transform:translateY(-1px)}
    .btn-secondary svg{width:16px;height:16px}

    /* Tech stack */
    .tech-section{background:#fff;border:1px solid #e4e4e7;border-radius:16px;padding:24px;margin-bottom:20px}
    .tech-section h2{font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#71717a;margin-bottom:16px}
    .tech-group{margin-bottom:16px}
    .tech-group:last-child{margin-bottom:0}
    .tech-label{font-size:11px;font-weight:500;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;padding-left:2px}
    .tech-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}
    .tech{display:flex;align-items:center;gap:8px;padding:8px 10px;background:#fafafa;border:1px solid #f4f4f5;border-radius:8px;text-decoration:none;color:#18181b;font-size:12px;font-weight:500;transition:all .15s}
    .tech:hover{background:#fff;border-color:#d4d4d8;transform:translateY(-1px)}
    .tech img{flex-shrink:0}
    .tech span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .tech .fallback{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:4px;color:#fff;font-size:11px;font-weight:700;flex-shrink:0}

    /* Footer */
    footer{text-align:center;padding-top:20px;color:#a1a1aa;font-size:12px;line-height:1.8}
    footer a{color:#0070ba;text-decoration:none;font-weight:500}
    footer a:hover{text-decoration:underline}
    footer .sandbox{display:inline-block;padding:2px 8px;border-radius:6px;background:#fef3c7;color:#92400e;font-size:11px;margin-top:6px}

    @media (max-width:640px){
      body{padding:24px 16px}
      .logo{width:44px;height:44px;font-size:18px}
      h1{font-size:22px}
      .metrics{grid-template-columns:1fr;gap:12px}
      .tech-grid{grid-template-columns:repeat(2,1fr)}
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="logo">OS</div>
      <h1>Financial OS API <span class="version">v1.0</span></h1>
      <p class="sub">Natural-language finance &middot; PayPal Payouts sandbox</p>
    </header>

    <div class="status-card">
      <div class="online-badge loading" id="badge">Checking…</div>
      <div class="metrics">
        <div class="metric">
          <div class="metric-label">PostgreSQL</div>
          <div class="metric-value" id="pg">—</div>
        </div>
        <div class="metric">
          <div class="metric-label">Redis</div>
          <div class="metric-value" id="redis">—</div>
        </div>
        <div class="metric">
          <div class="metric-label">Uptime</div>
          <div class="metric-value" id="uptime">—</div>
        </div>
        <div class="metric">
          <div class="metric-label">Latency</div>
          <div class="metric-value" id="latency">—</div>
        </div>
      </div>
    </div>

    <div class="actions">
      <a href="https://financial.saturumah.net" class="btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Open app
      </a>
      <a href="https://paypalaihackathon.devpost.com" class="btn-secondary" target="_blank" rel="noopener noreferrer">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
        PayPal AI Hackathon 2026
      </a>
    </div>

    <div class="tech-section">
      <h2>Technology stack</h2>
      ${grouped.app}
      ${grouped.api}
      ${grouped.data}
      ${grouped.ai}
      ${grouped.pay}
      ${grouped.host}
    </div>

    <footer>
      <div>Built by <a href="https://saturumah.net" target="_blank" rel="noopener noreferrer">Jack @ SatuRumah</a> &middot; MIT License</div>
      <div class="sandbox">Sandbox only &middot; PayPal runs against sandbox &middot; no real money moves</div>
    </footer>
  </div>

  <script>
    function fmtUptime(s) {
      if (!Number.isFinite(s)) return '—';
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = Math.floor(s % 60);
      if (h > 0) return h + 'h ' + m + 'm';
      if (m > 0) return m + 'm ' + sec + 's';
      return sec + 's';
    }

    async function refresh() {
      const badge = document.getElementById('badge');
      const pg = document.getElementById('pg');
      const redis = document.getElementById('redis');
      const uptime = document.getElementById('uptime');
      const latency = document.getElementById('latency');
      try {
        const t0 = performance.now();
        const r = await fetch('/health', { cache: 'no-store' });
        const dt = Math.round(performance.now() - t0);
        const d = await r.json();
        const isOk = d.status === 'ok';
        badge.className = 'online-badge ' + (isOk ? 'ok' : 'degraded');
        badge.textContent = isOk ? 'Online' : 'Degraded';
        pg.innerHTML = d.pg === 'ok' ? '<span class="ok">✓ ok</span>' : '<span class="fail">✗ fail</span>';
        redis.innerHTML = d.redis === 'ok' ? '<span class="ok">✓ ok</span>' : '<span class="fail">✗ fail</span>';
        uptime.textContent = fmtUptime(d.uptime);
        latency.textContent = (d.latencyMs ?? dt) + ' ms';
      } catch {
        badge.className = 'online-badge offline';
        badge.textContent = 'Offline';
        pg.innerHTML = '<span class="fail">✗</span>';
        redis.innerHTML = '<span class="fail">✗</span>';
        uptime.textContent = '—';
        latency.textContent = '—';
      }
    }

    refresh();
    setInterval(refresh, 30000);
  </script>
</body>
</html>`;
}

const rootRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (req, reply) => {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return reply.send({
        name: 'Financial OS API',
        version: '1.0.0',
        status: 'ok',
        health: '/health',
        frontend: 'https://financial.saturumah.net',
        hackathon: 'https://paypalaihackathon.devpost.com',
        note: 'Sandbox only — PayPal runs against sandbox. No real money moves.',
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
