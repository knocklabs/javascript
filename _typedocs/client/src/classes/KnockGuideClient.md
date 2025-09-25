[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [client/src](../README.md) / KnockGuideClient

# Class: KnockGuideClient

Defined in: [packages/client/src/clients/guide/client.ts:190](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/client.ts#L190)

## Constructors

### Constructor

> **new KnockGuideClient**(`knock`, `channelId`, `targetParams`, `options`): `KnockGuideClient`

Defined in: [packages/client/src/clients/guide/client.ts:218](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/client.ts#L218)

#### Parameters

##### knock

[`default`](default.md)

##### channelId

`string`

##### targetParams

[`KnockGuideTargetParams`](../type-aliases/KnockGuideTargetParams.md) = `{}`

##### options

`ConstructorOpts` = `{}`

#### Returns

`KnockGuideClient`

## Properties

### store

> **store**: `Store`\<`StoreState`, (`state`) => `StoreState`\>

Defined in: [packages/client/src/clients/guide/client.ts:191](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/client.ts#L191)

***

### knock

> `readonly` **knock**: [`default`](default.md)

Defined in: [packages/client/src/clients/guide/client.ts:219](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/client.ts#L219)

***

### channelId

> `readonly` **channelId**: `string`

Defined in: [packages/client/src/clients/guide/client.ts:220](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/client.ts#L220)

***

### targetParams

> `readonly` **targetParams**: [`KnockGuideTargetParams`](../type-aliases/KnockGuideTargetParams.md) = `{}`

Defined in: [packages/client/src/clients/guide/client.ts:221](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/client.ts#L221)

***

### options

> `readonly` **options**: `ConstructorOpts` = `{}`

Defined in: [packages/client/src/clients/guide/client.ts:222](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/client.ts#L222)

## Methods

### cleanup()

> **cleanup**(): `void`

Defined in: [packages/client/src/clients/guide/client.ts:284](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/client.ts#L284)

#### Returns

`void`

***

### fetch()

> **fetch**(`opts?`): `Promise`\<`QueryStatus`\>

Defined in: [packages/client/src/clients/guide/client.ts:291](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/client.ts#L291)

#### Parameters

##### opts?

###### filters?

`QueryFilterParams`

#### Returns

`Promise`\<`QueryStatus`\>

***

### subscribe()

> **subscribe**(): `void`

Defined in: [packages/client/src/clients/guide/client.ts:341](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/client.ts#L341)

#### Returns

`void`

***

### unsubscribe()

> **unsubscribe**(): `void`

Defined in: [packages/client/src/clients/guide/client.ts:410](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/client.ts#L410)

#### Returns

`void`

***

### setLocation()

> **setLocation**(`href`, `additionalParams`): `void`

Defined in: [packages/client/src/clients/guide/client.ts:451](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/client.ts#L451)

#### Parameters

##### href

`string`

##### additionalParams

`Partial`\<`StoreState`\> = `{}`

#### Returns

`void`

***

### selectGuides()

> **selectGuides**\<`C`\>(`state`, `filters`): [`KnockGuide`](../interfaces/KnockGuide.md)\<`C`\>[]

Defined in: [packages/client/src/clients/guide/client.ts:477](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/client.ts#L477)

#### Type Parameters

##### C

`C` = `any`

#### Parameters

##### state

`StoreState`

##### filters

[`KnockGuideFilterParams`](../type-aliases/KnockGuideFilterParams.md) = `{}`

#### Returns

[`KnockGuide`](../interfaces/KnockGuide.md)\<`C`\>[]

***

### selectGuide()

> **selectGuide**\<`C`\>(`state`, `filters`): `undefined` \| [`KnockGuide`](../interfaces/KnockGuide.md)\<`C`\>

Defined in: [packages/client/src/clients/guide/client.ts:505](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/client.ts#L505)

#### Type Parameters

##### C

`C` = `any`

#### Parameters

##### state

`StoreState`

##### filters

[`KnockGuideFilterParams`](../type-aliases/KnockGuideFilterParams.md) = `{}`

#### Returns

`undefined` \| [`KnockGuide`](../interfaces/KnockGuide.md)\<`C`\>

***

### markAsSeen()

> **markAsSeen**(`guide`, `step`): `Promise`\<`undefined` \| [`KnockGuideStep`](../interfaces/KnockGuideStep.md)\<`any`\>\>

Defined in: [packages/client/src/clients/guide/client.ts:742](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/client.ts#L742)

#### Parameters

##### guide

`GuideData`

##### step

`GuideStepData`

#### Returns

`Promise`\<`undefined` \| [`KnockGuideStep`](../interfaces/KnockGuideStep.md)\<`any`\>\>

***

### markAsInteracted()

> **markAsInteracted**(`guide`, `step`, `metadata?`): `Promise`\<`undefined` \| [`KnockGuideStep`](../interfaces/KnockGuideStep.md)\<`any`\>\>

Defined in: [packages/client/src/clients/guide/client.ts:769](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/client.ts#L769)

#### Parameters

##### guide

`GuideData`

##### step

`GuideStepData`

##### metadata?

`GenericData`

#### Returns

`Promise`\<`undefined` \| [`KnockGuideStep`](../interfaces/KnockGuideStep.md)\<`any`\>\>

***

### markAsArchived()

> **markAsArchived**(`guide`, `step`): `Promise`\<`undefined` \| [`KnockGuideStep`](../interfaces/KnockGuideStep.md)\<`any`\>\>

Defined in: [packages/client/src/clients/guide/client.ts:798](https://github.com/knocklabs/javascript/blob/main/packages/client/src/clients/guide/client.ts#L798)

#### Parameters

##### guide

`GuideData`

##### step

`GuideStepData`

#### Returns

`Promise`\<`undefined` \| [`KnockGuideStep`](../interfaces/KnockGuideStep.md)\<`any`\>\>
