/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : backend/src/paypal/sdk/src/models/recipient-type.ts    │
 * │  Purpose   : Backend: recipient-type                                │
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
import type { EnumSchema } from "../core/validation/schema.js";

export const RecipientType = {
  Email: "EMAIL",
  Phone: "PHONE",
  PaypalId: "PAYPAL_ID",
} as const;
export type RecipientType = (typeof RecipientType)[keyof typeof RecipientType] | (string & {});

export const recipientTypeSchema: EnumSchema<RecipientType> = s.enumOf<RecipientType>(RecipientType);
