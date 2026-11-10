/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : backend/src/paypal/sdk/src/models/payout-response.ts   │
 * │  Purpose   : Backend: payout-response                               │
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net                      │
 * │  GitHub    : https://github.com/setuju                            │
 * │  Website   : https://saturumah.net                              │
 * │  Created   : 10-11-2026                                             │
 * │  License   : MIT                                                  │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/backend
 * @license   MIT
 */

import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { batchHeaderSchema, type BatchHeader } from "./batch-header.js";
import { payoutItemDetailSchema, type PayoutItemDetail } from "./payout-item-detail.js";

export type PayoutResponse = {
  batchHeader?: BatchHeader;
  items?: PayoutItemDetail[];
};

export const payoutResponseSchema: Schema<PayoutResponse> = s.object<PayoutResponse>({
  batchHeader: s.optional(s.lazy(() => batchHeaderSchema)),
  items: s.optional(s.array(s.lazy(() => payoutItemDetailSchema))),
  _keysMap: {
    batchHeader: "batch_header",
  },
});
