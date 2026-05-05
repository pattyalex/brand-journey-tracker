import { useState, useEffect, useCallback } from 'react';
import { Shoot, ShootStatus } from '@/types/shoots';
import { Post } from '@/types/posts';
import { getJSON, setJSON } from '@/lib/storage';
import { seedShoots, seedShootPosts } from '@/data/shootsSeedData';
import { useAuth } from '@/contexts/AuthContext';
import * as shootsApi from '@/services/shootsService';
import * as postsApi from '@/services/postsService';

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
  const { user } = useAuth();
  const userId = user?.id;

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

  // Load from Supabase on mount
  useEffect(() => {
    if (!userId) return;
    shootsApi.fetchShoots(userId).then(remote => {
      if (remote.length > 0) {
        setShoots(remote);
      } else {
        const local = getJSON<Shoot[] | null>(SHOOTS_KEY, null);
        if (local && local.length > 0) {
          shootsApi.upsertShoots(local, userId).catch(console.error);
        }
      }
    }).catch(console.error);

    // Load shoot-linked posts from user_posts
    postsApi.fetchPosts(userId).then(remote => {
      const shootPosts = remote.filter(p => p.sentToShoots || p.shoot_id);
      if (shootPosts.length > 0) {
        setPosts(shootPosts);
      }
    }).catch(console.error);
  }, [userId]);

  // Persist to localStorage (cache)
  useEffect(() => {
    setJSON(SHOOTS_KEY, shoots);
  }, [shoots]);

  useEffect(() => {
    setJSON(SHOOTS_POSTS_KEY, posts);
  }, [posts]);


  // ── Shoot CRUD ──

  const addShoot = useCallback((shoot: Shoot) => {
    setShoots(prev => [shoot, ...prev]);
    if (userId) shootsApi.createShoot(shoot, userId).catch(console.error);
  }, [userId]);

  const updateShoot = useCallback((id: string, updates: Partial<Shoot>) => {
    setShoots(prev => prev.map(s => s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s));
    shootsApi.updateShoot(id, updates).catch(console.error);
  }, []);

  const deleteShoot = useCallback((id: string) => {
    // Unlink posts
    setPosts(prev => {
      const unlinked = prev.filter(p => p.shoot_id === id);
      unlinked.forEach(p => postsApi.updatePost(p.id, { shoot_id: null }).catch(console.error));
      return prev.map(p => p.shoot_id === id ? { ...p, shoot_id: undefined } : p);
    });
    setShoots(prev => prev.filter(s => s.id !== id));
    shootsApi.deleteShoot(id).catch(console.error);
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
    if (userId) shootsApi.createShoot(newShoot, userId).catch(console.error);
  }, [shoots, userId]);

  // ── Post operations ──

  const getPostsForShoot = useCallback((shootId: string) => {
    return posts.filter(p => p.shoot_id === shootId);
  }, [posts]);

  const getUnassignedPosts = useCallback(() => {
    return posts.filter(p => !p.shoot_id && p.sentToShoots);
  }, [posts]);

  const assignPostsToShoot = useCallback((postIds: string[], shootId: string) => {
    setPosts(prev => prev.map(p => postIds.includes(p.id) ? { ...p, shoot_id: shootId } : p));
    postIds.forEach(id => postsApi.updatePost(id, { shoot_id: shootId }).catch(console.error));
  }, []);

  const removePostFromShoot = useCallback((postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, shoot_id: undefined } : p));
    postsApi.updatePost(postId, { shoot_id: null }).catch(console.error);
  }, []);

  const updatePost = useCallback((postId: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
    postsApi.updatePost(postId, updates).catch(console.error);
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
