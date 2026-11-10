/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : backend/src/paypal/sdk/src/models/sender-batch-header.ts│
 * │  Purpose   : Backend: sender-batch-header                           │
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

export type SenderBatchHeader = {
  senderBatchId: string;
  emailSubject: string;
  emailMessage?: string;
};

export const senderBatchHeaderSchema: Schema<SenderBatchHeader> = s.object<SenderBatchHeader>({
  senderBatchId: s.string(),
  emailSubject: s.string(),
  emailMessage: s.optional(s.string()),
  _keysMap: {
    senderBatchId: "sender_batch_id",
    emailSubject: "email_subject",
    emailMessage: "email_message",
  },
});
