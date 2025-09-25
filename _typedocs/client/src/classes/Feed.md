[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [client/src](../README.md) / Feed

# Class: Feed

Defined in: [packages/client/src/clients/feed/feed.ts:47](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L47)

## Constructors

### Constructor

> **new Feed**(`knock`, `feedId`, `options`, `socketManager`): `Feed`

Defined in: [packages/client/src/clients/feed/feed.ts:63](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L63)

#### Parameters

##### knock

[`default`](default.md)

##### feedId

`string`

##### options

[`FeedClientOptions`](../interfaces/FeedClientOptions.md)

##### socketManager

`undefined` | `FeedSocketManager`

#### Returns

`Feed`

## Properties

### defaultOptions

> `readonly` **defaultOptions**: [`FeedClientOptions`](../interfaces/FeedClientOptions.md)

Defined in: [packages/client/src/clients/feed/feed.ts:48](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L48)

***

### referenceId

> `readonly` **referenceId**: `string`

Defined in: [packages/client/src/clients/feed/feed.ts:49](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L49)

***

### unsubscribeFromSocketEvents

> **unsubscribeFromSocketEvents**: `undefined` \| () => `void` = `undefined`

Defined in: [packages/client/src/clients/feed/feed.ts:50](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L50)

***

### store

> **store**: `FeedStore`

Defined in: [packages/client/src/clients/feed/feed.ts:61](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L61)

***

### knock

> `readonly` **knock**: [`default`](default.md)

Defined in: [packages/client/src/clients/feed/feed.ts:64](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L64)

***

### feedId

> `readonly` **feedId**: `string`

Defined in: [packages/client/src/clients/feed/feed.ts:65](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L65)

## Accessors

### socketChannelTopic

#### Get Signature

> **get** **socketChannelTopic**(): `string`

Defined in: [packages/client/src/clients/feed/feed.ts:626](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L626)

##### Returns

`string`

## Methods

### reinitialize()

> **reinitialize**(`socketManager?`): `void`

Defined in: [packages/client/src/clients/feed/feed.ts:97](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L97)

Used to reinitialize a current feed instance, which is useful when reauthenticating users

#### Parameters

##### socketManager?

`FeedSocketManager`

#### Returns

`void`

***

### teardown()

> **teardown**(): `void`

Defined in: [packages/client/src/clients/feed/feed.ts:114](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L114)

Cleans up a feed instance by destroying the store and disconnecting
an open socket connection.

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: [packages/client/src/clients/feed/feed.ts:132](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L132)

Tears down an instance and removes it entirely from the feed manager

#### Returns

`void`

***

### listenForUpdates()

> **listenForUpdates**(): `void`

Defined in: [packages/client/src/clients/feed/feed.ts:143](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L143)

#### Returns

`void`

***

### on()

> **on**(`eventName`, `callback`): `void`

Defined in: [packages/client/src/clients/feed/feed.ts:160](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L160)

#### Parameters

##### eventName

[`BindableFeedEvent`](../type-aliases/BindableFeedEvent.md)

##### callback

[`FeedRealTimeCallback`](../type-aliases/FeedRealTimeCallback.md) | [`FeedEventCallback`](../type-aliases/FeedEventCallback.md)

#### Returns

`void`

***

### off()

> **off**(`eventName`, `callback`): `void`

Defined in: [packages/client/src/clients/feed/feed.ts:167](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L167)

#### Parameters

##### eventName

[`BindableFeedEvent`](../type-aliases/BindableFeedEvent.md)

##### callback

[`FeedRealTimeCallback`](../type-aliases/FeedRealTimeCallback.md) | [`FeedEventCallback`](../type-aliases/FeedEventCallback.md)

#### Returns

`void`

***

### getState()

> **getState**(): [`FeedStoreState`](../interfaces/FeedStoreState.md)

Defined in: [packages/client/src/clients/feed/feed.ts:174](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L174)

#### Returns

[`FeedStoreState`](../interfaces/FeedStoreState.md)

***

### markAsSeen()

> **markAsSeen**(`itemOrItems`): `Promise`\<[`Message`](../interfaces/Message.md)\<`GenericData`\>[]\>

Defined in: [packages/client/src/clients/feed/feed.ts:178](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L178)

#### Parameters

##### itemOrItems

[`FeedItemOrItems`](../type-aliases/FeedItemOrItems.md)

#### Returns

`Promise`\<[`Message`](../interfaces/Message.md)\<`GenericData`\>[]\>

***

### markAllAsSeen()

> **markAllAsSeen**(): `Promise`\<[`BulkOperation`](../interfaces/BulkOperation.md)\>

Defined in: [packages/client/src/clients/feed/feed.ts:190](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L190)

#### Returns

`Promise`\<[`BulkOperation`](../interfaces/BulkOperation.md)\>

***

### markAsUnseen()

> **markAsUnseen**(`itemOrItems`): `Promise`\<[`Message`](../interfaces/Message.md)\<`GenericData`\>[]\>

Defined in: [packages/client/src/clients/feed/feed.ts:232](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L232)

#### Parameters

##### itemOrItems

[`FeedItemOrItems`](../type-aliases/FeedItemOrItems.md)

#### Returns

`Promise`\<[`Message`](../interfaces/Message.md)\<`GenericData`\>[]\>

***

### markAsRead()

> **markAsRead**(`itemOrItems`): `Promise`\<[`Message`](../interfaces/Message.md)\<`GenericData`\>[]\>

Defined in: [packages/client/src/clients/feed/feed.ts:243](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L243)

#### Parameters

##### itemOrItems

[`FeedItemOrItems`](../type-aliases/FeedItemOrItems.md)

#### Returns

`Promise`\<[`Message`](../interfaces/Message.md)\<`GenericData`\>[]\>

***

### markAllAsRead()

> **markAllAsRead**(): `Promise`\<[`BulkOperation`](../interfaces/BulkOperation.md)\>

Defined in: [packages/client/src/clients/feed/feed.ts:255](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L255)

#### Returns

`Promise`\<[`BulkOperation`](../interfaces/BulkOperation.md)\>

***

### markAsUnread()

> **markAsUnread**(`itemOrItems`): `Promise`\<[`Message`](../interfaces/Message.md)\<`GenericData`\>[]\>

Defined in: [packages/client/src/clients/feed/feed.ts:297](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L297)

#### Parameters

##### itemOrItems

[`FeedItemOrItems`](../type-aliases/FeedItemOrItems.md)

#### Returns

`Promise`\<[`Message`](../interfaces/Message.md)\<`GenericData`\>[]\>

***

### markAsInteracted()

> **markAsInteracted**(`itemOrItems`, `metadata?`): `Promise`\<[`Message`](../interfaces/Message.md)\<`GenericData`\>[]\>

Defined in: [packages/client/src/clients/feed/feed.ts:308](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L308)

#### Parameters

##### itemOrItems

[`FeedItemOrItems`](../type-aliases/FeedItemOrItems.md)

##### metadata?

`Record`\<`string`, `string`\>

#### Returns

`Promise`\<[`Message`](../interfaces/Message.md)\<`GenericData`\>[]\>

***

### markAsArchived()

> **markAsArchived**(`itemOrItems`): `Promise`\<[`Message`](../interfaces/Message.md)\<`GenericData`\>[]\>

Defined in: [packages/client/src/clients/feed/feed.ts:334](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L334)

#### Parameters

##### itemOrItems

[`FeedItemOrItems`](../type-aliases/FeedItemOrItems.md)

#### Returns

`Promise`\<[`Message`](../interfaces/Message.md)\<`GenericData`\>[]\>

***

### markAllAsArchived()

> **markAllAsArchived**(): `Promise`\<[`BulkOperation`](../interfaces/BulkOperation.md)\>

Defined in: [packages/client/src/clients/feed/feed.ts:405](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L405)

#### Returns

`Promise`\<[`BulkOperation`](../interfaces/BulkOperation.md)\>

***

### markAllReadAsArchived()

> **markAllReadAsArchived**(): `Promise`\<[`BulkOperation`](../interfaces/BulkOperation.md)\>

Defined in: [packages/client/src/clients/feed/feed.ts:432](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L432)

#### Returns

`Promise`\<[`BulkOperation`](../interfaces/BulkOperation.md)\>

***

### markAsUnarchived()

> **markAsUnarchived**(`itemOrItems`): `Promise`\<[`Message`](../interfaces/Message.md)\<`GenericData`\>[]\>

Defined in: [packages/client/src/clients/feed/feed.ts:474](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L474)

#### Parameters

##### itemOrItems

[`FeedItemOrItems`](../type-aliases/FeedItemOrItems.md)

#### Returns

`Promise`\<[`Message`](../interfaces/Message.md)\<`GenericData`\>[]\>

***

### fetch()

> **fetch**(`options`): `Promise`\<`undefined` \| \{ `status`: `"ok"` \| `"error"`; `data`: `any`; \}\>

Defined in: [packages/client/src/clients/feed/feed.ts:520](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L520)

#### Parameters

##### options

[`FetchFeedOptions`](../type-aliases/FetchFeedOptions.md) = `{}`

#### Returns

`Promise`\<`undefined` \| \{ `status`: `"ok"` \| `"error"`; `data`: `any`; \}\>

***

### fetchNextPage()

> **fetchNextPage**(`options`): `Promise`\<`void`\>

Defined in: [packages/client/src/clients/feed/feed.ts:610](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L610)

#### Parameters

##### options

[`FetchFeedOptions`](../type-aliases/FetchFeedOptions.md) = `{}`

#### Returns

`Promise`\<`void`\>

***

### handleSocketEvent()

> **handleSocketEvent**(`payload`): `Promise`\<`void`\>

Defined in: [packages/client/src/clients/feed/feed.ts:828](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/feed.ts#L828)

#### Parameters

##### payload

`NewMessageEventPayload`

#### Returns

`Promise`\<`void`\>
