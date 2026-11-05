# Reference

> Source: [PayPalPayoutsMinimalClient](src/client.ts)

<details>
<summary><code>createBatchPayout(request: PayPalPayoutsMinimalClient.CreateBatchPayoutRequest, options?: RequestOptions): ApiPromise&lt;PayoutResponse, PayPalPayoutsMinimalClient.CreateBatchPayoutError&gt;</code></summary>

<dl>
<dd>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.createBatchPayout({
    body: {
      senderBatchHeader: { senderBatchId: "some example string", emailSubject: "some example string" },
      items: [
        {
          recipientType: RecipientType.Email,
          amount: { value: "some example string", currency: "some example string" },
          receiver: "some example string",
          note: "some example string",
          senderItemId: "some example string",
        },
      ],
    },
  });
  // TODO: Handle 'response' of type PayoutResponse
} catch (err) {
  // TODO: Handle 'err' of type PayPalPayoutsMinimalClient.CreateBatchPayoutError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.createBatchPayout({
  body: {
    senderBatchHeader: { senderBatchId: "some example string", emailSubject: "some example string" },
    items: [
      {
        recipientType: RecipientType.Email,
        amount: { value: "some example string", currency: "some example string" },
        receiver: "some example string",
        note: "some example string",
        senderItemId: "some example string",
      },
    ],
  },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type PayoutResponse
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[PayoutRequest](src/models/payout-request.ts)</code> | - |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.createBatchPayout(request)`

- **OnSuccess**: <code>[PayoutResponse](src/models/payout-response.ts)</code>
- **OnError**: throws <code>[PayPalPayoutsMinimalClient.CreateBatchPayoutError](src/client.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.createBatchPayout(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;PayoutResponse, PayPalPayoutsMinimalClient.CreateBatchPayoutError&gt;</code>, with `result.value` of type <code>[PayoutResponse](src/models/payout-response.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[PayPalPayoutsMinimalError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>getBatchPayout(request: PayPalPayoutsMinimalClient.GetBatchPayoutRequest, options?: RequestOptions): ApiPromise&lt;PayoutResponse, PayPalPayoutsMinimalClient.GetBatchPayoutError&gt;</code></summary>

<dl>
<dd>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.getBatchPayout({ payoutBatchId: "some example string" });
  // TODO: Handle 'response' of type PayoutResponse
} catch (err) {
  // TODO: Handle 'err' of type PayPalPayoutsMinimalClient.GetBatchPayoutError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.getBatchPayout({ payoutBatchId: "some example string" }).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type PayoutResponse
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>payoutBatchId</code> | <code>string</code> | - |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.getBatchPayout(request)`

- **OnSuccess**: <code>[PayoutResponse](src/models/payout-response.ts)</code>
- **OnError**: throws <code>[PayPalPayoutsMinimalClient.GetBatchPayoutError](src/client.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.getBatchPayout(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;PayoutResponse, PayPalPayoutsMinimalClient.GetBatchPayoutError&gt;</code>, with `result.value` of type <code>[PayoutResponse](src/models/payout-response.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[PayPalPayoutsMinimalError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

