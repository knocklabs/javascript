[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [client/src](../README.md) / default

# Class: default

Defined in: [packages/client/src/knock.ts:22](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L22)

## Constructors

### Constructor

> **new default**(`apiKey`, `options`): `Knock`

Defined in: [packages/client/src/knock.ts:37](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L37)

#### Parameters

##### apiKey

`string`

##### options

[`KnockOptions`](../interfaces/KnockOptions.md) = `{}`

#### Returns

`Knock`

## Properties

### host

> **host**: `string`

Defined in: [packages/client/src/knock.ts:23](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L23)

***

### userId

> **userId**: `undefined` \| `null` \| `string`

Defined in: [packages/client/src/knock.ts:25](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L25)

***

### userToken?

> `optional` **userToken**: `string`

Defined in: [packages/client/src/knock.ts:26](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L26)

***

### logLevel?

> `optional` **logLevel**: `"debug"`

Defined in: [packages/client/src/knock.ts:27](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L27)

***

### feeds

> `readonly` **feeds**: [`FeedClient`](FeedClient.md)

Defined in: [packages/client/src/knock.ts:29](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L29)

***

### objects

> `readonly` **objects**: `ObjectClient`

Defined in: [packages/client/src/knock.ts:30](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L30)

***

### preferences

> `readonly` **preferences**: `Preferences`

Defined in: [packages/client/src/knock.ts:31](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L31)

***

### slack

> `readonly` **slack**: `SlackClient`

Defined in: [packages/client/src/knock.ts:32](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L32)

***

### msTeams

> `readonly` **msTeams**: `MsTeamsClient`

Defined in: [packages/client/src/knock.ts:33](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L33)

***

### user

> `readonly` **user**: `UserClient`

Defined in: [packages/client/src/knock.ts:34](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L34)

***

### messages

> `readonly` **messages**: `MessageClient`

Defined in: [packages/client/src/knock.ts:35](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L35)

***

### apiKey

> `readonly` **apiKey**: `string`

Defined in: [packages/client/src/knock.ts:38](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L38)

## Methods

### client()

> **client**(): `ApiClient`

Defined in: [packages/client/src/knock.ts:54](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L54)

#### Returns

`ApiClient`

***

### ~~authenticate()~~

#### Call Signature

> **authenticate**(`userIdOrUserWithProperties`, `userToken?`, `options?`): `never`

Defined in: [packages/client/src/knock.ts:71](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L71)

##### Parameters

###### userIdOrUserWithProperties

`undefined` | `null` | `string`

###### userToken?

`string`

###### options?

[`AuthenticateOptions`](../interfaces/AuthenticateOptions.md)

##### Returns

`never`

##### Deprecated

Passing `userId` as a `string` is deprecated and will be removed in a future version.
Please pass a `user` object instead containing an `id` value.
example:
```ts
knock.authenticate({ id: "user_123" });
```

#### Call Signature

> **authenticate**(`userIdOrUserWithProperties`, `userToken?`, `options?`): `void`

Defined in: [packages/client/src/knock.ts:76](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L76)

##### Parameters

###### userIdOrUserWithProperties

[`UserIdOrUserWithProperties`](../type-aliases/UserIdOrUserWithProperties.md)

###### userToken?

`string`

###### options?

[`AuthenticateOptions`](../interfaces/AuthenticateOptions.md)

##### Returns

`void`

##### Deprecated

Passing `userId` as a `string` is deprecated and will be removed in a future version.
Please pass a `user` object instead containing an `id` value.
example:
```ts
knock.authenticate({ id: "user_123" });
```

***

### failIfNotAuthenticated()

> **failIfNotAuthenticated**(): `void`

Defined in: [packages/client/src/knock.ts:152](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L152)

#### Returns

`void`

***

### isAuthenticated()

> **isAuthenticated**(`checkUserToken`): `boolean`

Defined in: [packages/client/src/knock.ts:162](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L162)

#### Parameters

##### checkUserToken

`boolean` = `false`

#### Returns

`boolean`

***

### teardown()

> **teardown**(): `void`

Defined in: [packages/client/src/knock.ts:167](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L167)

#### Returns

`void`

***

### log()

> **log**(`message`, `force`): `void`

Defined in: [packages/client/src/knock.ts:176](https://github.com/knocklabs/javascript/blob/main/packages/client/src/knock.ts#L176)

#### Parameters

##### message

`string`

##### force

`boolean` = `false`

#### Returns

`void`
