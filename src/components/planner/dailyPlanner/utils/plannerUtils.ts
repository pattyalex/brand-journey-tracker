import { PlannerItem } from "@/types/planner";
import { TimezoneOption } from "../types";

export const getDateString = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const sortTasksBySection = (items: PlannerItem[]): PlannerItem[] => {
  const sectionOrder: { [key: string]: number } = {
    'morning': 0,
    'midday': 1,
    'afternoon': 2,
    'evening': 3
  };

  return [...items].sort((a, b) => {
    // If both have order values, sort by order
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    // If only one has an order, prioritize the one with order
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;

    // Fall back to section order if no manual order is set
    return (sectionOrder[a.section] ?? 999) - (sectionOrder[b.section] ?? 999);
  });
};

// Helper function to update order fields for all items in array
export const updateItemOrders = (items: PlannerItem[]): PlannerItem[] => {
  return items.map((item, index) => ({
    ...item,
    order: index
  }));
};

// Common timezones
export const TIMEZONES: TimezoneOption[] = [
  { label: 'PST', value: 'America/Los_Angeles', offset: 'GMT-08', name: 'Pacific Standard Time' },
  { label: 'MST', value: 'America/Denver', offset: 'GMT-07', name: 'Mountain Standard Time' },
  { label: 'CST', value: 'America/Chicago', offset: 'GMT-06', name: 'Central Standard Time' },
  { label: 'EST', value: 'America/New_York', offset: 'GMT-05', name: 'Eastern Standard Time' },
  { label: 'GMT', value: 'Europe/London', offset: 'GMT+00', name: 'Greenwich Mean Time' },
  { label: 'CET', value: 'Europe/Paris', offset: 'GMT+01', name: 'Central European Time' },
  { label: 'IST', value: 'Asia/Kolkata', offset: 'GMT+05:30', name: 'India Standard Time' },
  { label: 'JST', value: 'Asia/Tokyo', offset: 'GMT+09', name: 'Japan Standard Time' },
  { label: 'AEST', value: 'Australia/Sydney', offset: 'GMT+10', name: 'Australian Eastern Standard Time' },
];
