import { supabase } from '@/lib/supabase';

export interface VisionBoardItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export async function getUserVisionBoardItems(userId: string): Promise<VisionBoardItem[]> {
  const { data, error } = await supabase
    .from('vision_board_items')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching vision board items:', error);
    throw error;
  }

  return data || [];
}

export async function createVisionBoardItem(
  userId: string,
  item: Pick<VisionBoardItem, 'title' | 'description' | 'image_url' | 'display_order'>
): Promise<VisionBoardItem> {
  const { data, error } = await supabase
    .from('vision_board_items')
    .insert({
      user_id: userId,
      title: item.title,
      description: item.description,
      image_url: item.image_url,
      display_order: item.display_order,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating vision board item:', error);
    throw error;
  }

  return data;
}

export async function updateVisionBoardItem(
  id: string,
  updates: Partial<Pick<VisionBoardItem, 'title' | 'description' | 'image_url' | 'display_order'>>
): Promise<VisionBoardItem> {
  const { data, error } = await supabase
    .from('vision_board_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating vision board item:', error);
    throw error;
  }

  return data;
}

export async function deleteVisionBoardItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('vision_board_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting vision board item:', error);
    throw error;
  }
}

export async function reorderVisionBoardItems(
  items: { id: string; display_order: number }[]
): Promise<void> {
  const updates = items.map(item =>
    supabase
      .from('vision_board_items')
      .update({ display_order: item.display_order })
      .eq('id', item.id)
  );

  await Promise.all(updates);
}
