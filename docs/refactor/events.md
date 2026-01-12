# Events

## allTasksUpdated

- Meaning: All-tasks list was updated.
- Emitted by: `src/pages/HomePage.tsx` via `emit(window, EVENTS.allTasksUpdated, updatedTasks)`.
- Listened by: `src/components/planner/DailyPlanner.tsx` via `on(window, EVENTS.allTasksUpdated, ...)`.
- Payload: `detail` is the updated tasks array.

## monthlyGoalsUpdated

- Meaning: Monthly goals data changed.
- Emitted by: `src/pages/HomePage.tsx` via `emit(window, EVENTS.monthlyGoalsUpdated, monthlyGoalsData)`.
- Listened by: `src/pages/StrategyGrowth.tsx` via `on(window, EVENTS.monthlyGoalsUpdated, ...)`.
- Payload: `detail` is the updated monthly goals data object.

## scheduledContentUpdated

- Meaning: Scheduled content list changed.
- Emitted by: `src/hooks/useCalendarState.ts` and `src/components/planner/DailyPlanner.tsx` via `emit(window, EVENTS.scheduledContentUpdated, scheduledContent)`.
- Listened by: `src/components/planner/DailyPlanner.tsx` via `on(window, EVENTS.scheduledContentUpdated, ...)`.
- Payload: `detail` is the updated scheduled content array.
