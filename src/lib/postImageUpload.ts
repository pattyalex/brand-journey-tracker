import heic2any from 'heic2any';
import { supabase } from './supabase';

const BUCKET = 'post-thumbnails';

async function convertHeicIfNeeded(file: File): Promise<File> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.heic') || name.endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif') {
    const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
    const converted = Array.isArray(blob) ? blob[0] : blob;
    return new File([converted], file.name.replace(/\.heic$|\.heif$/i, '.jpg'), { type: 'image/jpeg' });
  }
  return file;
}

export async function uploadPostThumbnail(file: File, postId: string): Promise<string> {
  file = await convertHeicIfNeeded(file);
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
