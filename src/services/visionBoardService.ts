import { supabase } from '@/lib/supabase';
import { fetchAll, createOne, updateOne, deleteOne } from './baseService';

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
  return fetchAll<VisionBoardItem>('vision_board_items', {
    userId,
    orderBy: 'display_order',
    ascending: true,
  });
}

export async function createVisionBoardItem(
  userId: string,
  item: Pick<VisionBoardItem, 'title' | 'description' | 'image_url' | 'display_order'>
): Promise<VisionBoardItem> {
  return createOne<VisionBoardItem>('vision_board_items', {
    user_id: userId,
    title: item.title,
    description: item.description,
    image_url: item.image_url,
    display_order: item.display_order,
  });
}

export async function updateVisionBoardItem(
  id: string,
  updates: Partial<Pick<VisionBoardItem, 'title' | 'description' | 'image_url' | 'display_order'>>
): Promise<VisionBoardItem> {
  return updateOne<VisionBoardItem>('vision_board_items', id, updates);
}

export async function deleteVisionBoardItem(id: string): Promise<void> {
  await deleteOne('vision_board_items', id);
}

// Uses parallel updates per item - non-standard, keep raw Supabase
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
