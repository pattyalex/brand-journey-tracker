export const EVENTS = {
  allTasksUpdated: 'allTasksUpdated',
  monthlyGoalsUpdated: 'monthlyGoalsUpdated',
  scheduledContentUpdated: 'scheduledContentUpdated',
} as const;

type EventName = (typeof EVENTS)[keyof typeof EVENTS];

type EventHandler = (event: Event) => void;

export const emit = (
  target: Window | Document,
  name: EventName,
  detail?: any
): void => {
  target.dispatchEvent(new CustomEvent(name, { detail }));
};

export const on = (
  target: Window | Document,
  name: EventName,
  handler: EventHandler
): (() => void) => {
  target.addEventListener(name, handler);
  return () => target.removeEventListener(name, handler);
};
