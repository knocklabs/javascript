[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [react-native/src](../README.md) / NotificationFeedProps

# Interface: NotificationFeedProps

Defined in: [packages/react-native/src/modules/feed/components/NotificationFeedComponents/NotificationFeed.tsx:38](https://github.com/knocklabs/javascript/blob/main/packages/react-native/src/modules/feed/components/NotificationFeedComponents/NotificationFeed.tsx#L38)

## Properties

### containerStyle?

> `optional` **containerStyle**: `StyleProp`\<`ViewStyle`\>

Defined in: [packages/react-native/src/modules/feed/components/NotificationFeedComponents/NotificationFeed.tsx:39](https://github.com/knocklabs/javascript/blob/main/packages/react-native/src/modules/feed/components/NotificationFeedComponents/NotificationFeed.tsx#L39)

***

### notificationRowStyle?

> `optional` **notificationRowStyle**: [`NotificationFeedCellStyle`](NotificationFeedCellStyle.md)

Defined in: [packages/react-native/src/modules/feed/components/NotificationFeedComponents/NotificationFeed.tsx:40](https://github.com/knocklabs/javascript/blob/main/packages/react-native/src/modules/feed/components/NotificationFeedComponents/NotificationFeed.tsx#L40)

***

### headerConfig?

> `optional` **headerConfig**: [`NotificationFeedHeaderConfig`](NotificationFeedHeaderConfig.md)

Defined in: [packages/react-native/src/modules/feed/components/NotificationFeedComponents/NotificationFeed.tsx:41](https://github.com/knocklabs/javascript/blob/main/packages/react-native/src/modules/feed/components/NotificationFeedComponents/NotificationFeed.tsx#L41)

***

### emptyFeedStyle?

> `optional` **emptyFeedStyle**: [`EmptyNotificationFeedStyle`](EmptyNotificationFeedStyle.md)

Defined in: [packages/react-native/src/modules/feed/components/NotificationFeedComponents/NotificationFeed.tsx:42](https://github.com/knocklabs/javascript/blob/main/packages/react-native/src/modules/feed/components/NotificationFeedComponents/NotificationFeed.tsx#L42)

***

### onCellActionButtonTap()?

> `optional` **onCellActionButtonTap**: (`params`) => `void`

Defined in: [packages/react-native/src/modules/feed/components/NotificationFeedComponents/NotificationFeed.tsx:43](https://github.com/knocklabs/javascript/blob/main/packages/react-native/src/modules/feed/components/NotificationFeedComponents/NotificationFeed.tsx#L43)

#### Parameters

##### params

###### button

`ActionButton`

###### item

`FeedItem`

#### Returns

`void`

***

### onRowTap()?

> `optional` **onRowTap**: (`item`) => `void`

Defined in: [packages/react-native/src/modules/feed/components/NotificationFeedComponents/NotificationFeed.tsx:47](https://github.com/knocklabs/javascript/blob/main/packages/react-native/src/modules/feed/components/NotificationFeedComponents/NotificationFeed.tsx#L47)

#### Parameters

##### item

`FeedItem`

#### Returns

`void`
