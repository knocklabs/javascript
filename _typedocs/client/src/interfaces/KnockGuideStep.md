[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [client/src](../README.md) / KnockGuideStep

# Interface: KnockGuideStep\<TContent\>

Defined in: [packages/client/src/clients/guide/types.ts:169](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L169)

## Extends

- `GuideStepData`\<`TContent`\>

## Type Parameters

### TContent

`TContent` = `Any`

## Properties

### ref

> **ref**: `string`

Defined in: [packages/client/src/clients/guide/types.ts:20](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L20)

#### Inherited from

`GuideStepData.ref`

***

### schema\_key

> **schema\_key**: `string`

Defined in: [packages/client/src/clients/guide/types.ts:21](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L21)

#### Inherited from

`GuideStepData.schema_key`

***

### schema\_semver

> **schema\_semver**: `string`

Defined in: [packages/client/src/clients/guide/types.ts:22](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L22)

#### Inherited from

`GuideStepData.schema_semver`

***

### schema\_variant\_key

> **schema\_variant\_key**: `string`

Defined in: [packages/client/src/clients/guide/types.ts:23](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L23)

#### Inherited from

`GuideStepData.schema_variant_key`

***

### message

> **message**: `StepMessageState`

Defined in: [packages/client/src/clients/guide/types.ts:24](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L24)

#### Inherited from

`GuideStepData.message`

***

### content

> **content**: `TContent`

Defined in: [packages/client/src/clients/guide/types.ts:25](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L25)

#### Inherited from

`GuideStepData.content`

***

### markAsSeen()

> **markAsSeen**: () => `void`

Defined in: [packages/client/src/clients/guide/types.ts:171](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L171)

#### Returns

`void`

***

### markAsInteracted()

> **markAsInteracted**: (`params?`) => `void`

Defined in: [packages/client/src/clients/guide/types.ts:172](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L172)

#### Parameters

##### params?

###### metadata?

`GenericData`

#### Returns

`void`

***

### markAsArchived()

> **markAsArchived**: () => `void`

Defined in: [packages/client/src/clients/guide/types.ts:173](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L173)

#### Returns

`void`
