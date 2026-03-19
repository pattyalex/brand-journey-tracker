// Shared types for HomePage widgets

export interface BrandDealDeliverable {
  id: string;
  title: string;
  contentType: string;
  submissionDeadline?: string;
  publishDeadline?: string;
  status: string;
  isPaid?: boolean;
  paymentAmount?: number;
}

export interface BrandDeal {
  id: string;
  brandName: string;
  status: 'inbound' | 'negotiating' | 'signed' | 'in-progress' | 'completed' | 'other';
  deliverables: BrandDealDeliverable[];
  totalFee: number;
  depositAmount: number;
  depositPaid: boolean;
  finalPaymentDueDate?: string;
  invoiceSent: boolean;
  paymentReceived: boolean;
  isArchived?: boolean;
}

export interface BrandDeadline {
  brandName: string;
  action: string;
  dueDate: Date;
  daysRemaining: number;
  isUrgent: boolean;
  contentType?: string;
}

export interface BrandDealsState {
  deadlines: BrandDeadline[];
  expectedPayments: number;
}

export interface PlannerItem {
  id: string;
  text: string;
  section: "morning" | "midday" | "afternoon" | "evening";
  isCompleted: boolean;
  date: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  location?: string;
  color?: string;
}

export interface Priority {
  id: number;
  text: string;
  isCompleted: boolean;
}

export interface ProductionCard {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  columnName?: string;
  isPinned?: boolean;
  platforms?: string[];
  formats?: string[];
  script?: string;
  hook?: string;
  status?: "to-start" | "needs-work" | "ready" | null;
  lastUpdated?: string;
  isCompleted?: boolean;
  schedulingStatus?: string;
  scheduledDate?: string;
  plannedDate?: string;
  pinnedOrder?: number;
}

export interface ContinueCreatingCard {
  id: string;
  title: string;
  stage: 'Edit' | 'Film' | 'Script' | 'Bank of Ideas';
  columnId: string;
  lastUpdated: Date;
}

export type GoalStatus = 'not-started' | 'somewhat-done' | 'great-progress' | 'completed';

export interface MonthlyGoal {
  id: number;
  text: string;
  status: GoalStatus;
  progressNote?: string;
}

export interface MonthlyGoalsData {
  [year: string]: {
    [month: string]: MonthlyGoal[];
  };
}

export interface ContentCalendarItem {
  id: string;
  text: string;
  section: "morning" | "midday" | "afternoon" | "evening";
  isCompleted: boolean;
  date: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  color?: string;
  isContentCalendar?: boolean;
}

export interface Habit {
  id: string;
  name: string;
  completedDates: string[];
  goal?: {
    target: number;
    period: 'week' | 'month';
  };
}

// Helper to get date string in same format as Planner (local timezone, not UTC)
export const getDateString = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
