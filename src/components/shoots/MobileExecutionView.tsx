import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, CheckCircle2, Check } from 'lucide-react';
import type { Shoot, AIPlanBlock } from '@/types/shoots';
import type { Post } from '@/types/posts';
import { getPillarStyle, STATUS_COLORS } from '@/types/posts';

interface MobileExecutionViewProps {
  shoot: Shoot;
  posts: Post[];
  onMarkAsShot: (postId: string) => void;
  onBack: () => void;
}

function formatShootDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function mapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export default function MobileExecutionView({
  shoot,
  posts,
  onMarkAsShot,
  onBack,
}: MobileExecutionViewProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [checklistOpen, setChecklistOpen] = useState(true);

  const shotCount = posts.filter((p) => p.status === 'Shot' || p.status === 'Edited' || p.status === 'Scheduled' || p.status === 'Posted').length;
  const totalCount = posts.length;
  const allCaptured = totalCount > 0 && shotCount >= totalCount;
  const progressPct = totalCount > 0 ? (shotCount / totalCount) * 100 : 0;

  const hasChecklist = shoot.outfits.length > 0 || shoot.gear.length > 0;
  const checklistItems = useMemo(() => {
    const items: { id: string; label: string; category: string }[] = [];
    shoot.outfits.forEach((o, i) => items.push({ id: `outfit-${i}`, label: o, category: 'Outfit' }));
    shoot.gear.forEach((g, i) => items.push({ id: `gear-${i}`, label: g, category: 'Gear' }));
    return items;
  }, [shoot.outfits, shoot.gear]);

  const toggleChecked = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const postMap = useMemo(() => {
    const map = new Map<string, Post>();
    posts.forEach((p) => map.set(p.id, p));
    return map;
  }, [posts]);

  const isPostShot = (post: Post) =>
    post.status === 'Shot' || post.status === 'Edited' || post.status === 'Scheduled' || post.status === 'Posted';

  // Find the first block that has unshot posts (the "current" block)
  const currentBlockId = useMemo(() => {
    if (!shoot.ai_plan) return null;
    for (const block of shoot.ai_plan.blocks) {
      const hasUnshot = block.post_ids.some((pid) => {
        const p = postMap.get(pid);
        return p && !isPostShot(p);
      });
      if (hasUnshot) return block.id;
    }
    return null;
  }, [shoot.ai_plan, postMap]);

  const isBlockComplete = (block: AIPlanBlock) =>
    block.post_ids.every((pid) => {
      const p = postMap.get(pid);
      return !p || isPostShot(p);
    });

  const locationForBlock = (block: AIPlanBlock) =>
    shoot.locations.find((l) => l.id === block.location_id);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 pt-3 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 mb-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-xl font-semibold text-gray-800 tracking-[-0.02em]">
          {shoot.name}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {formatShootDate(shoot.date)}
        </p>

        {/* Progress bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#612A4F]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {shotCount}/{totalCount}
          </span>
        </div>
      </div>

      {/* Celebration state */}
      {allCaptured && (
        <motion.div
          className="flex flex-col items-center justify-center py-16 px-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          >
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-800 mt-4">
            All captured!
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Every post for this shoot has been shot.
          </p>
        </motion.div>
      )}

      {/* Checklist */}
      {hasChecklist && !allCaptured && (
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => setChecklistOpen(!checklistOpen)}
            className="flex items-center gap-2 w-full"
          >
            <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
              Before you leave
            </span>
            <ChevronLeft
              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                checklistOpen ? '-rotate-90' : 'rotate-0'
              }`}
            />
          </button>

          {checklistOpen && (
            <motion.ul
              className="mt-2 space-y-1.5"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              {checklistItems.map((item) => {
                const checked = checkedItems.has(item.id);
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => toggleChecked(item.id)}
                      className="flex items-center gap-3 w-full py-1.5 text-left"
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          checked
                            ? 'bg-[#612A4F] border-[#612A4F]'
                            : 'border-gray-300'
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span
                        className={`text-sm transition-colors ${
                          checked
                            ? 'line-through text-gray-300'
                            : 'text-gray-700'
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="text-[10px] text-gray-300 ml-auto uppercase">
                        {item.category}
                      </span>
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </div>
      )}

      {/* Timeline / Post list */}
      {!allCaptured && (
        <div className="px-4 pt-4 pb-24">
          {shoot.ai_plan ? (
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08 } },
              }}
            >
              {shoot.ai_plan.blocks.map((block) => {
                const isCurrent = block.id === currentBlockId;
                const complete = isBlockComplete(block);
                const loc = locationForBlock(block);

                return (
                  <motion.div
                    key={block.id}
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.3 }}
                    className={`rounded-xl border p-4 ${
                      isCurrent
                        ? 'border-l-4 border-[#612A4F] bg-[#612A4F]/[0.02]'
                        : complete
                        ? 'border-gray-100 opacity-60'
                        : 'border-gray-100'
                    }`}
                  >
                    {/* Block header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-lg font-bold text-[#612A4F]">
                          {block.time}
                        </p>
                        {block.location_name && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {block.location_name}
                            </span>
                          </div>
                        )}
                        {loc && (
                          <a
                            href={mapsUrl(loc.lat, loc.lng)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue-500 underline mt-0.5 inline-block"
                          >
                            Open in Maps
                          </a>
                        )}
                      </div>

                      {complete && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* Posts in block */}
                    <div className="space-y-2">
                      {block.post_ids.map((pid) => {
                        const post = postMap.get(pid);
                        if (!post) return null;
                        const shot = isPostShot(post);
                        const pillarStyle = getPillarStyle(post.pillar);
                        const statusColor = STATUS_COLORS[post.status];

                        return (
                          <div
                            key={post.id}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                              shot ? 'opacity-60 bg-gray-50' : 'bg-white border border-gray-100'
                            }`}
                          >
                            {/* Status dot */}
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: statusColor.dot }}
                            />

                            {/* Title */}
                            <span className="text-sm font-medium text-gray-800 flex-1 min-w-0 truncate">
                              {post.title}
                            </span>

                            {/* Pillar pill */}
                            <span
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: pillarStyle.bg,
                                color: pillarStyle.text,
                              }}
                            >
                              {post.pillar}
                            </span>

                            {shot ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <button
                                onClick={() => onMarkAsShot(post.id)}
                                className="bg-[#612A4F] text-white text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
                              >
                                Mark as shot
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            /* No AI plan — simple list */
            <div>
              <p className="text-sm text-gray-400 mb-4">
                No plan generated — tap posts to mark them as captured
              </p>
              <motion.div
                className="space-y-2"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.06 } },
                }}
              >
                {posts.map((post) => {
                  const shot = isPostShot(post);
                  const pillarStyle = getPillarStyle(post.pillar);
                  const statusColor = STATUS_COLORS[post.status];

                  return (
                    <motion.div
                      key={post.id}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.25 }}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 ${
                        shot
                          ? 'opacity-60 bg-gray-50'
                          : 'bg-white border border-gray-100'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: statusColor.dot }}
                      />
                      <span className="text-sm font-medium text-gray-800 flex-1 min-w-0 truncate">
                        {post.title}
                      </span>
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: pillarStyle.bg,
                          color: pillarStyle.text,
                        }}
                      >
                        {post.pillar}
                      </span>
                      {shot ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <button
                          onClick={() => onMarkAsShot(post.id)}
                          className="bg-[#612A4F] text-white text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
                        >
                          Mark as shot
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
