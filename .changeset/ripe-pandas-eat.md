---
"@knocklabs/client": minor
---

Add `maxRetries` option to `ApiRequestConfig`

When making a request to the Knock API using `ApiClient`'s `makeRequest` function, the `maxRetries` option of `ApiRequestConfig` can now be used to set the maximum number of times the request should be retried when a retryable error occurs. To disable retries altogether, set `maxRetries` to 0.

```js
const result = await knock.client().makeRequest({
  method: "GET",
  url: "/v1/users",
  maxRetries: 0,
});
```
