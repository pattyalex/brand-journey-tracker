'use client';

import { useState, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShootLocation } from '@/types/shoots';

interface RouteOptimizerProps {
  locations: ShootLocation[];
  onOptimize: (newOrder: string[]) => void;
  disabled?: boolean;
}

export default function RouteOptimizer({ locations, onOptimize, disabled }: RouteOptimizerProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const isDisabled = disabled || locations.length < 3;

  const handleOptimize = useCallback(() => {
    if (isDisabled) return;

    // Placeholder: reverse the location order (real optimization needs Google Routes API)
    const reversed = [...locations].reverse().map((l) => l.id);
    onOptimize(reversed);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  }, [isDisabled, locations, onOptimize]);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleOptimize}
        disabled={isDisabled}
        className={`text-sm text-gray-500 hover:text-[#612A4F] flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-[#612A4F]/20 transition-all duration-200 ${
          isDisabled ? 'opacity-50 cursor-not-allowed hover:text-gray-500 hover:border-gray-200' : ''
        }`}
      >
        <Sparkles size={14} />
        Optimize route
      </button>

      <AnimatePresence>
        {showSuccess && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[11px] text-green-600"
          >
            Route optimized
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
