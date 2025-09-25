[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [client/src](../README.md) / KnockGuide

# Interface: KnockGuide\<TContent\>

Defined in: [packages/client/src/clients/guide/types.ts:181](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L181)

## Extends

- `GuideData`\<`TContent`\>

## Type Parameters

### TContent

`TContent` = `Any`

## Properties

### \_\_typename

> **\_\_typename**: `"Guide"`

Defined in: [packages/client/src/clients/guide/types.ts:41](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L41)

#### Inherited from

`GuideData.__typename`

***

### channel\_id

> **channel\_id**: `string`

Defined in: [packages/client/src/clients/guide/types.ts:42](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L42)

#### Inherited from

`GuideData.channel_id`

***

### id

> **id**: `string`

Defined in: [packages/client/src/clients/guide/types.ts:43](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L43)

#### Inherited from

`GuideData.id`

***

### key

> **key**: `string`

Defined in: [packages/client/src/clients/guide/types.ts:44](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L44)

#### Inherited from

`GuideData.key`

***

### type

> **type**: `string`

Defined in: [packages/client/src/clients/guide/types.ts:45](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L45)

#### Inherited from

`GuideData.type`

***

### semver

> **semver**: `string`

Defined in: [packages/client/src/clients/guide/types.ts:46](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L46)

#### Inherited from

`GuideData.semver`

***

### active

> **active**: `boolean`

Defined in: [packages/client/src/clients/guide/types.ts:47](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L47)

#### Inherited from

`GuideData.active`

***

### activation\_url\_rules

> **activation\_url\_rules**: `GuideActivationUrlRuleData`[]

Defined in: [packages/client/src/clients/guide/types.ts:49](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L49)

#### Inherited from

`GuideData.activation_url_rules`

***

### bypass\_global\_group\_limit

> **bypass\_global\_group\_limit**: `boolean`

Defined in: [packages/client/src/clients/guide/types.ts:51](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L51)

#### Inherited from

`GuideData.bypass_global_group_limit`

***

### inserted\_at

> **inserted\_at**: `string`

Defined in: [packages/client/src/clients/guide/types.ts:52](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L52)

#### Inherited from

`GuideData.inserted_at`

***

### updated\_at

> **updated\_at**: `string`

Defined in: [packages/client/src/clients/guide/types.ts:53](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L53)

#### Inherited from

`GuideData.updated_at`

***

### steps

> **steps**: [`KnockGuideStep`](KnockGuideStep.md)\<`TContent`\>[]

Defined in: [packages/client/src/clients/guide/types.ts:182](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L182)

#### Overrides

`GuideData.steps`

***

### activation\_url\_patterns

> **activation\_url\_patterns**: `KnockGuideActivationUrlPattern`[]

Defined in: [packages/client/src/clients/guide/types.ts:183](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L183)

#### Overrides

`GuideData.activation_url_patterns`

***

### getStep()

> **getStep**: () => `undefined` \| [`KnockGuideStep`](KnockGuideStep.md)\<`TContent`\>

Defined in: [packages/client/src/clients/guide/types.ts:184](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/types.ts#L184)

#### Returns

`undefined` \| [`KnockGuideStep`](KnockGuideStep.md)\<`TContent`\>
