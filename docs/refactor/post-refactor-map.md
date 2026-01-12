# Post-Refactor Map

## Folder tree (refactor focus)

```
src/
  components/
    planner/
      DailyPlanner.tsx
      dailyPlanner/
        components/
          AllTasksSidebar.tsx
          CalendarView.tsx
          PlannerHeader.tsx
          TaskDialog.tsx
          TodayView.tsx
          WeekView.tsx
        hooks/
          usePlannerActions.ts
          usePlannerPersistence.ts
          usePlannerState.ts
        utils/
          plannerUtils.ts
        types.ts
  pages/
    Production.tsx
    production/
      components/
        BrainDumpGuidanceDialog.tsx
        ScriptEditorDialog.tsx
      utils/
        productionConstants.ts
        productionHelpers.ts
      types.ts
  lib/
    events.ts
    storage.ts
```

## Responsibility map

### Planner
- `src/components/planner/DailyPlanner.tsx`: UI orchestrator; composes planner hooks + view components.
- `src/components/planner/dailyPlanner/components/*`: Pure UI components (presentational, view layout, dialog rendering).
- `src/components/planner/dailyPlanner/hooks/usePlannerState.ts`: State container and derived state for planner.
- `src/components/planner/dailyPlanner/hooks/usePlannerPersistence.ts`: Persistence + cross-tab/event wiring.
- `src/components/planner/dailyPlanner/hooks/usePlannerActions.ts`: Event handlers and mutations for planner interactions.
- `src/components/planner/dailyPlanner/utils/plannerUtils.ts`: Pure utilities (formatting, date helpers, derived computations).
- `src/components/planner/dailyPlanner/types.ts`: Planner types and shared interfaces.

### Production
- `src/pages/Production.tsx`: Page container for Production flow; owns state and wires dialogs.
- `src/pages/production/components/*`: Presentational dialog components for script editor + brain dump guidance.
- `src/pages/production/utils/productionConstants.ts`: Column constants and default board state.
- `src/pages/production/utils/productionHelpers.ts`: Pure helper utilities for tag colors + angle templates.
- `src/pages/production/types.ts`: Production card + column types.

## Allowed cross-cutting modules

- `src/lib/storage.ts` for persistence (storage wrapper + keys).
- `src/lib/events.ts` for cross-component events (EVENTS + emit/on helpers).

## Do-not-reintroduce list

- No direct `localStorage` access outside `src/lib/storage.ts`.
- No magic event strings; use `EVENTS.*` only.
- Avoid rebuilding “god” components; keep logic in hooks/utils and keep UI in components.
