# React-Core – Comprehensive Test Coverage Plan

## Goal

- Achieve **100 % line & branch coverage** for everything inside `packages/react-core/src`.
- **Only** add / modify files under `packages/react-core/test`.
- Re-use existing mocks, fixtures, and helpers from the client package where possible.
- Follow the repository's component guidelines and quality standards.

---

## 1&nbsp;&nbsp;Current State Snapshot

| Area                    | Status                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| Test runner             | **Vitest** (JSDOM) with `setupTest.ts`                                                       |
| Assertion + DOM helpers | `@testing-library/react`, `@testing-library/jest-dom`                                        |
| Coverage baseline       | Core/Feed/Slack partially covered; other modules untested                                    |
| Missing areas           | Guide, i18n, ms-teams, remaining Slack hooks, feed `useFeedSettings`, all utility edge cases |

---

## 2&nbsp;&nbsp;Files / Modules to Cover

### Core

- `context/KnockProvider.tsx`
- `hooks/useStableOptions.ts`
- `hooks/useAuthenticatedKnockClient.ts`
- `utils.ts` & `constants.ts`

### Feed

- `context/KnockFeedProvider.tsx`
- `hooks/useNotifications.ts`
- `hooks/useNotificationStore.ts`
- `hooks/useFeedSettings.ts`

### Slack

- `context/KnockSlackProvider.tsx`
- `hooks/useSlackChannels.ts`
- `hooks/useConnectedSlackChannels.ts`
- `hooks/useSlackConnectionStatus.ts`

### Ms-Teams

- `context/KnockMsTeamsProvider.tsx`
- `hooks/useMsTeamsAuth.ts`
- `hooks/useMsTeamsTeams.ts`
- `hooks/useMsTeamsChannels.ts`
- `hooks/useConnectedMsTeamsChannels.ts`
- `hooks/useMsTeamsConnectionStatus.ts`

### Guide

- `context/KnockGuideProvider.tsx`
- `hooks/useGuide.ts`
- `hooks/useGuideContext.ts`

### i18n

- `context/KnockI18nProvider.tsx`
- `hooks/useTranslations.ts`
- `languages/*` (export correctness)

### Barrel / Public API

- `src/index.ts` and each module's `index.ts` – ensure forward exports.

---

## 3&nbsp;&nbsp;Testing Strategy

1. **General**
   - Vitest + RTL (`render`, `renderHook`).
   - Use `act()` and async helpers (`waitFor`, `findBy*`).
2. **Mocks & Fixtures**
   - Re-export stubs from `../../client/test/test-utils`.
   - Provide `test-utils/mocks.ts` to fake the Knock SDK (feeds, Slack, Ms-Teams) — mirrors the pattern in `packages/client/test`.
   - Mock date functions (`intlFormatDistance`, `parseISO`) → deterministic.
3. **Provider Components**
   - `TestWrapper` helper that mounts provider + consumer element that prints context state.
   - Assert re-render key logic and context propagation.
4. **Hooks with SWR / Zustand**
   - Mock Knock SDK promises for deterministic resolution.
   - For SWR `useSWRInfinite` – control `setSize` and page data.
   - Verify cleanup (`feedClient.dispose`) on unmount.
5. **Pure Functions**
   - Table-driven tests with edge cases & invalid input paths.

---

## 4&nbsp;&nbsp;Test File Structure (inside `react-core/test`)

```text
core/
  KnockProvider.test.tsx
  useStableOptions.test.ts
  useAuthenticatedKnockClient.test.ts
  utils.test.ts
test-utils/
  mocks.ts            # shared Knock SDK & ancillary mocks (pattern parity with client package)
  fixtures.ts?        # re-exported or thin-wrapper fixtures if needed
feed/
  KnockFeedProvider.test.tsx
  useNotifications.test.tsx
  useNotificationStore.test.tsx
  useFeedSettings.test.ts
slack/
  KnockSlackProvider.test.tsx
  useSlackChannels.test.tsx
  useConnectedSlackChannels.test.ts
  useSlackConnectionStatus.test.ts
ms-teams/
  KnockMsTeamsProvider.test.tsx
  useMsTeamsAuth.test.ts
  useMsTeamsTeams.test.ts
  useMsTeamsChannels.test.ts
  useConnectedMsTeamsChannels.test.ts
  useMsTeamsConnectionStatus.test.ts
guide/
  KnockGuideProvider.test.tsx
  useGuide.test.tsx
  useGuideContext.test.ts
i18n/
  KnockI18nProvider.test.tsx
  useTranslations.test.ts
  languages.test.ts
barrels/
  publicApi.test.ts
setup.ts
```

---

## 5&nbsp;&nbsp;Work Breakdown

1. **Foundations**: create shared mocks & `setup.ts` utilities.
2. **Core & utilities**: raise baseline coverage to ~60 %.
3. **Feed hooks & provider**: push to ~80 %.
4. **Slack hooks & provider**: ~90 %.
5. **Ms-Teams hooks & provider**: ~96 %.
6. **Guide & i18n + barrel tests**: reach 100 %.
7. **Coverage pass**: run `yarn coverage`, patch any uncovered branches.

---

## 6&nbsp;&nbsp;Risks & Mitigations

| Risk                  | Mitigation                                                                     |
| --------------------- | ------------------------------------------------------------------------------ |
| SDK interface drift   | Keep mocks typed with `Partial<T>` & update centrally in `__mocks__/knock.ts`. |
| Async store timing    | Use `waitFor` + fake timers or `vi.useFakeTimers` where needed.                |
| Clock-dependent utils | Freeze time with `vi.setSystemTime`.                                           |

---

## 7&nbsp;&nbsp;Success Criteria

- `yarn coverage` inside `packages/react-core` shows **100 %** statements, branches, functions, and lines.
- No changes outside `packages/react-core/test`.
- Tests are deterministic and fast (< 1 s typical run).
- Code adheres to repo guidelines and is well documented.
