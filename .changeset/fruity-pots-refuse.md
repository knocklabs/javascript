---
"@knocklabs/react-core": minor
"@knocklabs/client": minor
---

Adds support for inline user `identify` calls when authenticating a user via the Knock client.  
You can now pass a `user` object, for example `{ id: "123" }`, directly to the `authenticate` function.  
Additional properties can also be included to update the user record, such as `{ id: "123", name: "Knock" }`.

This update also applies to `KnockProvider`, where you can now pass a `user` prop instead of a `userId` prop to achieve the same behavior.
