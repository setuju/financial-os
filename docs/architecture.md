# Arsitektur — Financial OS

## Alur Data
```
User input (bahasa alami)
   ↓
[Anti-Budget Parser] → PostgreSQL + Elastic (indeks)
   ↓
[Surplus Engine] → hitung surplus bebas etis
   ↓
[Surplus Oracle] → prediksi vs realisasi → Dompet Dampak
   ↓
[PayPal Payouts] → salurkan dana dampak (setelah approval)
   ↑
[Time-to-Value] ← Zapier/KERNEL (verifikasi bukti)
   ↑
[Bryntum Horizon] ← proyeksi tujuan jangka panjang
```

## Peran Sponsor
| Tool | Peran | Kapan Dipakai |
|---|---|---|
| **Astropods** | Orkestrasi agen utama (`astropods.yml`) | Fondasi agen |
| **AG Grid** | Tabel jurnal, dashboard surplus | Minggu 2 |
| **Elastic** | Indeks & pencarian transaksi | Minggu 2 |
| **Bryntum Gantt** | Financial Horizon (tujuan jangka panjang) | Minggu 4 |
| **KERNEL** | Fallback computer-use untuk verifikasi | Minggu 4 |
| **APIMatic** | Generate SDK PayPal dari OpenAPI | Minggu 3 |
| **Zapier** | Integrasi eksternal Time-to-Value | Minggu 5 |
| **Postman** | Dokumentasi & uji API | Minggu 5–6 |
| **Render** | Deploy demo (opsional) | Minggu 6 |
| **Channel3** | *Tidak dipakai* | — |

## Prinsip Integrasi
- **Wajib selesai**: Anti-Budget + AG Grid + Elastic + PayPal Payouts.
- **Sangat dianjurkan**: Bryntum Horizon.
- **Opsional**: KERNEL fallback & Time-to-Value.


## AI Assistant (In-App)

Financial OS includes a scoped in-app AI helper for users.

**Scope**: explains app features, input syntax, filters, exports, and troubleshooting. Refuses general coding, financial advice, off-topic, and jailbreak attempts.

**Files**:
- `backend/src/agents/assistant.prompt.ts` — system prompt (canary-protected)
- `backend/src/agents/README.md` — threat model, model config, testing
- `backend/src/routes/assistant.ts` — `POST /assistant/chat`, `GET /assistant/info`

**Model**: OpenRouter (`google/gemini-flash-1.5` default, override via `ASSISTANT_MODEL`). Requires `OPENROUTER_API_KEY` in env.

**Anti-leak**: prompt embeds a versioned canary string. Output is scanned for the canary before returning; if found, response 500s and logs alert.
