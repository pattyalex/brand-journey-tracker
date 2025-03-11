
import { addDays, addWeeks, addMonths, format, parseISO } from "date-fns";
import { PlannerItem } from "@/types/planner";

export type RecurrencePattern = "none" | "daily" | "weekly" | "monthly";

export interface RecurrenceRule {
  pattern: RecurrencePattern;
  endDate?: string; // ISO date string YYYY-MM-DD
  occurrences?: number; // Number of occurrences
}

// Generate future occurrences of a recurring event
export const generateRecurringInstances = (
  baseItem: PlannerItem,
  fromDate: string,
  toDate: string,
  excludeDates: string[] = []
): PlannerItem[] => {
  if (!baseItem.recurrenceRule || baseItem.recurrenceRule.pattern === "none") {
    return [];
  }

  const rule = baseItem.recurrenceRule;
  const instances: PlannerItem[] = [];
  const startDateObj = parseISO(baseItem.date);
  const fromDateObj = parseISO(fromDate);
  const toDateObj = parseISO(toDate);
  const endDateObj = rule.endDate ? parseISO(rule.endDate) : null;

  let currentDate = startDateObj;
  let occurrenceCount = 0;

  while (
    currentDate <= toDateObj &&
    (!endDateObj || currentDate <= endDateObj) &&
    (!rule.occurrences || occurrenceCount < rule.occurrences)
  ) {
    // Only add dates that are after the fromDate and not in the exclude list
    const currentDateStr = format(currentDate, "yyyy-MM-dd");
    if (
      currentDate >= fromDateObj &&
      currentDate <= toDateObj &&
      !excludeDates.includes(currentDateStr) &&
      currentDateStr !== baseItem.date // Don't duplicate the original event
    ) {
      const instance: PlannerItem = {
        ...baseItem,
        id: `${baseItem.id}-${currentDateStr}`,
        date: currentDateStr,
        isRecurringInstance: true,
        isCompleted: false, // Reset completion status for new instances
      };
      instances.push(instance);
    }

    // Move to next occurrence based on recurrence pattern
    switch (rule.pattern) {
      case "daily":
        currentDate = addDays(currentDate, 1);
        break;
      case "weekly":
        currentDate = addWeeks(currentDate, 1);
        break;
      case "monthly":
        currentDate = addMonths(currentDate, 1);
        break;
      default:
        break;
    }

    occurrenceCount++;
  }

  return instances;
};

// Generate a single future occurrence
export const generateNextOccurrence = (
  baseItem: PlannerItem,
  excludeDates: string[] = []
): PlannerItem | null => {
  if (!baseItem.recurrenceRule || baseItem.recurrenceRule.pattern === "none") {
    return null;
  }

  const rule = baseItem.recurrenceRule;
  const startDateObj = parseISO(baseItem.date);
  const endDateObj = rule.endDate ? parseISO(rule.endDate) : null;

  if (endDateObj && startDateObj > endDateObj) {
    return null;
  }

  let nextDate;
  switch (rule.pattern) {
    case "daily":
      nextDate = addDays(startDateObj, 1);
      break;
    case "weekly":
      nextDate = addWeeks(startDateObj, 1);
      break;
    case "monthly":
      nextDate = addMonths(startDateObj, 1);
      break;
    default:
      return null;
  }

  const nextDateStr = format(nextDate, "yyyy-MM-dd");
  if (excludeDates.includes(nextDateStr)) {
    return null;
  }

  return {
    ...baseItem,
    id: `${baseItem.id}-${nextDateStr}`,
    date: nextDateStr,
    isRecurringInstance: true,
    isCompleted: false, // Reset completion status for new instances
  };
};

// Check if two recurring rules are equal
export const areRecurrenceRulesEqual = (
  rule1?: RecurrenceRule,
  rule2?: RecurrenceRule
): boolean => {
  if (!rule1 && !rule2) return true;
  if (!rule1 || !rule2) return false;

  return (
    rule1.pattern === rule2.pattern &&
    rule1.endDate === rule2.endDate &&
    rule1.occurrences === rule2.occurrences
  );
};
