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
