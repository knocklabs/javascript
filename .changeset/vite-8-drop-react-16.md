---
"@knocklabs/react-core": minor
"@knocklabs/react": minor
---

Drop React 16 support

`@knocklabs/react` and `@knocklabs/react-core` now compile with React's
automatic JSX runtime, so their published output imports `react/jsx-runtime`.
That entry point only exists in React 17 and later, so the `react` and
`react-dom` peer ranges narrow from `^16.11.0 || ^17.0.0 || ^18.0.0 || ^19.0.0`
to `^17.0.0 || ^18.0.0 || ^19.0.0`.

If you are on React 16, stay on the previous release. Everyone on React 17+ can
upgrade with no code changes.

This comes out of the move to Vite 8, which compiles JSX with oxc before Babel
runs, making the previous classic-runtime setup (`jsxRuntime: "classic"` plus
`babel-plugin-react-require`) unworkable.
