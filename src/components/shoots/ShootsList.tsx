import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Shoot } from '@/types/shoots';
import { Post } from '@/types/posts';
import ShootRow from './ShootRow';

interface ShootsListProps {
  shoots: Shoot[];
  upcomingShoots: Shoot[];
  pastShoots: Shoot[];
  posts: Post[];
  onSelectShoot: (id: string) => void;
  onPlanShoot: () => void;
  getPostsForShoot: (id: string) => Post[];
}

const ShootsList: React.FC<ShootsListProps> = ({
  shoots,
  upcomingShoots,
  pastShoots,
  posts,
  onSelectShoot,
  onPlanShoot,
  getPostsForShoot,
}) => {
  const [pastExpanded, setPastExpanded] = useState(false);

  if (shoots.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Upcoming section */}
      {upcomingShoots.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-3">
            Upcoming
          </p>
          <div className="space-y-2">
            {upcomingShoots.map((shoot, index) => (
              <motion.div
                key={shoot.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <ShootRow
                  shoot={shoot}
                  postCount={getPostsForShoot(shoot.id).length}
                  onClick={() => onSelectShoot(shoot.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Past section — collapsible */}
      {pastShoots.length > 0 && (
        <div>
          <button
            onClick={() => setPastExpanded((prev) => !prev)}
            className="flex items-center gap-1.5 mb-3 group"
          >
            <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">
              Past ({pastShoots.length})
            </p>
            <motion.span
              animate={{ rotate: pastExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-500 transition-colors duration-150" />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {pastExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  {pastShoots.map((shoot, index) => (
                    <motion.div
                      key={shoot.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <ShootRow
                        shoot={shoot}
                        postCount={getPostsForShoot(shoot.id).length}
                        onClick={() => onSelectShoot(shoot.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ShootsList;
