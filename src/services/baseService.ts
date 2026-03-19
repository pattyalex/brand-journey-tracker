import { supabase } from '@/lib/supabase';

/**
 * Base Service Layer
 * Generic Supabase CRUD helpers to eliminate repeated boilerplate
 * across all service files.
 */

export interface FetchAllOptions {
  userId?: string;
  orderBy?: string;
  ascending?: boolean;
  filters?: Record<string, unknown>;
}

/**
 * Fetch all rows from a table with optional user_id filter, ordering, and extra filters.
 */
export async function fetchAll<T>(
  table: string,
  options: FetchAllOptions = {}
): Promise<T[]> {
  let query = supabase.from(table).select('*');

  if (options.userId) {
    query = query.eq('user_id', options.userId);
  }

  if (options.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      query = query.eq(key, value);
    }
  }

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? true });
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching from ${table}:`, error);
    throw error;
  }

  return (data || []) as T[];
}

/**
 * Fetch a single row by id. Returns null if not found (PGRST116).
 */
export async function fetchOne<T>(
  table: string,
  id: string
): Promise<T | null> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error(`Error fetching from ${table}:`, error);
    throw error;
  }

  return data as T;
}

/**
 * Insert a single row and return it.
 */
export async function createOne<T>(
  table: string,
  data: Record<string, unknown>
): Promise<T> {
  const { data: inserted, error } = await supabase
    .from(table)
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error(`Error creating in ${table}:`, error);
    throw error;
  }

  return inserted as T;
}

/**
 * Update a single row by id and return it.
 */
export async function updateOne<T>(
  table: string,
  id: string,
  data: Record<string, unknown>
): Promise<T> {
  const { data: updated, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating in ${table}:`, error);
    throw error;
  }

  return updated as T;
}

/**
 * Delete a single row by id.
 */
export async function deleteOne(
  table: string,
  id: string
): Promise<boolean> {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting from ${table}:`, error);
    throw error;
  }

  return true;
}

/**
 * Insert multiple rows and return them.
 */
export async function createMany<T>(
  table: string,
  rows: Record<string, unknown>[]
): Promise<T[]> {
  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from(table)
    .insert(rows)
    .select();

  if (error) {
    console.error(`Error batch creating in ${table}:`, error);
    throw error;
  }

  return (data || []) as T[];
}

/**
 * Update a single row by a custom column (not 'id') and return it.
 * Useful for tables that use user_id as the lookup key (e.g., user_preferences, user_strategy).
 */
export async function updateOneBy<T>(
  table: string,
  column: string,
  value: string,
  data: Record<string, unknown>
): Promise<T> {
  const { data: updated, error } = await supabase
    .from(table)
    .update(data)
    .eq(column, value)
    .select()
    .single();

  if (error) {
    console.error(`Error updating in ${table}:`, error);
    throw error;
  }

  return updated as T;
}

/**
 * Fetch a single row by a custom column (not 'id'). Returns null if not found.
 */
export async function fetchOneBy<T>(
  table: string,
  column: string,
  value: string
): Promise<T | null> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq(column, value)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error(`Error fetching from ${table}:`, error);
    throw error;
  }

  return data as T;
}
