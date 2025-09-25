[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [client/src](../README.md) / BulkUpdateMessagesInChannelProperties

# Type Alias: BulkUpdateMessagesInChannelProperties

> **BulkUpdateMessagesInChannelProperties** = `object`

Defined in: [packages/client/src/clients/messages/interfaces.ts:49](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L49)

## Properties

### channelId

> **channelId**: `string`

Defined in: [packages/client/src/clients/messages/interfaces.ts:50](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L50)

***

### status

> **status**: `"seen"` \| `"read"` \| `"archive"`

Defined in: [packages/client/src/clients/messages/interfaces.ts:51](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L51)

***

### options

> **options**: `object`

Defined in: [packages/client/src/clients/messages/interfaces.ts:52](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/messages/interfaces.ts#L52)

#### user\_ids?

> `optional` **user\_ids**: `string`[]

#### engagement\_status?

> `optional` **engagement\_status**: `"seen"` \| `"read"` \| `"archived"` \| `"unseen"` \| `"unread"` \| `"unarchived"` \| `"interacted"` \| `"link_clicked"`

#### archived?

> `optional` **archived**: `"exclude"` \| `"include"` \| `"only"`

#### has\_tenant?

> `optional` **has\_tenant**: `boolean`

#### tenants?

> `optional` **tenants**: `string`[]
