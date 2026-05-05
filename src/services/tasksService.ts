import { supabase } from '@/lib/supabase';
import { Task, DailyNote } from '@/types/tasks';

const TASKS_TABLE = 'user_tasks';
const NOTES_TABLE = 'user_daily_notes';

// ── Tasks: DB rows match the Task interface closely (already snake_case) ──

interface DbTask {
  id: string;
  user_id: string;
  title: string;
  date: string;
  time: string | null;
  end_time: string | null;
  duration: string | null;
  tag: string | null;
  completed: boolean;
  parent_task_id: string | null;
  order_index: number;
  notes: string | null;
  dismissed: boolean;
  created_at: string;
  updated_at: string;
}

function dbToTask(row: DbTask): Task {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time,
    end_time: row.end_time,
    duration: row.duration,
    tag: row.tag,
    completed: row.completed,
    parent_task_id: row.parent_task_id,
    order_index: row.order_index,
    notes: row.notes,
    dismissed: row.dismissed || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function taskToDb(task: Task, userId: string): Record<string, unknown> {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    date: task.date,
    time: task.time,
    end_time: task.end_time,
    duration: task.duration,
    tag: task.tag,
    completed: task.completed,
    parent_task_id: task.parent_task_id,
    order_index: task.order_index,
    notes: task.notes,
    dismissed: task.dismissed || false,
    created_at: task.created_at,
    updated_at: task.updated_at,
  };
}

function taskUpdatesToDb(updates: Partial<Task>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.date !== undefined) row.date = updates.date;
  if (updates.time !== undefined) row.time = updates.time;
  if (updates.end_time !== undefined) row.end_time = updates.end_time;
  if (updates.duration !== undefined) row.duration = updates.duration;
  if (updates.tag !== undefined) row.tag = updates.tag;
  if (updates.completed !== undefined) row.completed = updates.completed;
  if (updates.parent_task_id !== undefined) row.parent_task_id = updates.parent_task_id;
  if (updates.order_index !== undefined) row.order_index = updates.order_index;
  if (updates.notes !== undefined) row.notes = updates.notes;
  if (updates.dismissed !== undefined) row.dismissed = updates.dismissed;
  return row;
}

// ── Tasks API ──

export async function fetchTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('[tasksService] fetchTasks error:', error);
    throw error;
  }

  return (data as DbTask[]).map(dbToTask);
}

export async function createTask(task: Task, userId: string): Promise<Task> {
  const row = taskToDb(task, userId);
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .insert([row])
    .select()
    .single();

  if (error) {
    console.error('[tasksService] createTask error:', error);
    throw error;
  }

  return dbToTask(data as DbTask);
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const row = taskUpdatesToDb(updates);
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[tasksService] updateTask error:', error);
    throw error;
  }

  return dbToTask(data as DbTask);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from(TASKS_TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[tasksService] deleteTask error:', error);
    throw error;
  }
}

export async function upsertTasks(tasks: Task[], userId: string): Promise<void> {
  if (tasks.length === 0) return;
  const rows = tasks.map(t => taskToDb(t, userId));
  const { error } = await supabase
    .from(TASKS_TABLE)
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('[tasksService] upsertTasks error:', error);
    throw error;
  }
}

// ── Daily Notes ──

interface DbDailyNote {
  id: string;
  user_id: string;
  date: string;
  content: string | null;
  updated_at: string;
}

function dbToNote(row: DbDailyNote): DailyNote {
  return {
    id: row.id,
    date: row.date,
    content: row.content,
    updated_at: row.updated_at,
  };
}

export async function fetchDailyNotes(userId: string): Promise<DailyNote[]> {
  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('[tasksService] fetchDailyNotes error:', error);
    throw error;
  }

  return (data as DbDailyNote[]).map(dbToNote);
}

export async function upsertDailyNote(note: DailyNote, userId: string): Promise<void> {
  const { error } = await supabase
    .from(NOTES_TABLE)
    .upsert([{
      id: note.id,
      user_id: userId,
      date: note.date,
      content: note.content,
      updated_at: note.updated_at,
    }], { onConflict: 'id' });

  if (error) {
    console.error('[tasksService] upsertDailyNote error:', error);
    throw error;
  }
}
