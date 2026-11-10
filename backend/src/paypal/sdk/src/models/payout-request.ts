/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/paypal/sdk/src/models/payout-request.ts
 * │  Purpose   : Backend: payout-request
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  GitHub    : https://github.com/setuju
 * │  Website   : https://saturumah.net
 * │  Created   : 10-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/backend
 * @license   MIT
 */

/**
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/backend
 * @license   MIT
 */

import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { payoutItemSchema, type PayoutItem } from "./payout-item.js";
import { senderBatchHeaderSchema, type SenderBatchHeader } from "./sender-batch-header.js";

export type PayoutRequest = {
  senderBatchHeader: SenderBatchHeader;
  items: PayoutItem[];
};

export const payoutRequestSchema: Schema<PayoutRequest> = s.object<PayoutRequest>({
  senderBatchHeader: senderBatchHeaderSchema,
  items: s.array(s.lazy(() => payoutItemSchema)),
  _keysMap: {
    senderBatchHeader: "sender_batch_header",
  },
});
