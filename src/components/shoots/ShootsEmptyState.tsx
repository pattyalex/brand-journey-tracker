import { Camera } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShootsEmptyStateProps {
  onPlanShoot: () => void;
}

export default function ShootsEmptyState({ onPlanShoot }: ShootsEmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full w-full py-20"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="w-20 h-20 bg-[#612a4f]/6 rounded-full flex items-center justify-center mb-6">
        <Camera size={32} className="text-[#612a4f]/30" />
      </div>

      <h2 className="text-xl font-semibold text-gray-800 tracking-[-0.02em] mb-2">
        Plan your first shoot
      </h2>

      <p className="text-sm text-gray-400 max-w-sm text-center leading-relaxed mb-6">
        Group your post ideas into a shoot day — add locations, plan your route, and let AI build your schedule.
      </p>

      <button
        onClick={onPlanShoot}
        className="bg-[#612A4F] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#4e2140] transition-colors duration-200 shadow-sm"
      >
        + Plan a shoot
      </button>
    </motion.div>
  );
}
