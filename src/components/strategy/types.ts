// Progress status types and colors for monthly goals
export type GoalProgressStatus = 'not-started' | 'somewhat-done' | 'great-progress' | 'completed';

export const progressStatuses: { value: GoalProgressStatus; label: string; color: string; bgColor: string; activeColor: string }[] = [
  { value: 'not-started', label: 'Not Started', color: '#9ca3af', bgColor: 'rgba(156, 163, 175, 0.15)', activeColor: '#6b7280' },
  { value: 'somewhat-done', label: 'On It', color: '#d4a520', bgColor: 'rgba(212, 165, 32, 0.15)', activeColor: '#b8860b' },
  { value: 'great-progress', label: 'Great Progress', color: '#7cb87c', bgColor: 'rgba(124, 184, 124, 0.15)', activeColor: '#5a9a5a' },
  { value: 'completed', label: 'Fully Completed!', color: '#5a8a5a', bgColor: '#5a8a5a', activeColor: '#ffffff' },
];

export type GoalStatus = 'not-started' | 'somewhat-done' | 'great-progress' | 'completed';

export interface Goal {
  id: string;
  text: string;
  status: GoalStatus;
  progressNote?: string;
  progress?: { current: number; target: number };
  linkedGoalId?: string; // For monthly goals to link to annual goals
}

export interface MonthlyGoalsData {
  [year: string]: {
    [month: string]: Goal[];
  };
}

export const monthShortToFull: { [key: string]: string } = {
  "Jan": "January", "Feb": "February", "Mar": "March", "Apr": "April",
  "May": "May", "Jun": "June", "Jul": "July", "Aug": "August",
  "Sep": "September", "Oct": "October", "Nov": "November", "Dec": "December"
};
