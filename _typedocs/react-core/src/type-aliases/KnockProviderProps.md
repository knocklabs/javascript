[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [react-core/src](../README.md) / KnockProviderProps

# Type Alias: KnockProviderProps

> **KnockProviderProps** = `object` & \{ `userId`: [`FilterStatus`](../../../react/src/variables/FilterStatus.md)\[`"userId"`\]; `user?`: `never`; `identificationStrategy?`: `never`; \} \| \{ `user`: [`FilterStatus`](../../../react/src/variables/FilterStatus.md); `identificationStrategy?`: [`FilterStatus`](../../../react/src/variables/FilterStatus.md)\[`"identificationStrategy"`\]; `userId?`: `never`; \}

Defined in: [packages/react-core/src/modules/core/context/KnockProvider.tsx:18](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/core/context/KnockProvider.tsx#L18)

## Type Declaration

### apiKey

> **apiKey**: `string` \| `undefined`

### host?

> `optional` **host**: `string`

### userToken?

> `optional` **userToken**: [`FilterStatus`](../../../react/src/variables/FilterStatus.md)\[`"userToken"`\]

### onUserTokenExpiring?

> `optional` **onUserTokenExpiring**: [`FilterStatus`](../../../react/src/variables/FilterStatus.md)\[`"onUserTokenExpiring"`\]

### timeBeforeExpirationInMs?

> `optional` **timeBeforeExpirationInMs**: [`FilterStatus`](../../../react/src/variables/FilterStatus.md)\[`"timeBeforeExpirationInMs"`\]

### i18n?

> `optional` **i18n**: [`I18nContent`](../interfaces/I18nContent.md)

### logLevel?

> `optional` **logLevel**: [`FilterStatus`](../../../react/src/variables/FilterStatus.md)
