import { buildAuthSchemes, type AuthSchemes } from "./auth-schemes.js";
import type { ClientOptions } from "./client-options.js";
import { ApiError, type Declared, type Undeclared } from "./core/api-error.js";
import type { ApiPromise } from "./core/api-promise.js";
import type { RequestOptions } from "./core/api-request.js";
import { buildCoreClientOptions } from "./core/client-options.js";
import { RawClient } from "./core/raw-client.js";
import type { ErrorDecoders } from "./core/response-decoder.js";
import * as host from "./core/runtime-environment.js";
import { uuid } from "./core/uuid.js";
import * as s from "./core/validation/index.js";
import { errorSchema, type Error } from "./models/error.js";
import { payoutRequestSchema, type PayoutRequest } from "./models/payout-request.js";
import { payoutResponseSchema, type PayoutResponse } from "./models/payout-response.js";
import { buildServers, type Servers } from "./servers.js";

/**
 * Minimal OpenAPI spec for Financial OS impact payouts.
 */
export class PayPalPayoutsMinimalClient {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;
  readonly #auth: AuthSchemes;

  constructor(options: ClientOptions = {}) {
    this.#rawClient = new RawClient({
      ...buildCoreClientOptions(options, "PAY_PAL_PAYOUTS_MINIMAL_CLIENT_LOG"),
      defaultHeaders: [
        { name: "User-Agent", value: "PayPalPayoutsMinimalClient/1.0.0 TypeScript", schema: s.string() },
        { name: "X-APIMatic-Lang", value: "TypeScript", schema: s.string() },
        { name: "X-APIMatic-Package-Version", value: "1.0.0", schema: s.string() },
        { name: "X-APIMatic-Gen-Version", value: "4.0.0", schema: s.string() },
        { name: "X-APIMatic-OS", value: host.operatingSystem(), schema: s.optional(s.string()) },
        { name: "X-APIMatic-Runtime", value: host.runtimeDescription(), schema: s.optional(s.string()) },
      ],
      defaultQuery: [],
      defaultPathParams: [],
    });

    this.#servers = buildServers(options);

    this.#auth = buildAuthSchemes(options, this.#servers, this.#rawClient);
  }

  /**
   * Create batch payout
   *
   * @returns Payout batch created
   *
   * @throws {@link PayPalPayoutsMinimalClient.CreateBatchPayoutError} when the API answers with an
   * error status — narrow on `err.payload.kind`
   *
   * @throws {@link PayPalPayoutsMinimalError} when no usable response was produced: a connection
   * failure, a timeout, a body that would not decode, a value that would not encode, or a
   * credential that could not be obtained
   */
  createBatchPayout(
    request: PayPalPayoutsMinimalClient.CreateBatchPayoutRequest,
    options?: RequestOptions,
  ): ApiPromise<PayoutResponse, PayPalPayoutsMinimalClient.CreateBatchPayoutError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/v1/payments/payouts"),
        auth: this.#auth.oAuth2,
        pathParams: [],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: payoutRequestSchema },
      },
      {
        success: { kind: "json", schema: payoutResponseSchema },
        errorFactory: PayPalPayoutsMinimalClient.CreateBatchPayoutError,
      },
      options,
    );
  }

  /**
   * Show payout batch details
   *
   * @returns Payout batch details
   *
   * @throws {@link PayPalPayoutsMinimalClient.GetBatchPayoutError} when the API answers with an
   * error status — narrow on `err.payload.kind`
   *
   * @throws {@link PayPalPayoutsMinimalError} when no usable response was produced: a connection
   * failure, a timeout, a body that would not decode, a value that would not encode, or a
   * credential that could not be obtained
   */
  getBatchPayout(
    request: PayPalPayoutsMinimalClient.GetBatchPayoutRequest,
    options?: RequestOptions,
  ): ApiPromise<PayoutResponse, PayPalPayoutsMinimalClient.GetBatchPayoutError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/v1/payments/payouts/{payout_batch_id}"),
        auth: this.#auth.oAuth2,
        pathParams: [{ name: "payout_batch_id", value: request.payoutBatchId, schema: s.string() }],
        query: [],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: payoutResponseSchema },
        errorFactory: PayPalPayoutsMinimalClient.GetBatchPayoutError,
      },
      options,
    );
  }
}

export namespace PayPalPayoutsMinimalClient {
  export type CreateBatchPayoutRequest = {
    body: PayoutRequest;
  };

  export class CreateBatchPayoutError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Undeclared;

    static readonly errors: ErrorDecoders<CreateBatchPayoutError> = [
      { on: 400, kind: "error", decode: { kind: "json", schema: errorSchema } },
    ];
  }

  export type GetBatchPayoutRequest = {
    payoutBatchId: string;
  };

  export class GetBatchPayoutError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Undeclared;

    static readonly errors: ErrorDecoders<GetBatchPayoutError> = [
      { on: 404, kind: "error", decode: { kind: "json", schema: errorSchema } },
    ];
  }
}
