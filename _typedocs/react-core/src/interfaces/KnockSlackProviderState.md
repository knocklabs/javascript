[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [react-core/src](../README.md) / KnockSlackProviderState

# Interface: KnockSlackProviderState

Defined in: [packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx:9](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx#L9)

## Properties

### knockSlackChannelId

> **knockSlackChannelId**: `string`

Defined in: [packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx:10](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx#L10)

***

### tenantId

> **tenantId**: `string`

Defined in: [packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx:11](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx#L11)

***

### ~~tenant~~

> **tenant**: `string`

Defined in: [packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx:15](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx#L15)

#### Deprecated

Use `tenantId` instead. This field will be removed in a future release.

***

### connectionStatus

> **connectionStatus**: `ConnectionStatus`

Defined in: [packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx:16](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx#L16)

***

### setConnectionStatus()

> **setConnectionStatus**: (`connectionStatus`) => `void`

Defined in: [packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx:17](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx#L17)

#### Parameters

##### connectionStatus

`ConnectionStatus`

#### Returns

`void`

***

### errorLabel

> **errorLabel**: `null` \| `string`

Defined in: [packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx:18](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx#L18)

***

### setErrorLabel()

> **setErrorLabel**: (`label`) => `void`

Defined in: [packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx:19](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx#L19)

#### Parameters

##### label

`string`

#### Returns

`void`

***

### actionLabel

> **actionLabel**: `null` \| `string`

Defined in: [packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx:20](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx#L20)

***

### setActionLabel()

> **setActionLabel**: (`label`) => `void`

Defined in: [packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx:21](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx#L21)

#### Parameters

##### label

`null` | `string`

#### Returns

`void`
