[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [react-core/src](../README.md) / useCreateNotificationStore

# Function: useCreateNotificationStore()

> **useCreateNotificationStore**(`feedClient`): \<`T`\>(`selector?`) => `T`

Defined in: [packages/react-core/src/modules/feed/hooks/useNotificationStore.ts:12](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/feed/hooks/useNotificationStore.ts#L12)

Create a hook factory that provides access to the TanStack Store with optional selector support.
This pattern allows for flexible store access with or without selectors while maintaining
type safety. The selector can be passed either to useCreateNotificationStore or
useNotificationStore, with the latter taking precedence.

## Parameters

### feedClient

`Feed`

## Returns

> \<`T`\>(`selector?`): `T`

### Type Parameters

#### T

`T` = `FeedStoreState`

### Parameters

#### selector?

[`Selector`](../type-aliases/Selector.md)\<`T`\>

### Returns

`T`
