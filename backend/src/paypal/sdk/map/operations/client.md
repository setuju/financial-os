<!--
┌──────────────────────────────────────────────────────────────────────┐
│  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
│  ──────────────────────────────────────────────────────────────────   │
│  File      : backend/src/paypal/sdk/map/operations/client.md        │
│  Purpose   : Client                                                 │
│  Author    : Jack — Jack[at]SatuRumah[dot]Net                      │
│  GitHub    : https://github.com/setuju                            │
│  Website   : https://saturumah.net                              │
│  Created   : 10-11-2026                                             │
│  License   : MIT                                                  │
└──────────────────────────────────────────────────────────────────────┘
-->

<!-- Generated file — do not edit; regenerated with the SDK. -->

# PayPalPayoutsMinimalClient — ungrouped operations

Accessor: `client` (the client itself) · Source: `src/client.ts` · 2 operations · Request and error types: namespace `PayPalPayoutsMinimalClient`

Operations the spec leaves untagged are methods on the client rather than on a resource, so there is no accessor property to go through. The request type still lives in a namespace merged onto the exported class, so you write `PayPalPayoutsMinimalClient.CreateBatchPayoutRequest`.

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `pay-pal-payouts-minimal`; the `Source` path is where to **read** the shape, never what to import. `ApiError`, the runtime error family and the file vocabulary are excluded — see sdk-map.md.

### createBatchPayout

- **Signature**: `createBatchPayout(request: PayPalPayoutsMinimalClient.CreateBatchPayoutRequest, options?: RequestOptions): ApiPromise<PayoutResponse, PayPalPayoutsMinimalClient.CreateBatchPayoutError>`
- **Wire**: `POST /v1/payments/payouts`
- **Auth**: `oAuth2`
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `PayoutResponse`
- **Error**: `PayPalPayoutsMinimalError` with `kind: "api"`, an instance of `PayPalPayoutsMinimalClient.CreateBatchPayoutError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [400] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `PayPalPayoutsMinimalClient.CreateBatchPayoutRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `body` | `body` | `PayoutRequest` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `PayoutRequest` | `payoutRequestSchema` | `src/models/payout-request.ts` |
| `PayoutResponse` | `payoutResponseSchema` | `src/models/payout-response.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

### getBatchPayout

- **Signature**: `getBatchPayout(request: PayPalPayoutsMinimalClient.GetBatchPayoutRequest, options?: RequestOptions): ApiPromise<PayoutResponse, PayPalPayoutsMinimalClient.GetBatchPayoutError>`
- **Wire**: `GET /v1/payments/payouts/{payout_batch_id}`
- **Auth**: `oAuth2`
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `PayoutResponse`
- **Error**: `PayPalPayoutsMinimalError` with `kind: "api"`, an instance of `PayPalPayoutsMinimalClient.GetBatchPayoutError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [404] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `PayPalPayoutsMinimalClient.GetBatchPayoutRequest` (1):

| Field | Channel | Wire | Type | Req |
| --- | --- | --- | --- | --- |
| `payoutBatchId` | `path` | `payout_batch_id` | `string` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `PayoutResponse` | `payoutResponseSchema` | `src/models/payout-response.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

