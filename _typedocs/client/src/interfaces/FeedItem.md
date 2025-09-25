[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [client/src](../README.md) / FeedItem

# Interface: FeedItem\<T\>

Defined in: [packages/client/src/clients/feed/interfaces.ts:107](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L107)

## Type Parameters

### T

`T` = `GenericData`

## Properties

### \_\_cursor

> **\_\_cursor**: `string`

Defined in: [packages/client/src/clients/feed/interfaces.ts:108](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L108)

***

### id

> **id**: `string`

Defined in: [packages/client/src/clients/feed/interfaces.ts:109](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L109)

***

### activities

> **activities**: [`Activity`](Activity.md)\<`T`\>[]

Defined in: [packages/client/src/clients/feed/interfaces.ts:110](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L110)

***

### actors

> **actors**: [`Recipient`](../type-aliases/Recipient.md)[]

Defined in: [packages/client/src/clients/feed/interfaces.ts:111](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L111)

***

### blocks

> **blocks**: [`ContentBlock`](../type-aliases/ContentBlock.md)[]

Defined in: [packages/client/src/clients/feed/interfaces.ts:112](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L112)

***

### inserted\_at

> **inserted\_at**: `string`

Defined in: [packages/client/src/clients/feed/interfaces.ts:113](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L113)

***

### updated\_at

> **updated\_at**: `string`

Defined in: [packages/client/src/clients/feed/interfaces.ts:114](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L114)

***

### read\_at

> **read\_at**: `null` \| `string`

Defined in: [packages/client/src/clients/feed/interfaces.ts:115](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L115)

***

### seen\_at

> **seen\_at**: `null` \| `string`

Defined in: [packages/client/src/clients/feed/interfaces.ts:116](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L116)

***

### clicked\_at

> **clicked\_at**: `null` \| `string`

Defined in: [packages/client/src/clients/feed/interfaces.ts:117](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L117)

***

### interacted\_at

> **interacted\_at**: `null` \| `string`

Defined in: [packages/client/src/clients/feed/interfaces.ts:118](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L118)

***

### link\_clicked\_at

> **link\_clicked\_at**: `null` \| `string`

Defined in: [packages/client/src/clients/feed/interfaces.ts:119](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L119)

***

### archived\_at

> **archived\_at**: `null` \| `string`

Defined in: [packages/client/src/clients/feed/interfaces.ts:120](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L120)

***

### total\_activities

> **total\_activities**: `number`

Defined in: [packages/client/src/clients/feed/interfaces.ts:121](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L121)

***

### total\_actors

> **total\_actors**: `number`

Defined in: [packages/client/src/clients/feed/interfaces.ts:122](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L122)

***

### data

> **data**: `null` \| `T`

Defined in: [packages/client/src/clients/feed/interfaces.ts:123](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L123)

***

### source

> **source**: [`NotificationSource`](NotificationSource.md)

Defined in: [packages/client/src/clients/feed/interfaces.ts:124](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L124)

***

### tenant

> **tenant**: `null` \| `string`

Defined in: [packages/client/src/clients/feed/interfaces.ts:125](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/feed/interfaces.ts#L125)
