---
"@knocklabs/react": patch
---

chore: upgrade telegraph deps + migrate telegraph icons to updated strategy

We changed how we import icons from `lucide-react` so that the package is treeshaken properly. This means that when utilizing knock packages, you won't need to worry about having extra `lucide-react` icons in your bundle.
