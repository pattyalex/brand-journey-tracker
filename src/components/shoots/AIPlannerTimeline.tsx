'use client';

import { useState, useCallback } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Shoot, AIPlan, AIPlanBlock } from '@/types/shoots';
import { Post, getPillarStyle } from '@/types/posts';

interface AIPlannerTimelineProps {
  shoot: Shoot;
  posts: Post[];
  onUpdatePlan: (plan: AIPlan) => void;
}

function generatePlaceholderPlan(shoot: Shoot, posts: Post[]): AIPlan {
  const locations = shoot.locations;
  const startHour = 9;
  const blocks: AIPlanBlock[] = locations.map((loc, i) => {
    const hour = startHour + i * 2;
    const time = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;

    // Distribute posts roughly across locations
    const postsPerLoc = Math.ceil(posts.length / Math.max(locations.length, 1));
    const startIdx = i * postsPerLoc;
    const locPosts = posts.slice(startIdx, startIdx + postsPerLoc);

    return {
      id: `block-${loc.id}`,
      time,
      location_id: loc.id,
      location_name: loc.name,
      post_ids: locPosts.map((p) => p.id),
      reasoning:
        i === 0
          ? 'Start here for the best morning light and minimal crowds.'
          : i === locations.length - 1
            ? 'End the day at this location — golden hour will be perfect.'
            : 'Midday works well here; this spot has good shade and versatile backdrops.',
    };
  });

  return {
    blocks,
    generated_at: new Date().toISOString(),
    priority_hint: 'Optimized for natural light and minimal travel time.',
  };
}

export default function AIPlannerTimeline({ shoot, posts, onUpdatePlan }: AIPlannerTimelineProps) {
  const [loading, setLoading] = useState(false);
  const plan = shoot.ai_plan;

  const handlePlan = useCallback(() => {
    setLoading(true);
    // Simulate AI call — will be replaced with /api/claude endpoint
    setTimeout(() => {
      const newPlan = generatePlaceholderPlan(shoot, posts);
      onUpdatePlan(newPlan);
      setLoading(false);
    }, 2000);
  }, [shoot, posts, onUpdatePlan]);

  const postsById = posts.reduce<Record<string, Post>>((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  // --- No plan yet ---
  if (!plan && !loading) {
    return (
      <div>
        <button
          type="button"
          onClick={handlePlan}
          className="flex items-center gap-2 bg-[#612A4F] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#4e2140] transition-colors shadow-sm"
        >
          <Sparkles size={14} />
          Plan my shoot day
        </button>
        <p className="text-[11px] text-gray-400 italic mt-2">
          AI will create a schedule based on your locations, posts, and outfit changes
        </p>
      </div>
    );
  }

  // --- Loading ---
  if (loading) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[#612A4F] font-medium animate-pulse">Planning your day...</p>
        {[0.9, 0.7, 0.5, 0.35].map((opacity, i) => (
          <div
            key={i}
            className="rounded-lg bg-gray-100 animate-pulse h-16"
            style={{ opacity }}
          />
        ))}
      </div>
    );
  }

  // --- Plan exists ---
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-700">Shoot Day Plan</span>
        <button
          type="button"
          onClick={handlePlan}
          className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#612A4F] transition-colors"
        >
          <RefreshCw size={12} />
          Regenerate
        </button>
      </div>

      {/* Timeline */}
      <div className="relative pl-5">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gray-200" />

        <AnimatePresence mode="wait">
          <div className="space-y-4">
            {plan!.blocks.map((block, i) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.15 }}
                className="relative"
              >
                {/* Dot on timeline */}
                <div className="absolute -left-5 top-1 w-[9px] h-[9px] rounded-full bg-[#612A4F]/20 border-2 border-[#612A4F] z-10" />

                <div className="space-y-1.5">
                  {/* Time badge */}
                  <span className="text-[11px] font-semibold text-[#612A4F] bg-[#612A4F]/[0.08] px-2 py-0.5 rounded-full">
                    {block.time}
                  </span>

                  {/* Location */}
                  <p className="text-sm font-medium text-gray-700">{block.location_name}</p>

                  {/* Post chips */}
                  {block.post_ids.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {block.post_ids.map((pid) => {
                        const post = postsById[pid];
                        if (!post) return null;
                        const pillarStyle = getPillarStyle(post.pillar);
                        return (
                          <span
                            key={pid}
                            className="text-[10px] px-2 py-0.5 rounded-full truncate max-w-[140px]"
                            style={{
                              backgroundColor: pillarStyle.bg,
                              color: pillarStyle.text,
                            }}
                          >
                            {post.title}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Reasoning */}
                  <p className="text-[11px] text-gray-400 italic leading-relaxed">
                    {block.reasoning}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
