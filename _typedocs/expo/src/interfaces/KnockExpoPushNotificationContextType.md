[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [expo/src](../README.md) / KnockExpoPushNotificationContextType

# Interface: KnockExpoPushNotificationContextType

Defined in: [packages/expo/src/modules/push/KnockExpoPushNotificationProvider.tsx:19](https://github.com/knocklabs/javascript/blob/main/packages/expo/src/modules/push/KnockExpoPushNotificationProvider.tsx#L19)

## Extends

- [`FilterStatus`](../../../react/src/variables/FilterStatus.md)

## Properties

### expoPushToken

> **expoPushToken**: `null` \| `string`

Defined in: [packages/expo/src/modules/push/KnockExpoPushNotificationProvider.tsx:21](https://github.com/knocklabs/javascript/blob/main/packages/expo/src/modules/push/KnockExpoPushNotificationProvider.tsx#L21)

***

### registerForPushNotifications()

> **registerForPushNotifications**: () => `Promise`\<`void`\>

Defined in: [packages/expo/src/modules/push/KnockExpoPushNotificationProvider.tsx:22](https://github.com/knocklabs/javascript/blob/main/packages/expo/src/modules/push/KnockExpoPushNotificationProvider.tsx#L22)

#### Returns

`Promise`\<`void`\>

***

### onNotificationReceived()

> **onNotificationReceived**: (`handler`) => `void`

Defined in: [packages/expo/src/modules/push/KnockExpoPushNotificationProvider.tsx:23](https://github.com/knocklabs/javascript/blob/main/packages/expo/src/modules/push/KnockExpoPushNotificationProvider.tsx#L23)

#### Parameters

##### handler

(`notification`) => `void`

#### Returns

`void`

***

### onNotificationTapped()

> **onNotificationTapped**: (`handler`) => `void`

Defined in: [packages/expo/src/modules/push/KnockExpoPushNotificationProvider.tsx:26](https://github.com/knocklabs/javascript/blob/main/packages/expo/src/modules/push/KnockExpoPushNotificationProvider.tsx#L26)

#### Parameters

##### handler

(`response`) => `void`

#### Returns

`void`
