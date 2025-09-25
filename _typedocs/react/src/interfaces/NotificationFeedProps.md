[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [react/src](../README.md) / NotificationFeedProps

# Interface: NotificationFeedProps

Defined in: [packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx:37](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx#L37)

## Extended by

- [`NotificationFeedPopoverProps`](NotificationFeedPopoverProps.md)

## Properties

### EmptyComponent?

> `optional` **EmptyComponent**: `ReactNode`

Defined in: [packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx:38](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx#L38)

***

### ~~header?~~

> `optional` **header**: `ReactNode`

Defined in: [packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx:42](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx#L42)

#### Deprecated

Use `renderHeader` instead to accept `NotificationFeedHeaderProps`

***

### renderItem?

> `optional` **renderItem**: [`RenderItem`](../type-aliases/RenderItem.md)

Defined in: [packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx:43](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx#L43)

***

### renderHeader()?

> `optional` **renderHeader**: (`props`) => `ReactNode`

Defined in: [packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx:44](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx#L44)

#### Parameters

##### props

[`NotificationFeedHeaderProps`](../type-aliases/NotificationFeedHeaderProps.md)

#### Returns

`ReactNode`

***

### onNotificationClick()?

> `optional` **onNotificationClick**: (`item`) => `void`

Defined in: [packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx:45](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx#L45)

#### Parameters

##### item

`FeedItem`

#### Returns

`void`

***

### onNotificationButtonClick()?

> `optional` **onNotificationButtonClick**: (`item`, `action`) => `void`

Defined in: [packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx:46](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx#L46)

#### Parameters

##### item

`FeedItem`

##### action

`ActionButton`

#### Returns

`void`

***

### onMarkAllAsReadClick()?

> `optional` **onMarkAllAsReadClick**: (`e`, `unreadItems`) => `void`

Defined in: [packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx:47](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx#L47)

#### Parameters

##### e

`MouseEvent`

##### unreadItems

`FeedItem`[]

#### Returns

`void`

***

### initialFilterStatus?

> `optional` **initialFilterStatus**: `any`

Defined in: [packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx:48](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx#L48)
