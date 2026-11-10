/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/paypal/sdk/src/models/payout-item-detail.ts
 * │  Purpose   : Backend: payout-item-detail
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
import { amountSchema, type Amount } from "./amount.js";

export type PayoutItemDetail = {
  payoutItemId?: string;
  transactionStatus?: string;
  payoutItemFee?: Amount;
  payoutBatchId?: string;
};

export const payoutItemDetailSchema: Schema<PayoutItemDetail> = s.object<PayoutItemDetail>({
  payoutItemId: s.optional(s.string()),
  transactionStatus: s.optional(s.string()),
  payoutItemFee: s.optional(s.lazy(() => amountSchema)),
  payoutBatchId: s.optional(s.string()),
  _keysMap: {
    payoutItemId: "payout_item_id",
    transactionStatus: "transaction_status",
    payoutItemFee: "payout_item_fee",
    payoutBatchId: "payout_batch_id",
  },
});
