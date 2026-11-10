/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : backend/src/paypal/sdk/src/index.ts                    │
 * │  Purpose   : Backend: index                                         │
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

export { PayPalPayoutsMinimalClient } from "./client.js";
export type { ClientOptions } from "./client-options.js";

export type { OAuth2ClientCredentials } from "./core/auth/credentials.js";
export type {
  OAuth2TokenStrategy,
  OAuthToken,
  OAuth2CredentialPlacement,
} from "./core/auth/oauth2-strategies.js";

export { ServerEnvironment } from "./servers.js";

export { amountSchema, type Amount } from "./models/amount.js";
export { batchHeaderSchema, type BatchHeader } from "./models/batch-header.js";
export { errorSchema, type Error } from "./models/error.js";
export { errorErrorSchema, type ErrorError } from "./models/error-error.js";
export { payoutItemSchema, type PayoutItem } from "./models/payout-item.js";
export { payoutItemDetailSchema, type PayoutItemDetail } from "./models/payout-item-detail.js";
export { payoutRequestSchema, type PayoutRequest } from "./models/payout-request.js";
export { payoutResponseSchema, type PayoutResponse } from "./models/payout-response.js";
export { RecipientType, recipientTypeSchema } from "./models/recipient-type.js";
export { senderBatchHeaderSchema, type SenderBatchHeader } from "./models/sender-batch-header.js";

export {
  CoreError as PayPalPayoutsMinimalError,
  ResponseError,
  DecodeError,
  EncodeError,
  ConnectionError,
  TimeoutError,
  AuthError,
  PaginationError,
  ConfigurationError,
} from "./core/errors.js";
export { ApiError } from "./core/api-error.js";
export { SchemaError } from "./core/validation/schema-error.js";
export {
  defaultLoggingOptions,
  type LoggingOptions,
  type RequestLoggingOptions,
  type Logger,
  type LogDetails,
  type HttpRequestDetails,
  type RequestHeadersDetails,
  type RequestBodyDetails,
  type HttpResponseDetails,
  type ResponseHeadersDetails,
  type HttpRetryingDetails,
  type HttpFailedDetails,
  type LogLevel,
} from "./core/logging.js";
export type { ApiPromise, ApiResult } from "./core/api-promise.js";
export type { Pageable, PageableApiResult } from "./core/pagination/pageable.js";
export type { HttpMethod, RequestOptions } from "./core/api-request.js";
export type { RetryOptions, RequestRetryOptions, RetryAttempt, RetryReason } from "./core/retry.js";
export type { BinaryContent, BinaryData, BinaryErrorContent, FileData, FileInput } from "./core/binary.js";
export type { ErrorKind } from "./core/errors.js";
export type { Declared, Undeclared } from "./core/api-error.js";
export type { Schema, EnumSchema, Encoded } from "./core/validation/schema.js";
