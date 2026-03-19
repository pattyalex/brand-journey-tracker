import { supabase } from '@/lib/supabase';
import { fetchAll, createOne, updateOne, deleteOne } from './baseService';

export interface ResearchItem {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export async function getUserResearchItems(userId: string): Promise<ResearchItem[]> {
  return fetchAll<ResearchItem>('research_items', {
    userId,
    orderBy: 'created_at',
    ascending: false,
  });
}

export async function createResearchItem(
  userId: string,
  item: Pick<ResearchItem, 'title' | 'content' | 'tags'>
): Promise<ResearchItem> {
  return createOne<ResearchItem>('research_items', {
    user_id: userId,
    title: item.title,
    content: item.content,
    tags: item.tags || [],
  });
}

export async function updateResearchItem(
  id: string,
  updates: Partial<Pick<ResearchItem, 'title' | 'content' | 'tags'>>
): Promise<ResearchItem> {
  return updateOne<ResearchItem>('research_items', id, updates);
}

export async function deleteResearchItem(id: string): Promise<void> {
  await deleteOne('research_items', id);
}

// Uses .contains() which is non-standard - keep raw Supabase query
export async function searchResearchItemsByTag(userId: string, tag: string): Promise<ResearchItem[]> {
  const { data, error } = await supabase
    .from('research_items')
    .select('*')
    .eq('user_id', userId)
    .contains('tags', [tag])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching research items:', error);
    throw error;
  }

  return data || [];
}
