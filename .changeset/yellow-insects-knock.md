---
"@knocklabs/react-core": patch
---

Add `branch` prop to `<KnockProvider>`

The `<KnockProvider>` context provider now accepts an optional `branch` prop.
To use `<KnockProvider>` with a branch, set the `apiKey` prop to your
development environment's API key and set `branch` to the slug of an existing
branch.

```tsx
import { KnockProvider } from "@knocklabs/react";

const YourAppLayout = () => {
  return (
    <KnockProvider
      apiKey={process.env.KNOCK_PUBLIC_API_KEY}
      user={{ id: user.id }}
      branch="my-branch-slug"
    >
      {/** the rest of your app */}
    </KnockProvider>
  );
};
```
