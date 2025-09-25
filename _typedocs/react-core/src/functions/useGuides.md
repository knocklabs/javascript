[**@knocklabs/javascript v0.1.0-rc.0**](../../../README.md)

***

[@knocklabs/javascript](../../../modules.md) / [react-core/src](../README.md) / useGuides

# Function: useGuides()

> **useGuides**\<`C`\>(`filters`): `UseGuidesReturn`\<`C`\>

Defined in: [packages/react-core/src/modules/guide/hooks/useGuides.ts:62](https://github.com/knocklabs/javascript/blob/main/packages/react-core/src/modules/guide/hooks/useGuides.ts#L62)

Hook for retrieving and managing multiple guides based on type filters.

This hook allows you to access multiple guides from the Knock system by providing
a type filter. It returns an array of guide objects that match the specified type
along with access to the guide context.

## Type Parameters

### C

`C` = `any`

The custom data type for guide content

## Parameters

### filters

`Pick`\<[`FilterStatus`](../../../react/src/variables/FilterStatus.md), `"type"`\>

Filter parameters to identify guides

## Returns

`UseGuidesReturn`\<`C`\>

An object containing:
- `guides`: Array of guides matching the filter
- `client`: The Knock client instance from context
- `colorMode`: The current color mode from context

## Examples

```typescript
// Get all tutorial guides
const { guides, client } = useGuides({ type: 'tutorial' });

console.log(`Found ${guides.length} tutorial guides`);
guides.forEach(guide => {
  console.log('Guide:', guide.title);
});
```

```typescript
// Use with custom content type
interface TutorialData {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
}

const { guides } = useGuides<TutorialData>({ type: 'tutorial' });

// Filter by difficulty
const beginnerGuides = guides.filter(guide => 
  guide.data?.difficulty === 'beginner'
);
```
