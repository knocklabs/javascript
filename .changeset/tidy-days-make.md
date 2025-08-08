---
"@knocklabs/client": patch
---

Add `branch` option to `Knock` client

The `Knock` client now accepts a `branch` option. To use `Knock` with a branch,
set the `apiKey` param to your development environment's API key and set the
`branch` option to the slug of an existing branch.

```js
import Knock from "@knocklabs/client";

const knock = new Knock(process.env.KNOCK_PUBLIC_API_KEY, {
  branch: "my-branch-slug",
});
```
