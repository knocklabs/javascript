---
"@knocklabs/react": patch
---

fix(KNO-14012): guide toolbar no longer requires importing `@knocklabs/react/dist/index.css`

The guide toolbar previously rendered unstyled (or with frankenstein styling) unless the consuming app imported `@knocklabs/react/dist/index.css`. Apps that only render custom guide components have no reason to import that stylesheet, so the toolbar broke for them. The toolbar now injects its compiled styles into the document head at runtime when it becomes visible, making it plug and play without an explicit CSS import. When `dist/index.css` is imported anyway, the injected rules are identical duplicates and have no effect.
