/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/paypal/sdk/src/core/params.ts
 * │  Purpose   : Backend: params
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

import type { ParamPair, StyledParam } from "./param-value.js";
import { flattenParams } from "./param-value.js";

export function percentEncode(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function formEncode(value: string): string {
  return percentEncode(value).replace(/%20/g, "+");
}

export function queryString(layers: ReadonlyArray<readonly StyledParam[]>): string {
  return serializePairs(layers.flatMap(flattenParams), percentEncode);
}

export function formString(fields?: ReadonlyArray<StyledParam>): string {
  return serializePairs(flattenParams(fields), formEncode);
}

export function serializePairs(pairs: ReadonlyArray<ParamPair>, encode: (value: string) => string): string {
  return pairs.map(([key, value]) => `${encode(key)}=${encode(value)}`).join("&");
}
