# Storage Wrapper

## StorageKeys

Static keys are centralized in `src/lib/storage.ts` under `StorageKeys`.

## Migrated keys in this PR

- `hasCompletedOnboarding`
- `hasSeenGoalsOnboarding`
- `user`
- `selectedTimezone`
- `todayZoomLevel`
- `plannerLastAccessDate`
- `todayScrollPosition`
- `weeklyScrollPosition`
- `plannerData`
- `globalPlannerData`
- `allTasks`
- `scheduledContent`
- `readyToScheduleContent`
- `monthlyGoalsData`
- `restoredToIdeasContent`
- `contentRestorationLog`
- `openai_api_key`
- `openai_api_key_masked`
- `openai_key_set`

## Tricky behavior preserved

- Boolean flags (e.g., `openai_key_set`) are still stored and compared as the string values "true"/"false".
- Call sites that previously parsed JSON manually still do so; the wrapper only replaces raw `localStorage` access.
- Event dispatch order remains unchanged: writes happen before `allTasksUpdated`, `monthlyGoalsUpdated`, and `scheduledContentUpdated` are fired.

## Audit notes

- Direct localStorage usage count (before/after migration): 61 → 0 occurrences outside `src/lib/storage.ts`.
- Default semantics are preserved: `getString` only falls back on `null`/missing keys, while call sites that previously used `||` defaults (e.g., `selectedTimezone` and scroll/zoom fallbacks) still apply the same `||` logic at the call site.

## Additional keys migrated in this pass

- `journalEntries` (JSON string)
- `lastAccessDate` (string)
- `growthGoals` (JSON string)
- `shortTermGoals` (JSON string)
- `longTermGoals` (JSON string)
- `sidebarMenuItems` (JSON string)
- `sidebarState` (string)
- `sidebar-expanded-${title}` (JSON string via `sidebarExpanded`)
- `collabBrands` (JSON string)
- `collabColumns` (JSON string)
- `contentPillars` (JSON string)
- `contentFormats` (JSON string)
- `content-formats-${pillarId}` (JSON string via `contentFormatsByPillar`)
- `pillars` (JSON string)
- `customHooks` (JSON string)
- `platformUsernames` (JSON string)
- `firecrawl_api_key` (string)
- `visionBoardData` (JSON string)
- `visionBoardItems` (JSON string)
- `quickNotes` (JSON string)
- `researchItems` (JSON string)
- `bankOfIdeas` (JSON string)
- `productionKanban` (JSON string)

## Enforcement

ESLint now forbids direct `localStorage`/`window.localStorage`/`globalThis.localStorage` usage with the message “Use src/lib/storage.ts for storage access.” The storage helper file itself is exempt. Run `npm run lint` to validate.
