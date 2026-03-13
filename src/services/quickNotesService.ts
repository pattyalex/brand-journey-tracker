import { supabase } from '@/lib/supabase';

export interface QuickNote {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export async function getUserQuickNotes(userId: string): Promise<QuickNote[]> {
  const { data, error } = await supabase
    .from('quick_notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quick notes:', error);
    throw error;
  }

  return data || [];
}

export async function createQuickNote(
  userId: string,
  note: Pick<QuickNote, 'title' | 'content'>
): Promise<QuickNote> {
  const { data, error } = await supabase
    .from('quick_notes')
    .insert({
      user_id: userId,
      title: note.title,
      content: note.content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating quick note:', error);
    throw error;
  }

  return data;
}

export async function updateQuickNote(
  id: string,
  updates: Partial<Pick<QuickNote, 'title' | 'content'>>
): Promise<QuickNote> {
  const { data, error } = await supabase
    .from('quick_notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating quick note:', error);
    throw error;
  }

  return data;
}

export async function deleteQuickNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('quick_notes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting quick note:', error);
    throw error;
  }
}
