[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [react-core/src](../README.md) / useGuide

# Function: useGuide()

> **useGuide**\<`C`\>(`filters`): `UseGuideReturn`\<`C`\>

Defined in: [packages/react-core/src/modules/guide/hooks/useGuide.ts:72](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/guide/hooks/useGuide.ts#L72)

Hook for retrieving and managing a specific guide based on filters.

This hook allows you to access a specific guide from the Knock system by providing
filter criteria such as key or type. It returns the guide object along with its
current step and provides access to the guide context.

## Type Parameters

### C

`C` = `any`

The custom data type for guide content

## Parameters

### filters

`KnockGuideFilterParams`

Filter parameters to identify the guide

## Returns

`UseGuideReturn`\<`C`\>

An object containing:
- `guide`: The matched guide object or undefined if no match
- `step`: The current step of the guide or undefined
- `client`: The Knock client instance from context
- `colorMode`: The current color mode from context

## Throws

When neither key nor type filters are provided

## Examples

```typescript
// Get a guide by key
const { guide, step, client } = useGuide({ key: 'onboarding-guide' });

if (guide) {
  console.log('Guide title:', guide.title);
  if (step) {
    console.log('Current step:', step.title);
  }
}
```

```typescript
// Get a guide by type
const { guide, step } = useGuide({ type: 'tutorial' });

// Use with custom content type
interface CustomGuideData {
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const { guide } = useGuide<CustomGuideData>({ key: 'advanced-tutorial' });
```
