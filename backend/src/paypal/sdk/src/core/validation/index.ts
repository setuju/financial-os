/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/paypal/sdk/src/core/validation/index.ts
 * │  Purpose   : Backend: index
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

export {
  array,
  boolean,
  literal,
  nullable,
  optional,
  record,
  string,
  union,
  unknown,
  float64,
  gte,
  int,
  lte,
} from "zod/v4-mini";
export {
  lazy,
  fallback,
  callback,
  optionalNullable,
  defaulted,
  dateTime,
  rfc1123DateTime,
  unixSecondsDateTime,
  dateOnly,
  bytes,
  base64UrlBytes,
  base32Bytes,
  base32HexBytes,
  base16Bytes,
} from "./entries.js";
export { object, discriminatedUnion, enumOf, of } from "./schema.js";
