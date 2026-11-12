#!/usr/bin/env bash
set -euo pipefail
API="${1:-https://financial-api.saturumah.net}"

echo "[1] Security Headers"
curl -s -I "$API/health" | grep -iE "x-frame|x-content|referrer|permissions|strict-transport" || true

echo "[2] Auth Bypass (Expect 401)"
curl -s -o /dev/null -w "Transactions without session: %{http_code}\n" "$API/transactions"

echo "[3] SQL Injection (Expect 200 or 403, no crash)"
curl -s -o /dev/null -w "SQLi payload: %{http_code}\n" "$API/reports/search?q=%27%20OR%201=1%20--"

echo "[4] Payload Size (Expect 413/422/400)"
head -c 2000000 /dev/zero | base64 | curl -s -o /dev/null -w "OCR 2MB: %{http_code}\n" -X POST "$API/receipts/ocr" -H "Content-Type: application/json" --data-binary @-

echo "[5] Rate Limit (Expect 200s or 429)"
for i in {1..5}; do curl -s -o /dev/null -w "%{http_code} " "$API/health"; done; echo
