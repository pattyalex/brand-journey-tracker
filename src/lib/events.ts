export const EVENTS = {
  allTasksUpdated: 'allTasksUpdated',
  monthlyGoalsUpdated: 'monthlyGoalsUpdated',
  scheduledContentUpdated: 'scheduledContentUpdated',
  plannerDataUpdated: 'plannerDataUpdated',
  productionKanbanUpdated: 'productionKanbanUpdated',
} as const;

type EventName = (typeof EVENTS)[keyof typeof EVENTS];

type CustomEventHandler = (event: CustomEvent) => void;

export const emit = (
  target: Window | Document,
  name: EventName,
  detail?: any
): void => {
  const event = new CustomEvent(name, { detail });
  target.dispatchEvent(event);
};

export const on = (
  target: Window | Document,
  name: EventName,
  handler: CustomEventHandler
): (() => void) => {
  const wrappedHandler = (event: Event) => {
    handler(event as CustomEvent);
  };
  target.addEventListener(name, wrappedHandler);
  return () => target.removeEventListener(name, wrappedHandler);
};
