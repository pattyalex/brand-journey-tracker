import { supabase } from '@/lib/supabase';
import { ContentItem } from '@/types/content';

/**
 * Content Pillars Service
 * Manages content organization pillars
 */

export interface ContentPillar {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color?: string;
  position?: number;
  writing_space?: string;
  created_at?: string;
  updated_at?: string;
}

// Create a new content pillar
export const createContentPillar = async (
  userId: string,
  pillarData: {
    name: string;
    description?: string;
    color?: string;
    position?: number;
  }
) => {
  const { data, error } = await supabase
    .from('content_pillars')
    .insert([
      {
        user_id: userId,
        ...pillarData,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating content pillar:', error);
    throw error;
  }

  return data as ContentPillar;
};

// Get all content pillars for a user
export const getUserContentPillars = async (userId: string) => {
  const { data, error } = await supabase
    .from('content_pillars')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching content pillars:', error);
    throw error;
  }

  return data as ContentPillar[];
};

// Update a content pillar
export const updateContentPillar = async (
  pillarId: string,
  updates: Partial<ContentPillar>
) => {
  const { data, error } = await supabase
    .from('content_pillars')
    .update(updates)
    .eq('id', pillarId)
    .select()
    .single();

  if (error) {
    console.error('Error updating content pillar:', error);
    throw error;
  }

  return data as ContentPillar;
};

// Delete a content pillar
export const deleteContentPillar = async (pillarId: string) => {
  const { error } = await supabase
    .from('content_pillars')
    .delete()
    .eq('id', pillarId);

  if (error) {
    console.error('Error deleting content pillar:', error);
    throw error;
  }
};

/**
 * Content Items Service
 * Manages individual content pieces
 */

// Helper to convert ContentItem to database format
const contentItemToDb = (userId: string, pillarId: string, item: Omit<ContentItem, 'id'>) => {
  return {
    user_id: userId,
    pillar_id: pillarId,
    title: item.title,
    description: item.description || '',
    url: item.url || '', // Serialized JSON with script, visualNotes, shootDetails, caption
    format: item.format || 'text',
    tags: item.tags || [],
    platforms: item.platforms || [],
    scheduled_date: item.scheduledDate?.toISOString() || null,
    status: item.status || 'idea',
    shoot_details: item.shootDetails || '',
    caption: item.caption || '',
    bucket_id: item.bucketId || '',
    original_pillar_id: item.originalPillarId || null,
    is_restored: item.isRestored || false,
  };
};

// Helper to convert database format to ContentItem
const dbToContentItem = (dbItem: any): ContentItem => {
  return {
    id: dbItem.id,
    title: dbItem.title,
    description: dbItem.description || '',
    url: dbItem.url || '',
    format: dbItem.format || 'text',
    dateCreated: new Date(dbItem.created_at),
    tags: dbItem.tags || [],
    platforms: dbItem.platforms || [],
    scheduledDate: dbItem.scheduled_date ? new Date(dbItem.scheduled_date) : undefined,
    status: dbItem.status || 'idea',
    shootDetails: dbItem.shoot_details || '',
    caption: dbItem.caption || '',
    createdAt: new Date(dbItem.created_at),
    bucketId: dbItem.bucket_id || '',
    originalPillarId: dbItem.original_pillar_id || '',
    isRestored: dbItem.is_restored || false,
  };
};

// Create a new content item
export const createContentItem = async (
  userId: string,
  pillarId: string,
  contentItem: Omit<ContentItem, 'id'>
) => {
  const dbItem = contentItemToDb(userId, pillarId, contentItem);

  const { data, error } = await supabase
    .from('content_items')
    .insert([dbItem])
    .select()
    .single();

  if (error) {
    console.error('Error creating content item:', error);
    throw error;
  }

  return dbToContentItem(data);
};

// Get all content items for a specific pillar
export const getPillarContentItems = async (userId: string, pillarId: string) => {
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('user_id', userId)
    .eq('pillar_id', pillarId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pillar content items:', error);
    throw error;
  }

  return data.map(dbToContentItem);
};

// Get all content items for a user
export const getUserContentItems = async (userId: string) => {
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user content items:', error);
    throw error;
  }

  return data.map(dbToContentItem);
};

// Update a content item
export const updateContentItem = async (
  contentId: string,
  updates: Partial<ContentItem>
) => {
  // Convert ContentItem updates to database format
  const dbUpdates: any = {};

  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.url !== undefined) dbUpdates.url = updates.url;
  if (updates.format !== undefined) dbUpdates.format = updates.format;
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
  if (updates.platforms !== undefined) dbUpdates.platforms = updates.platforms;
  if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate?.toISOString();
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.shootDetails !== undefined) dbUpdates.shoot_details = updates.shootDetails;
  if (updates.caption !== undefined) dbUpdates.caption = updates.caption;
  if (updates.bucketId !== undefined) dbUpdates.bucket_id = updates.bucketId;
  if (updates.originalPillarId !== undefined) dbUpdates.original_pillar_id = updates.originalPillarId;
  if (updates.isRestored !== undefined) dbUpdates.is_restored = updates.isRestored;

  const { data, error } = await supabase
    .from('content_items')
    .update(dbUpdates)
    .eq('id', contentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating content item:', error);
    throw error;
  }

  return dbToContentItem(data);
};

// Move content item to different pillar
export const moveContentItem = async (contentId: string, newPillarId: string) => {
  const { data, error } = await supabase
    .from('content_items')
    .update({ pillar_id: newPillarId })
    .eq('id', contentId)
    .select()
    .single();

  if (error) {
    console.error('Error moving content item:', error);
    throw error;
  }

  return dbToContentItem(data);
};

// Delete a content item
export const deleteContentItem = async (contentId: string) => {
  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('id', contentId);

  if (error) {
    console.error('Error deleting content item:', error);
    throw error;
  }
};

// Get content items by status (e.g., 'scheduled', 'published', 'idea')
export const getContentItemsByStatus = async (userId: string, status: string) => {
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching content items by status:', error);
    throw error;
  }

  return data.map(dbToContentItem);
};

// Get scheduled content for calendar view
export const getScheduledContent = async (userId: string, startDate?: Date, endDate?: Date) => {
  let query = supabase
    .from('content_items')
    .select('*')
    .eq('user_id', userId)
    .not('scheduled_date', 'is', null)
    .order('scheduled_date', { ascending: true });

  if (startDate) {
    query = query.gte('scheduled_date', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('scheduled_date', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching scheduled content:', error);
    throw error;
  }

  return data.map(dbToContentItem);
};

// Batch create content items (useful for migration from localStorage)
export const batchCreateContentItems = async (
  userId: string,
  pillarId: string,
  contentItems: Omit<ContentItem, 'id'>[]
) => {
  const dbItems = contentItems.map(item => contentItemToDb(userId, pillarId, item));

  const { data, error } = await supabase
    .from('content_items')
    .insert(dbItems)
    .select();

  if (error) {
    console.error('Error batch creating content items:', error);
    throw error;
  }

  return data.map(dbToContentItem);
};
