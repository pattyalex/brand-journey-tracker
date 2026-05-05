import { supabase } from './supabase';

const BUCKET = 'post-thumbnails';

export async function uploadPostThumbnail(file: File, postId: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${postId}/${Date.now()}.${ext}`;

  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    const fullPath = userId ? `${userId}/${path}` : path;

    const { error } = await supabase.storage.from(BUCKET).upload(fullPath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      console.error('[Upload] Supabase storage error:', error.message, error);
      throw error;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fullPath);
    console.log('[Upload] Success:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (err) {
    console.error('[Upload] Failed, falling back to blob URL:', err);
    // Fallback: local object URL (won't persist across sessions)
    return URL.createObjectURL(file);
  }
}
