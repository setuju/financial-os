/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/paypal/sdk/src/models/payout-item.ts
 * │  Purpose   : Backend: payout-item
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
import { recipientTypeSchema, type RecipientType } from "./recipient-type.js";

export type PayoutItem = {
  recipientType: RecipientType;
  amount: Amount;
  receiver: string;
  note: string;
  senderItemId: string;
};

export const payoutItemSchema: Schema<PayoutItem> = s.object<PayoutItem>({
  recipientType: recipientTypeSchema,
  amount: amountSchema,
  receiver: s.string(),
  note: s.string(),
  senderItemId: s.string(),
  _keysMap: {
    recipientType: "recipient_type",
    senderItemId: "sender_item_id",
  },
});
