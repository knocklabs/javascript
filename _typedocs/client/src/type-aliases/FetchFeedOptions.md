[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [client/src](../README.md) / FetchFeedOptions

# Type Alias: FetchFeedOptions

> **FetchFeedOptions** = `object` & `Omit`\<[`FeedClientOptions`](../interfaces/FeedClientOptions.md), `"__experimentalCrossBrowserUpdates"`\>

Defined in: [packages/client/src/clients/feed/interfaces.ts:53](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L53)

## Type Declaration

### \_\_loadingType?

> `optional` **\_\_loadingType**: [`loading`](../enumerations/NetworkStatus.md#loading) \| [`fetchMore`](../enumerations/NetworkStatus.md#fetchmore)

### \_\_fetchSource?

> `optional` **\_\_fetchSource**: `"socket"` \| `"http"`
