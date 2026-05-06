import { supabase } from '@/lib/supabase';
import { Post } from '@/types/posts';

const TABLE = 'user_posts';

// ── Helpers: map between app (camelCase) and DB (snake_case) ──

interface DbPost {
  id: string;
  user_id: string;
  title: string;
  pillar: string;
  format: string;
  status: string;
  scheduled_date: string | null;
  script: string | null;
  caption: string | null;
  hashtags: string[];
  attached_files: string[];
  notes: string | null;
  storyboard: { action: string; script: string }[];
  metrics_likes: number | null;
  metrics_comments: number | null;
  metrics_shares: number | null;
  metrics_saves: number | null;
  metrics_reach: number | null;
  thumbnail_url: string | null;
  sent_to_schedule: boolean;
  scheduled_time: string | null;
  sort_order: number;
  shoot_id: string | null;
  sent_to_shoots: boolean;
  platforms: string[] | null;
  created_at: string;
  updated_at: string;
}

function dbToPost(row: DbPost): Post {
  return {
    id: row.id,
    title: row.title,
    pillar: row.pillar,
    format: row.format,
    status: row.status as Post['status'],
    scheduledDate: row.scheduled_date || undefined,
    script: row.script || undefined,
    caption: row.caption || undefined,
    hashtags: row.hashtags?.length ? row.hashtags : undefined,
    attachedFiles: row.attached_files?.length ? row.attached_files : undefined,
    notes: row.notes || undefined,
    storyboard: row.storyboard?.length ? row.storyboard : undefined,
    metrics: (row.metrics_likes != null || row.metrics_comments != null || row.metrics_shares != null || row.metrics_saves != null || row.metrics_reach != null)
      ? {
          likes: row.metrics_likes ?? undefined,
          comments: row.metrics_comments ?? undefined,
          shares: row.metrics_shares ?? undefined,
          saves: row.metrics_saves ?? undefined,
          reach: row.metrics_reach ?? undefined,
        }
      : undefined,
    thumbnail_url: row.thumbnail_url || undefined,
    sent_to_schedule: row.sent_to_schedule || undefined,
    scheduled_time: row.scheduled_time || undefined,
    order: row.sort_order,
    shoot_id: row.shoot_id,
    sentToShoots: row.sent_to_shoots || undefined,
    platforms: row.platforms?.length ? row.platforms : undefined,
    createdAt: row.created_at,
  };
}

function postToDb(post: Partial<Post>, userId: string): Record<string, unknown> {
  const row: Record<string, unknown> = { user_id: userId };

  if (post.id !== undefined) row.id = post.id;
  if (post.title !== undefined) row.title = post.title;
  if (post.pillar !== undefined) row.pillar = post.pillar;
  if (post.format !== undefined) row.format = post.format;
  if (post.status !== undefined) row.status = post.status;
  if (post.scheduledDate !== undefined) row.scheduled_date = post.scheduledDate || null;
  if (post.script !== undefined) row.script = post.script || null;
  if (post.caption !== undefined) row.caption = post.caption || null;
  if (post.hashtags !== undefined) row.hashtags = post.hashtags || [];
  if (post.attachedFiles !== undefined) row.attached_files = post.attachedFiles || [];
  if (post.notes !== undefined) row.notes = post.notes || null;
  if (post.storyboard !== undefined) row.storyboard = post.storyboard || [];
  if (post.metrics !== undefined) {
    row.metrics_likes = post.metrics?.likes ?? null;
    row.metrics_comments = post.metrics?.comments ?? null;
    row.metrics_shares = post.metrics?.shares ?? null;
    row.metrics_saves = post.metrics?.saves ?? null;
    row.metrics_reach = post.metrics?.reach ?? null;
  }
  if (post.thumbnail_url !== undefined) row.thumbnail_url = post.thumbnail_url || null;
  if (post.sent_to_schedule !== undefined) row.sent_to_schedule = post.sent_to_schedule;
  if (post.scheduled_time !== undefined) row.scheduled_time = post.scheduled_time || null;
  if (post.order !== undefined) row.sort_order = post.order;
  if (post.shoot_id !== undefined) row.shoot_id = post.shoot_id || null;
  if (post.sentToShoots !== undefined) row.sent_to_shoots = post.sentToShoots;
  if (post.platforms !== undefined) row.platforms = post.platforms || [];
  if (post.createdAt !== undefined) row.created_at = post.createdAt;

  return row;
}

// For updates, we don't want to include user_id
function postUpdatesToDb(updates: Partial<Post>): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  if (updates.title !== undefined) row.title = updates.title;
  if (updates.pillar !== undefined) row.pillar = updates.pillar;
  if (updates.format !== undefined) row.format = updates.format;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.scheduledDate !== undefined) row.scheduled_date = updates.scheduledDate || null;
  if (updates.script !== undefined) row.script = updates.script || null;
  if (updates.caption !== undefined) row.caption = updates.caption || null;
  if (updates.hashtags !== undefined) row.hashtags = updates.hashtags || [];
  if (updates.attachedFiles !== undefined) row.attached_files = updates.attachedFiles || [];
  if (updates.notes !== undefined) row.notes = updates.notes || null;
  if (updates.storyboard !== undefined) row.storyboard = updates.storyboard || [];
  if (updates.metrics !== undefined) {
    row.metrics_likes = updates.metrics?.likes ?? null;
    row.metrics_comments = updates.metrics?.comments ?? null;
    row.metrics_shares = updates.metrics?.shares ?? null;
    row.metrics_saves = updates.metrics?.saves ?? null;
    row.metrics_reach = updates.metrics?.reach ?? null;
  }
  if (updates.thumbnail_url !== undefined) row.thumbnail_url = updates.thumbnail_url || null;
  if (updates.sent_to_schedule !== undefined) row.sent_to_schedule = updates.sent_to_schedule;
  if (updates.scheduled_time !== undefined) row.scheduled_time = updates.scheduled_time || null;
  if (updates.order !== undefined) row.sort_order = updates.order;
  if (updates.shoot_id !== undefined) row.shoot_id = updates.shoot_id || null;
  if (updates.sentToShoots !== undefined) row.sent_to_shoots = updates.sentToShoots;
  if (updates.platforms !== undefined) row.platforms = updates.platforms || [];

  return row;
}

// ── Public API ──

export async function fetchPosts(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[postsService] fetchPosts error:', error);
    throw error;
  }

  return (data as DbPost[]).map(dbToPost);
}

export async function createPost(post: Post, userId: string): Promise<Post> {
  const row = postToDb(post, userId);
  const { data, error } = await supabase
    .from(TABLE)
    .insert([row])
    .select()
    .single();

  if (error) {
    console.error('[postsService] createPost error:', error);
    throw error;
  }

  return dbToPost(data as DbPost);
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<Post> {
  const row = postUpdatesToDb(updates);
  const { data, error } = await supabase
    .from(TABLE)
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[postsService] updatePost error:', error);
    throw error;
  }

  return dbToPost(data as DbPost);
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[postsService] deletePost error:', error);
    throw error;
  }
}

export async function upsertPosts(posts: Post[], userId: string): Promise<void> {
  if (posts.length === 0) return;
  const rows = posts.map(p => postToDb(p, userId));
  const { error } = await supabase
    .from(TABLE)
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('[postsService] upsertPosts error:', error);
    throw error;
  }
}
