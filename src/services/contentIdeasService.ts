import { fetchAll, createOne, updateOne, deleteOne, createMany } from './baseService';

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
  const data = await fetchAll<DbContentIdea>('content_ideas', {
    userId,
    orderBy: 'created_at',
    ascending: false,
    filters: { is_archived: false },
  });
  return data.map(dbToContentIdea);
};

// Get archived content ideas
export const getArchivedContentIdeas = async (userId: string): Promise<ContentIdea[]> => {
  const data = await fetchAll<DbContentIdea>('content_ideas', {
    userId,
    orderBy: 'updated_at',
    ascending: false,
    filters: { is_archived: true },
  });
  return data.map(dbToContentIdea);
};

// Get pinned content ideas
export const getPinnedContentIdeas = async (userId: string): Promise<ContentIdea[]> => {
  const data = await fetchAll<DbContentIdea>('content_ideas', {
    userId,
    orderBy: 'updated_at',
    ascending: false,
    filters: { is_pinned: true, is_archived: false },
  });
  return data.map(dbToContentIdea);
};

// Get content ideas by pillar
export const getContentIdeasByPillar = async (
  userId: string,
  pillarId: string
): Promise<ContentIdea[]> => {
  const data = await fetchAll<DbContentIdea>('content_ideas', {
    userId,
    orderBy: 'created_at',
    ascending: false,
    filters: { pillar_id: pillarId, is_archived: false },
  });
  return data.map(dbToContentIdea);
};

// Get content ideas by source
export const getContentIdeasBySource = async (
  userId: string,
  source: ContentIdea['source']
): Promise<ContentIdea[]> => {
  const data = await fetchAll<DbContentIdea>('content_ideas', {
    userId,
    orderBy: 'created_at',
    ascending: false,
    filters: { source, is_archived: false },
  });
  return data.map(dbToContentIdea);
};

// Create a content idea
export const createContentIdea = async (
  userId: string,
  idea: Omit<ContentIdea, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<ContentIdea> => {
  const dbIdea = contentIdeaToDb(userId, idea);
  const data = await createOne<DbContentIdea>('content_ideas', dbIdea);
  return dbToContentIdea(data);
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

  const data = await updateOne<DbContentIdea>('content_ideas', ideaId, dbUpdates);
  return dbToContentIdea(data);
};

// Delete a content idea
export const deleteContentIdea = async (ideaId: string): Promise<void> => {
  await deleteOne('content_ideas', ideaId);
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
  const data = await createMany<DbContentIdea>('content_ideas', dbIdeas);
  return data.map(dbToContentIdea);
};
