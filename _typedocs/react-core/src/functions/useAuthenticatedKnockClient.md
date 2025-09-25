[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [react-core/src](../README.md) / useAuthenticatedKnockClient

# ~~Function: useAuthenticatedKnockClient()~~

## Call Signature

> **useAuthenticatedKnockClient**(`apiKey`, `userIdOrUserWithProperties`, `userToken?`, `options?`): `Knock`

Defined in: [packages/react-core/src/modules/core/hooks/useAuthenticatedKnockClient.ts:35](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/core/hooks/useAuthenticatedKnockClient.ts#L35)

### Parameters

#### apiKey

`string`

#### userIdOrUserWithProperties

`UserId`

#### userToken?

`any`

#### options?

`any`

### Returns

`Knock`

### Deprecated

Passing `userId` as a `string` is deprecated and will be removed in a future version.
Please pass a `user` object instead containing an `id` value.
example:
```ts
useAuthenticatedKnockClient("pk_test_12345", { id: "user_123" });
```

## Call Signature

> **useAuthenticatedKnockClient**(`apiKey`, `userIdOrUserWithProperties`, `userToken?`, `options?`): `Knock`

Defined in: [packages/react-core/src/modules/core/hooks/useAuthenticatedKnockClient.ts:41](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/core/hooks/useAuthenticatedKnockClient.ts#L41)

### Parameters

#### apiKey

`string`

#### userIdOrUserWithProperties

`UserIdOrUserWithProperties`

#### userToken?

`any`

#### options?

`any`

### Returns

`Knock`

### Deprecated

Passing `userId` as a `string` is deprecated and will be removed in a future version.
Please pass a `user` object instead containing an `id` value.
example:
```ts
useAuthenticatedKnockClient("pk_test_12345", { id: "user_123" });
```
