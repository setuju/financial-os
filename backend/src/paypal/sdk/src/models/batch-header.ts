import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { senderBatchHeaderSchema, type SenderBatchHeader } from "./sender-batch-header.js";

export type BatchHeader = {
  payoutBatchId?: string;
  batchStatus?: string;
  senderBatchHeader?: SenderBatchHeader;
};

export const batchHeaderSchema: Schema<BatchHeader> = s.object<BatchHeader>({
  payoutBatchId: s.optional(s.string()),
  batchStatus: s.optional(s.string()),
  senderBatchHeader: s.optional(s.lazy(() => senderBatchHeaderSchema)),
  _keysMap: {
    payoutBatchId: "payout_batch_id",
    batchStatus: "batch_status",
    senderBatchHeader: "sender_batch_header",
  },
});
