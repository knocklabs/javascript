---
"@knocklabs/react-core": patch
"@knocklabs/react": patch
---

Enable use of TeamsKit with branches

The `useMsTeamsAuth` hook exported by `@knocklabs/react-core` has been updated
so that it works with branches. You can now use either this hook or the
`<MsTeamsAuthButton>` component exported by `@knocklabs/react` to test
connecting Microsoft Teams organizations to Knock tenants while working on a
branch.
