[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [react-core/src](../README.md) / useNotificationStore

# Function: useNotificationStore()

## Call Signature

> **useNotificationStore**(`feedClient`): `FeedStoreState`

Defined in: [packages/react-core/src/modules/feed/hooks/useNotificationStore.ts:44](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/feed/hooks/useNotificationStore.ts#L44)

A hook used to access content within the notification store.

### Parameters

#### feedClient

`Feed`

### Returns

`FeedStoreState`

### Examples

```ts
const { items, metadata } = useNotificationStore(feedClient);
```

A selector can be used to access a subset of the store state.

```ts
const { items, metadata } = useNotificationStore(feedClient, (state) => ({
  items: state.items,
  metadata: state.metadata,
}));
```

## Call Signature

> **useNotificationStore**\<`T`\>(`feedClient`, `selector`): `T`

Defined in: [packages/react-core/src/modules/feed/hooks/useNotificationStore.ts:45](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/feed/hooks/useNotificationStore.ts#L45)

A hook used to access content within the notification store.

### Type Parameters

#### T

`T`

### Parameters

#### feedClient

`Feed`

#### selector

[`Selector`](../type-aliases/Selector.md)\<`T`\>

### Returns

`T`

### Examples

```ts
const { items, metadata } = useNotificationStore(feedClient);
```

A selector can be used to access a subset of the store state.

```ts
const { items, metadata } = useNotificationStore(feedClient, (state) => ({
  items: state.items,
  metadata: state.metadata,
}));
```
