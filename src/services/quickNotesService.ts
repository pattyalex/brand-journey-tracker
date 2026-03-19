import { fetchAll, createOne, updateOne, deleteOne } from './baseService';

export interface QuickNote {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export async function getUserQuickNotes(userId: string): Promise<QuickNote[]> {
  return fetchAll<QuickNote>('quick_notes', {
    userId,
    orderBy: 'created_at',
    ascending: false,
  });
}

export async function createQuickNote(
  userId: string,
  note: Pick<QuickNote, 'title' | 'content'>
): Promise<QuickNote> {
  return createOne<QuickNote>('quick_notes', {
    user_id: userId,
    title: note.title,
    content: note.content,
  });
}

export async function updateQuickNote(
  id: string,
  updates: Partial<Pick<QuickNote, 'title' | 'content'>>
): Promise<QuickNote> {
  return updateOne<QuickNote>('quick_notes', id, updates);
}

export async function deleteQuickNote(id: string): Promise<void> {
  await deleteOne('quick_notes', id);
}
