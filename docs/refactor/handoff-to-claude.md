# Handoff to Claude (Post-Refactor)

## Rules for new feature work

1. Use `src/lib/storage.ts` (`StorageKeys`, `getString`, `setString`, `removeKey`) for all persistence.
2. Use `src/lib/events.ts` for cross-component events (`EVENTS`, `emit`, `on`). No raw event strings.
3. Respect invariants in `docs/refactor/invariants.md` before touching planner, onboarding, or storage behavior.
4. Keep planner logic in hooks (`usePlannerState`, `usePlannerActions`, `usePlannerPersistence`) and keep UI in `dailyPlanner/components/*`.
5. Keep Production dialogs presentational; state stays in `src/pages/Production.tsx`.
6. Avoid adding new global state or ad-hoc `CustomEvent` names; centralize in `events.ts` when required.
7. Avoid direct `localStorage` usage and do not bypass the storage wrapper.
8. Do not reintroduce giant “god” components; prefer small, single-responsibility files.
9. Preserve existing key names/semantics in storage; do not change persistence formats without explicit migration.
10. Do not remove existing event emissions or ordering (write → emit) used by the refactor.

## Key docs

- `docs/refactor/invariants.md`
- `docs/refactor/smoke-test.md`
- `docs/refactor/post-refactor-map.md`
- `docs/refactor/storage-wrapper.md`
- `docs/refactor/events.md`
