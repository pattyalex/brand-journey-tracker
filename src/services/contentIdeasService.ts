import { supabase } from '@/lib/supabase';

/**
 * Content Ideas Service
 * Manages content ideas / bank of ideas using Supabase
 */

// TypeScript Interfaces
export interface ContentIdea {
  id: string;
  userId: string;
  pillarId?: string;
  title: string;
  description?: string;
  source: 'bank-of-ideas' | 'quick-idea' | 'ai-generated' | 'repurposed' | 'other';
  isPinned: boolean;
  isArchived: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Database row type
interface DbContentIdea {
  id: string;
  user_id: string;
  pillar_id: string | null;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  source: string | null;
  is_pinned: boolean;
  is_archived: boolean;
  metadata: Record<string, unknown>;
}

// =====================================================
// Data Transformation Helpers
// =====================================================

const dbToContentIdea = (db: DbContentIdea): ContentIdea => ({
  id: db.id,
  userId: db.user_id,
  pillarId: db.pillar_id || undefined,
  title: db.title,
  description: db.description || undefined,
  source: (db.source || 'other') as ContentIdea['source'],
  isPinned: db.is_pinned || false,
  isArchived: db.is_archived || false,
  metadata: db.metadata || {},
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

const contentIdeaToDb = (userId: string, idea: Omit<ContentIdea, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => ({
  user_id: userId,
  pillar_id: idea.pillarId || null,
  title: idea.title,
  description: idea.description || null,
  source: idea.source || 'other',
  is_pinned: idea.isPinned || false,
  is_archived: idea.isArchived || false,
  metadata: idea.metadata || {},
});

// =====================================================
// Content Ideas CRUD
// =====================================================

// Get all content ideas for a user
export const getUserContentIdeas = async (userId: string): Promise<ContentIdea[]> => {
  const { data, error } = await supabase
    .from('content_ideas')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching content ideas:', error);
    throw error;
  }

  return (data || []).map(i => dbToContentIdea(i as DbContentIdea));
};

// Get archived content ideas
export const getArchivedContentIdeas = async (userId: string): Promise<ContentIdea[]> => {
  const { data, error } = await supabase
    .from('content_ideas')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', true)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching archived content ideas:', error);
    throw error;
  }

  return (data || []).map(i => dbToContentIdea(i as DbContentIdea));
};

// Get pinned content ideas
export const getPinnedContentIdeas = async (userId: string): Promise<ContentIdea[]> => {
  const { data, error } = await supabase
    .from('content_ideas')
    .select('*')
    .eq('user_id', userId)
    .eq('is_pinned', true)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching pinned content ideas:', error);
    throw error;
  }

  return (data || []).map(i => dbToContentIdea(i as DbContentIdea));
};

// Get content ideas by pillar
export const getContentIdeasByPillar = async (
  userId: string,
  pillarId: string
): Promise<ContentIdea[]> => {
  const { data, error } = await supabase
    .from('content_ideas')
    .select('*')
    .eq('user_id', userId)
    .eq('pillar_id', pillarId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching content ideas by pillar:', error);
    throw error;
  }

  return (data || []).map(i => dbToContentIdea(i as DbContentIdea));
};

// Get content ideas by source
export const getContentIdeasBySource = async (
  userId: string,
  source: ContentIdea['source']
): Promise<ContentIdea[]> => {
  const { data, error } = await supabase
    .from('content_ideas')
    .select('*')
    .eq('user_id', userId)
    .eq('source', source)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching content ideas by source:', error);
    throw error;
  }

  return (data || []).map(i => dbToContentIdea(i as DbContentIdea));
};

// Create a content idea
export const createContentIdea = async (
  userId: string,
  idea: Omit<ContentIdea, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<ContentIdea> => {
  const dbIdea = contentIdeaToDb(userId, idea);

  const { data, error } = await supabase
    .from('content_ideas')
    .insert([dbIdea])
    .select()
    .single();

  if (error) {
    console.error('Error creating content idea:', error);
    throw error;
  }

  return dbToContentIdea(data as DbContentIdea);
};

// Update a content idea
export const updateContentIdea = async (
  ideaId: string,
  updates: Partial<Omit<ContentIdea, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<ContentIdea> => {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.pillarId !== undefined) dbUpdates.pillar_id = updates.pillarId;
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.source !== undefined) dbUpdates.source = updates.source;
  if (updates.isPinned !== undefined) dbUpdates.is_pinned = updates.isPinned;
  if (updates.isArchived !== undefined) dbUpdates.is_archived = updates.isArchived;
  if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata;

  const { data, error } = await supabase
    .from('content_ideas')
    .update(dbUpdates)
    .eq('id', ideaId)
    .select()
    .single();

  if (error) {
    console.error('Error updating content idea:', error);
    throw error;
  }

  return dbToContentIdea(data as DbContentIdea);
};

// Delete a content idea
export const deleteContentIdea = async (ideaId: string): Promise<void> => {
  const { error } = await supabase
    .from('content_ideas')
    .delete()
    .eq('id', ideaId);

  if (error) {
    console.error('Error deleting content idea:', error);
    throw error;
  }
};

// Toggle pinned status
export const togglePinned = async (ideaId: string, isPinned: boolean): Promise<ContentIdea> => {
  return updateContentIdea(ideaId, { isPinned });
};

// Archive a content idea
export const archiveContentIdea = async (ideaId: string): Promise<ContentIdea> => {
  return updateContentIdea(ideaId, { isArchived: true });
};

// Unarchive a content idea
export const unarchiveContentIdea = async (ideaId: string): Promise<ContentIdea> => {
  return updateContentIdea(ideaId, { isArchived: false });
};

// Move idea to different pillar
export const moveIdeaToPillar = async (
  ideaId: string,
  pillarId: string | null
): Promise<ContentIdea> => {
  return updateContentIdea(ideaId, { pillarId: pillarId || undefined });
};

// =====================================================
// Migration Helpers
// =====================================================

// Batch create content ideas
export const batchCreateContentIdeas = async (
  userId: string,
  ideas: Array<Omit<ContentIdea, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<ContentIdea[]> => {
  if (ideas.length === 0) return [];

  const dbIdeas = ideas.map(idea => contentIdeaToDb(userId, idea));

  const { data, error } = await supabase
    .from('content_ideas')
    .insert(dbIdeas)
    .select();

  if (error) {
    console.error('Error batch creating content ideas:', error);
    throw error;
  }

  return (data || []).map(i => dbToContentIdea(i as DbContentIdea));
};
