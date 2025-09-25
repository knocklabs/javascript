[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [react/src](../README.md) / NotificationFeedPopoverProps

# Interface: NotificationFeedPopoverProps

Defined in: [packages/react/src/modules/feed/components/NotificationFeedPopover/NotificationFeedPopover.tsx:22](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeedPopover/NotificationFeedPopover.tsx#L22)

## Extends

- [`NotificationFeedProps`](NotificationFeedProps.md)

## Properties

### EmptyComponent?

> `optional` **EmptyComponent**: `ReactNode`

Defined in: [packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx:38](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx#L38)

#### Inherited from

[`NotificationFeedProps`](NotificationFeedProps.md).[`EmptyComponent`](NotificationFeedProps.md#emptycomponent)

***

### ~~header?~~

> `optional` **header**: `ReactNode`

Defined in: [packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx:42](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx#L42)

#### Deprecated

Use `renderHeader` instead to accept `NotificationFeedHeaderProps`

#### Inherited from

[`NotificationFeedProps`](NotificationFeedProps.md).[`header`](NotificationFeedProps.md#header)

***

### renderItem?

> `optional` **renderItem**: [`RenderItem`](../type-aliases/RenderItem.md)

Defined in: [packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx:43](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx#L43)

#### Inherited from

[`NotificationFeedProps`](NotificationFeedProps.md).[`renderItem`](NotificationFeedProps.md#renderitem)

***

### renderHeader()?

> `optional` **renderHeader**: (`props`) => `ReactNode`

Defined in: [packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx:44](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx#L44)

#### Parameters

##### props

[`NotificationFeedHeaderProps`](../type-aliases/NotificationFeedHeaderProps.md)

#### Returns

`ReactNode`

#### Inherited from

[`NotificationFeedProps`](NotificationFeedProps.md).[`renderHeader`](NotificationFeedProps.md#renderheader)

***

### onNotificationClick()?

> `optional` **onNotificationClick**: (`item`) => `void`

Defined in: [packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx:45](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx#L45)

#### Parameters

##### item

`FeedItem`

#### Returns

`void`

#### Inherited from

[`NotificationFeedProps`](NotificationFeedProps.md).[`onNotificationClick`](NotificationFeedProps.md#onnotificationclick)

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

#### Inherited from

[`NotificationFeedProps`](NotificationFeedProps.md).[`onNotificationButtonClick`](NotificationFeedProps.md#onnotificationbuttonclick)

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

#### Inherited from

[`NotificationFeedProps`](NotificationFeedProps.md).[`onMarkAllAsReadClick`](NotificationFeedProps.md#onmarkallasreadclick)

***

### initialFilterStatus?

> `optional` **initialFilterStatus**: `any`

Defined in: [packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx:48](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeed/NotificationFeed.tsx#L48)

#### Inherited from

[`NotificationFeedProps`](NotificationFeedProps.md).[`initialFilterStatus`](NotificationFeedProps.md#initialfilterstatus)

***

### isVisible

> **isVisible**: `boolean`

Defined in: [packages/react/src/modules/feed/components/NotificationFeedPopover/NotificationFeedPopover.tsx:23](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeedPopover/NotificationFeedPopover.tsx#L23)

***

### onOpen()?

> `optional` **onOpen**: (`arg`) => `void`

Defined in: [packages/react/src/modules/feed/components/NotificationFeedPopover/NotificationFeedPopover.tsx:24](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeedPopover/NotificationFeedPopover.tsx#L24)

#### Parameters

##### arg

`OnOpenOptions`

#### Returns

`void`

***

### onClose()

> **onClose**: (`e`) => `void`

Defined in: [packages/react/src/modules/feed/components/NotificationFeedPopover/NotificationFeedPopover.tsx:25](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeedPopover/NotificationFeedPopover.tsx#L25)

#### Parameters

##### e

`Event`

#### Returns

`void`

***

### buttonRef

> **buttonRef**: `RefObject`\<`null` \| `HTMLElement`\>

Defined in: [packages/react/src/modules/feed/components/NotificationFeedPopover/NotificationFeedPopover.tsx:26](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeedPopover/NotificationFeedPopover.tsx#L26)

***

### closeOnClickOutside?

> `optional` **closeOnClickOutside**: `boolean`

Defined in: [packages/react/src/modules/feed/components/NotificationFeedPopover/NotificationFeedPopover.tsx:27](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeedPopover/NotificationFeedPopover.tsx#L27)

***

### placement?

> `optional` **placement**: `Placement`

Defined in: [packages/react/src/modules/feed/components/NotificationFeedPopover/NotificationFeedPopover.tsx:28](https://github.com/knocklabs/javascript/blob/main/packages/react/src/modules/feed/components/NotificationFeedPopover/NotificationFeedPopover.tsx#L28)
