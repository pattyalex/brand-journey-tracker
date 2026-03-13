import { supabase } from '@/lib/supabase';

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
  const { data, error } = await supabase
    .from('research_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching research items:', error);
    throw error;
  }

  return data || [];
}

export async function createResearchItem(
  userId: string,
  item: Pick<ResearchItem, 'title' | 'content' | 'tags'>
): Promise<ResearchItem> {
  const { data, error } = await supabase
    .from('research_items')
    .insert({
      user_id: userId,
      title: item.title,
      content: item.content,
      tags: item.tags || [],
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating research item:', error);
    throw error;
  }

  return data;
}

export async function updateResearchItem(
  id: string,
  updates: Partial<Pick<ResearchItem, 'title' | 'content' | 'tags'>>
): Promise<ResearchItem> {
  const { data, error } = await supabase
    .from('research_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating research item:', error);
    throw error;
  }

  return data;
}

export async function deleteResearchItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('research_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting research item:', error);
    throw error;
  }
}

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
