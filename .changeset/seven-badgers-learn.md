---
"@knocklabs/react-core": patch
"@knocklabs/react": patch
---

Enable use of SlackKit with branches

The `useSlackAuth` hook exported by `@knocklabs/react-core` has been updated so
that it works with branches. You can now use either this hook or the
`<SlackAuthButton>` component exported by `@knocklabs/react` to test connecting
Slack workspaces to Knock tenants while working on a branch.
