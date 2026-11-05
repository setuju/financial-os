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
