[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [client/src](../README.md) / Message

# Interface: Message\<T\>

Defined in: [packages/client/src/clients/messages/interfaces.ts:26](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L26)

## Type Parameters

### T

`T` = `GenericData`

## Properties

### id

> **id**: `string`

Defined in: [packages/client/src/clients/messages/interfaces.ts:27](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L27)

***

### channel\_id

> **channel\_id**: `string`

Defined in: [packages/client/src/clients/messages/interfaces.ts:28](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L28)

***

### recipient

> **recipient**: [`RecipientRef`](../type-aliases/RecipientRef.md)

Defined in: [packages/client/src/clients/messages/interfaces.ts:29](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L29)

***

### actors

> **actors**: [`RecipientRef`](../type-aliases/RecipientRef.md)[]

Defined in: [packages/client/src/clients/messages/interfaces.ts:30](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L30)

***

### inserted\_at

> **inserted\_at**: `string`

Defined in: [packages/client/src/clients/messages/interfaces.ts:31](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L31)

***

### updated\_at

> **updated\_at**: `string`

Defined in: [packages/client/src/clients/messages/interfaces.ts:32](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L32)

***

### read\_at

> **read\_at**: `null` \| `string`

Defined in: [packages/client/src/clients/messages/interfaces.ts:33](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L33)

***

### seen\_at

> **seen\_at**: `null` \| `string`

Defined in: [packages/client/src/clients/messages/interfaces.ts:34](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L34)

***

### archived\_at

> **archived\_at**: `null` \| `string`

Defined in: [packages/client/src/clients/messages/interfaces.ts:35](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L35)

***

### clicked\_at

> **clicked\_at**: `null` \| `string`

Defined in: [packages/client/src/clients/messages/interfaces.ts:36](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L36)

***

### interacted\_at

> **interacted\_at**: `null` \| `string`

Defined in: [packages/client/src/clients/messages/interfaces.ts:37](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L37)

***

### link\_clicked\_at

> **link\_clicked\_at**: `null` \| `string`

Defined in: [packages/client/src/clients/messages/interfaces.ts:38](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L38)

***

### tenant

> **tenant**: `null` \| `string`

Defined in: [packages/client/src/clients/messages/interfaces.ts:39](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L39)

***

### status

> **status**: [`MessageDeliveryStatus`](../type-aliases/MessageDeliveryStatus.md)

Defined in: [packages/client/src/clients/messages/interfaces.ts:40](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L40)

***

### engagement\_statuses

> **engagement\_statuses**: [`MessageEngagementStatus`](../type-aliases/MessageEngagementStatus.md)[]

Defined in: [packages/client/src/clients/messages/interfaces.ts:41](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L41)

***

### source

> **source**: [`NotificationSource`](NotificationSource.md)

Defined in: [packages/client/src/clients/messages/interfaces.ts:42](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L42)

***

### data

> **data**: `null` \| `T`

Defined in: [packages/client/src/clients/messages/interfaces.ts:43](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L43)

***

### metadata

> **metadata**: `object`

Defined in: [packages/client/src/clients/messages/interfaces.ts:44](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L44)

#### external\_id?

> `optional` **external\_id**: `string`
