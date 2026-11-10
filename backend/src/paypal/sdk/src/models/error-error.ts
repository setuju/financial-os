/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/paypal/sdk/src/models/error-error.ts
 * │  Purpose   : Backend: error-error
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

export type ErrorError = {
  name?: string;
  message?: string;
  debugId?: string;
  details?: Record<string, unknown>[];
};

export const errorErrorSchema: Schema<ErrorError> = s.object<ErrorError>({
  name: s.optional(s.string()),
  message: s.optional(s.string()),
  debugId: s.optional(s.string()),
  details: s.optional(s.array(s.record(s.string(), s.unknown()))),
  _keysMap: {
    debugId: "debug_id",
  },
});
