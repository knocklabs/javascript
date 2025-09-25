[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [client/src](../README.md) / FeedStoreState

# Interface: FeedStoreState

Defined in: [packages/client/src/clients/feed/types.ts:13](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/types.ts#L13)

## Properties

### items

> **items**: [`FeedItem`](FeedItem.md)\<`GenericData`\>[]

Defined in: [packages/client/src/clients/feed/types.ts:14](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/types.ts#L14)

***

### pageInfo

> **pageInfo**: `PageInfo`

Defined in: [packages/client/src/clients/feed/types.ts:15](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/types.ts#L15)

***

### metadata

> **metadata**: [`FeedMetadata`](FeedMetadata.md)

Defined in: [packages/client/src/clients/feed/types.ts:16](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/types.ts#L16)

***

### loading

> **loading**: `boolean`

Defined in: [packages/client/src/clients/feed/types.ts:17](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/types.ts#L17)

***

### networkStatus

> **networkStatus**: [`NetworkStatus`](../enumerations/NetworkStatus.md)

Defined in: [packages/client/src/clients/feed/types.ts:18](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/types.ts#L18)

***

### setResult()

> **setResult**: (`response`, `opts?`) => `void`

Defined in: [packages/client/src/clients/feed/types.ts:19](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/types.ts#L19)

#### Parameters

##### response

[`FeedResponse`](FeedResponse.md)

##### opts?

[`StoreFeedResultOptions`](../type-aliases/StoreFeedResultOptions.md)

#### Returns

`void`

***

### setMetadata()

> **setMetadata**: (`metadata`) => `void`

Defined in: [packages/client/src/clients/feed/types.ts:20](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/types.ts#L20)

#### Parameters

##### metadata

[`FeedMetadata`](FeedMetadata.md)

#### Returns

`void`

***

### setNetworkStatus()

> **setNetworkStatus**: (`networkStatus`) => `void`

Defined in: [packages/client/src/clients/feed/types.ts:21](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/types.ts#L21)

#### Parameters

##### networkStatus

[`NetworkStatus`](../enumerations/NetworkStatus.md)

#### Returns

`void`

***

### setItemAttrs()

> **setItemAttrs**: (`itemIds`, `attrs`) => `void`

Defined in: [packages/client/src/clients/feed/types.ts:22](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/types.ts#L22)

#### Parameters

##### itemIds

`string`[]

##### attrs

`object`

#### Returns

`void`

***

### resetStore()

> **resetStore**: (`metadata?`) => `void`

Defined in: [packages/client/src/clients/feed/types.ts:23](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/types.ts#L23)

#### Parameters

##### metadata?

[`FeedMetadata`](FeedMetadata.md)

#### Returns

`void`
