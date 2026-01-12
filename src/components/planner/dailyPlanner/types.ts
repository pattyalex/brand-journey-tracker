export type PlannerView = 'today' | 'week' | 'month' | 'day' | 'calendar';

export interface TimezoneOption {
  label: string;
  value: string;
  offset: string;
  name: string;
}
