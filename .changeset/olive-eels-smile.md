---
"@knocklabs/react": patch
---

Pin every `@telegraph/*` dependency to a caret range at its latest release

These were open `>=` ranges, so an install resolved to whatever was newest on npm rather than a version this package had been built against. In practice that already meant `@telegraph/combobox` 0.6.0, a rewrite onto Base UI, so the three comboboxes are now tested and pinned against it rather than receiving it by accident.

`@telegraph/select` was a second route to the same problem: it sat on 0.1.0, which pins `@telegraph/combobox` at 0.5.0, so consumers received two copies of the combobox. Moving it to 0.2.0 leaves one.
