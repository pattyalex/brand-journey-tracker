import { Task, DailyNote } from '@/types/tasks';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getSeedTasks(): Task[] {
  return [];
}

export function getSeedDailyNote(): DailyNote {
  const today = todayStr();
  return {
    id: '',
    date: today,
    content: '',
    updated_at: new Date().toISOString(),
  };
}
