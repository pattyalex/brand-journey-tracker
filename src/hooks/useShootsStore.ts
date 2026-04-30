import { useState, useEffect, useCallback } from 'react';
import { Shoot, ShootStatus } from '@/types/shoots';
import { Post } from '@/types/posts';
import { getJSON, setJSON } from '@/lib/storage';
import { seedShoots, seedShootPosts } from '@/data/shootsSeedData';

const SHOOTS_KEY = 'meg_shoots';
const SHOOTS_POSTS_KEY = 'meg_shoots_posts';

// Nuclear cleanup — wipe everything and start fresh
(function() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('meg_clean_slate_v1')) return;
  localStorage.clear();
  localStorage.setItem('meg_clean_slate_v1', '1');
})();

export function useShootsStore() {
  const [shoots, setShoots] = useState<Shoot[]>(() => {
    const stored = getJSON<Shoot[] | null>(SHOOTS_KEY, null);
    if (stored && stored.length > 0) return stored;
    return [];
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const stored = getJSON<Post[] | null>(SHOOTS_POSTS_KEY, null);
    if (stored && stored.length > 0) return stored;
    return [];
  });

  // Persist shoots
  useEffect(() => {
    setJSON(SHOOTS_KEY, shoots);
  }, [shoots]);

  // Persist posts
  useEffect(() => {
    setJSON(SHOOTS_POSTS_KEY, posts);
  }, [posts]);


  // ── Shoot CRUD ──

  const addShoot = useCallback((shoot: Shoot) => {
    setShoots(prev => [shoot, ...prev]);
  }, []);

  const updateShoot = useCallback((id: string, updates: Partial<Shoot>) => {
    setShoots(prev => prev.map(s => s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s));
  }, []);

  const deleteShoot = useCallback((id: string) => {
    // Unlink posts
    setPosts(prev => prev.map(p => p.shoot_id === id ? { ...p, shoot_id: undefined } : p));
    setShoots(prev => prev.filter(s => s.id !== id));
  }, []);

  const duplicateShoot = useCallback((id: string) => {
    const original = shoots.find(s => s.id === id);
    if (!original) return;
    const newShoot: Shoot = {
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (copy)`,
      status: 'Planned',
      ai_plan: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setShoots(prev => [newShoot, ...prev]);
  }, [shoots]);

  // ── Post operations ──

  const getPostsForShoot = useCallback((shootId: string) => {
    return posts.filter(p => p.shoot_id === shootId);
  }, [posts]);

  const getUnassignedPosts = useCallback(() => {
    return posts.filter(p => !p.shoot_id && p.sentToShoots);
  }, [posts]);

  const assignPostsToShoot = useCallback((postIds: string[], shootId: string) => {
    setPosts(prev => prev.map(p => postIds.includes(p.id) ? { ...p, shoot_id: shootId } : p));
  }, []);

  const removePostFromShoot = useCallback((postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, shoot_id: undefined } : p));
  }, []);

  const updatePost = useCallback((postId: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
  }, []);

  const getShootById = useCallback((id: string) => {
    return shoots.find(s => s.id === id) || null;
  }, [shoots]);

  // ── Derived data ──

  const upcomingShoots = shoots
    .filter(s => s.status !== 'Archived' && s.date >= new Date().toISOString().split('T')[0])
    .sort((a, b) => a.date.localeCompare(b.date));

  const pastShoots = shoots
    .filter(s => s.status !== 'Archived' && s.date < new Date().toISOString().split('T')[0])
    .sort((a, b) => b.date.localeCompare(a.date));

  const archivedShoots = shoots.filter(s => s.status === 'Archived');

  return {
    shoots,
    posts,
    upcomingShoots,
    pastShoots,
    archivedShoots,
    addShoot,
    updateShoot,
    deleteShoot,
    duplicateShoot,
    getPostsForShoot,
    getUnassignedPosts,
    assignPostsToShoot,
    removePostFromShoot,
    updatePost,
    getShootById,
  };
}
