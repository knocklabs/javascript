---
"@knocklabs/react-core": patch
---

Add `branch` option to `useAuthenticatedKnockClient` hook

The `useAuthenticatedKnockClient` hook now accepts a `branch` option. To use
`useAuthenticatedKnockClient` with a branch, set the `apiKey` param to your
development environment's API key and set the `branch` option to the slug of an
existing branch.

```tsx
import { useAuthenticatedKnockClient } from "@knocklabs/react-core";

const knock = useAuthenticatedKnockClient(
  process.env.KNOCK_PUBLIC_API_KEY,
  { id: user.id },
  undefined, // userToken when needed
  { branch: "my-branch-slug" },
);
```
