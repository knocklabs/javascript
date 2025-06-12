# React – Comprehensive Test Coverage Plan

## Goal

- Reach **100 % line & branch coverage** for everything inside `packages/react/src`.
- **Only** create / modify files under `packages/react/test`.
- Reuse mocks, helpers, and patterns already established in `packages/react-core/test` and the existing `packages/react/test` utilities.
- Honor repository component guidelines, accessibility, and performance standards.

---

## 1 Current State Snapshot

| Area               | Status                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| Test runner        | **Vitest** (JSDOM) with `packages/react/setupTest.ts`                                            |
| Assertion helpers  | `@testing-library/react`, `@testing-library/jest-dom`, `vitest-axe` (`axe.ts`)                   |
| Shared providers   | `renderWithProviders` (wrapping `KnockProvider` + `KnockFeedProvider`)                           |
| Coverage baseline  | Button & EmptyFeed covered; most modules untouched (≈ 8 % lines, 2 % branches)                   |
| Gaps / pain-points | All core hooks, icons, util fns, feed list logic, guide/slack/ms-teams flows, public barrel file |

---

## 2 Files / Modules to Cover

### Core

- `components/Icons/*` (BellIcon, CheckmarkCircle, ChevronDown, CloseCircle)
- `components/Button/Button.tsx`, `ButtonGroup.tsx`, `ButtonSpinner.tsx`
- `components/Spinner/Spinner.tsx`
- `hooks/useOnBottomScroll.ts`, `hooks/useComponentVisible.ts`
- `utils.ts` (openPopupWindow)

### Feed

- `components/Avatar/Avatar.tsx`
- `components/EmptyFeed/EmptyFeed.tsx`
- `components/UnseenBadge/UnseenBadge.tsx`
- `components/NotificationIconButton/NotificationIconButton.tsx`
- `components/NotificationCell/*` (incl. ArchiveButton, Avatar render)
- `components/NotificationFeed/*` (Dropdown, MarkAsRead, Header, Feed, Container, Popover)

### Guide

- `components/Banner/*`, `Card/*`, `Modal/*` (+ helpers & types)

### Slack

- `components/SlackAuthButton/*`, `SlackAuthContainer/*`, `SlackChannelCombobox/*`, `SlackAddChannelInput/*`, `SlackIcon/*`
- `utils.ts` (sortSlackChannelsAlphabetically)

### Ms-Teams

- `components/MsTeamsAuthButton/*`, `MsTeamsAuthContainer/*`, `MsTeamsChannelCombobox/*`, `MsTeamsIcon/*`
- `utils.ts` (sortByDisplayName)

### Barrel / Public API

- `src/index.ts` and every `index.ts` in module folders – validate forward exports.

---

## 3 Testing Strategy

1. **Foundation**

   - Vitest + React-Testing-Library (`render`, `renderHook`, `user-event`).
   - Accessibility: `vitest-axe` with helper `expectToHaveNoViolations`.
   - Fake timers for scroll / debounce (`vi.useFakeTimers()`).

2. **Mocks & Fixtures**

   - Continue leveraging `renderWithProviders` – extend to accept optional `knockProviderProps`, `knockFeedProviderProps`, `translations` override.
   - Stub `window.open`, `window.scrollHeight`, etc., with `vi.spyOn`.
   - Mock `lodash.debounce` via `vi.fn((fn) ⇒ fn)` when deterministic timing is required.
   - Guide/Slack/Ms-Teams SDK calls are already abstracted behind React-Core providers, so component tests remain unit-level with lightweight stubs.

3. **Component Tests**

   - Snapshot-style assertions on CSS classes & rendered text.
   - Interactive paths:
     - Button: spinner while loading, disable while loading, callback fire.
     - Dropdown + Header: filter change updates selected value.
     - NotificationFeed: infinite-scroll fetches next page when bottom reached (simulate `scroll` event).
     - Auth buttons: clicking triggers `openPopupWindow` with correct URL.
   - A11y check on every visual component.

4. **Hook Tests**

   - `useOnBottomScroll`: simulate scroll distance, ensure callback invocation with and without offset.
   - `useComponentVisible`: Escape key & outside-click detection; ensure cleanup on unmount.

5. **Pure Utility Tests**

   - `openPopupWindow`: spy on `window.open`, verify centred coords & features.
   - Sorting helpers: table-driven tests for casing / diacritics.

6. **Barrel Tests**
   - `publicApi.test.ts`: `expect(() ⇒ require("../src").Button).toBeDefined()` for every export enumerated in `src/index.ts`.

---

## 4 Test File Structure (`packages/react/test`)

```text
core/
  Button.test.tsx
  ButtonGroup.test.tsx
  Spinner.test.tsx
  Icons.test.tsx
  useOnBottomScroll.test.ts
  useComponentVisible.test.ts
  utils.test.ts
feed/
  Avatar.test.tsx
  EmptyFeed.test.tsx        # already exists – keep & extend
  UnseenBadge.test.tsx
  NotificationIconButton.test.tsx
  NotificationCell.test.tsx
  Dropdown.test.tsx
  NotificationFeedHeader.test.tsx
  MarkAsRead.test.tsx
  NotificationFeed.test.tsx
  NotificationFeedContainer.test.tsx
  NotificationFeedPopover.test.tsx
guide/
  Banner.test.tsx
  BannerView.test.tsx
  Card.test.tsx
  CardView.test.tsx
  Modal.test.tsx
  ModalView.test.tsx
  helpers.test.ts
slack/
  SlackAuthButton.test.tsx
  SlackAuthContainer.test.tsx
  SlackChannelCombobox.test.tsx
  SlackAddChannelInput.test.tsx
  SlackIcon.test.tsx
  utils.test.ts
ms-teams/
  MsTeamsAuthButton.test.tsx
  MsTeamsAuthContainer.test.tsx
  MsTeamsChannelCombobox.test.tsx
  MsTeamsIcon.test.tsx
  utils.test.ts
barrels/
  publicApi.test.ts
test-utils/
  mocks.ts            # additional stubs (window.open, debounce, timers)
setup.ts              # exports vitest config overrides if needed
```

---

## 5 Work Breakdown

1. **Enhance `test-utils/` & `setup.ts`** – extend provider wrapper, global spies, fake timers toggle.
2. **Core Components & Hooks** – coverage ≈ 45 %.
3. **Feed UI** – push to ≈ 70 %.
4. **Guide Module** – ≈ 85 %.
5. **Slack Components / utils** – ≈ 93 %.
6. **Ms-Teams Components / utils** – ≈ 97 %.
7. **Barrel & stray lines** – final sweep to hit **100 %**.
8. **CI run** – `yarn workspace @knocklabs/react test --coverage`, patch any uncovered branches.

---

## 6 Risks & Mitigations

| Risk                               | Mitigation                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------- |
| Debounce / scroll timing flakiness | Fake timers; stub `debounce` to immediate call when not timing-critical.    |
| Window dimension APIs (centering)  | Spy & mock `window.innerWidth/Height` in util tests for deterministic math. |
| Provider context drift             | Centralize mocks in `test-utils/mocks.ts`; update once if API changes.      |
| Large DOM snapshots                | Prefer RTL queries & specific assert over full snapshots.                   |
| CI resource limits                 | Parallelize Vitest via `--threads`, avoid unnecessary JSDOM re-renders.     |

---

## 7 Success Criteria

- `yarn coverage` inside `packages/react` shows **100 % statements, branches, functions, lines**.
- No files outside `packages/react/test` modified.
- Tests finish in < 1 s on M1 locally, < 2 s in CI.
- All interactive components pass `vitest-axe` with zero violations.
- Code fully aligns with Telegraph/Knock component guidelines.
