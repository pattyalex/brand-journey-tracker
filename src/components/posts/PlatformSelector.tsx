import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const PLATFORMS = ['instagram', 'tiktok', 'facebook', 'linkedin', 'x', 'threads'] as const;
export type PlatformId = typeof PLATFORMS[number];

const PLATFORM_LABELS: Record<PlatformId, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  x: 'X',
  threads: 'Threads',
};

// SVG icons for each platform
const PlatformSvg: Record<PlatformId, React.FC<{ className?: string }>> = {
  instagram: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  tiktok: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      <path d="M16.708 0.027c1.745-0.027 3.48-0.011 5.213-0.027 0.105 2.041 0.839 4.12 2.333 5.563 1.491 1.479 3.6 2.156 5.652 2.385v5.369c-1.923-0.063-3.855-0.463-5.6-1.291-0.76-0.344-1.468-0.787-2.161-1.24-0.009 3.896 0.016 7.792-0.025 11.684-0.104 1.864-0.719 3.711-1.757 5.235-1.672 2.525-4.521 4.203-7.548 4.291-1.803 0.12-3.6-0.364-5.14-1.22-2.579-1.416-4.353-4.099-4.635-7.027-0.032-0.6-0.04-1.199-0.016-1.8 0.216-2.393 1.371-4.672 3.192-6.281 2.052-1.86 4.92-2.833 7.693-2.489 0.027 1.94-0.052 3.88-0.052 5.821-1.088-0.344-2.343-0.26-3.307 0.396-0.688 0.453-1.217 1.14-1.512 1.9-0.244 0.547-0.183 1.16-0.167 1.745 0.3 1.901 2.095 3.449 4.025 3.22 1.229-0.063 2.381-0.735 3.088-1.735 0.224-0.344 0.471-0.697 0.495-1.12 0.129-1.867 0.077-3.733 0.093-5.6 0.011-5.259-0.011-10.516 0.025-15.775z" />
    </svg>
  ),
  facebook: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  linkedin: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  x: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  threads: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.26 1.33-3.017.88-.724 2.10-1.14 3.531-1.205 1.07-.05 2.065.058 2.985.29-.07-.82-.283-1.46-.638-1.905-.467-.585-1.18-.888-2.12-.902-1.628.04-2.654.655-3.155 1.127l-1.35-1.565C8.95 5.672 10.543 4.88 12.693 4.84c1.546.03 2.783.548 3.676 1.538.848.942 1.303 2.237 1.353 3.847.01.036.01.073.011.11.584.254 1.12.573 1.596.962 1.014.83 1.77 1.952 2.186 3.244.497 1.542.48 3.56-.892 4.917-1.77 1.751-4.02 2.477-7.24 2.502l-.197.04zM14.29 12.39c-.838-.085-1.87-.1-2.69-.052-.96.057-1.7.282-2.205.668-.48.369-.7.862-.672 1.504.036.658.378 1.18.96 1.472.642.32 1.46.45 2.295.397 1.063-.058 1.89-.46 2.455-1.198.376-.49.636-1.16.768-2.01a8.14 8.14 0 00-.911-.781z" />
    </svg>
  ),
};

// Renders a row of platform icons (read-only display)
export const PlatformIconsDisplay: React.FC<{ platforms?: string[]; size?: number; className?: string }> = ({
  platforms,
  size = 14,
  className = '',
}) => {
  if (!platforms || platforms.length === 0) return null;
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {platforms.map(p => {
        const Icon = PlatformSvg[p as PlatformId];
        if (!Icon) return null;
        return (
          <div key={p} className="relative group/plat">
            <span className="text-gray-400 block" style={{ width: size, height: size }}><Icon className="w-full h-full" /></span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded bg-gray-500 text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover/plat:opacity-100 transition-opacity duration-100 pointer-events-none">
              {PLATFORM_LABELS[p as PlatformId]}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Clickable platform selector (popover with toggleable icons)
const PlatformSelector: React.FC<{
  value?: string[];
  onChange: (platforms: string[]) => void;
  size?: number;
  compact?: boolean;
}> = ({ value = [], onChange, size = 14, compact = false }) => {
  const [open, setOpen] = React.useState(false);

  const toggle = (id: PlatformId) => {
    const next = value.includes(id)
      ? value.filter(p => p !== id)
      : [...value, id];
    onChange(next);
    // Don't close the popover after selection
  };

  // Keep popover open — close only via outside click
  const handleOpenChange = (v: boolean) => {
    setOpen(v);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1.5 min-h-[24px] rounded px-1 py-0.5 hover:bg-gray-50 transition-colors duration-150"
        >
          {value.length > 0 ? (
            <PlatformIconsDisplay platforms={value} size={size} />
          ) : compact ? (
            <span className="text-gray-300 hover:text-gray-500 transition-colors duration-150 text-sm leading-none">+</span>
          ) : (
            <span className="text-[11px] text-gray-300">+ Platform</span>
          )}
          {!(compact && value.length === 0) && (
            <svg className="w-3 h-3 text-gray-300" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-1.5 bg-white rounded-lg border border-gray-200 shadow-lg w-auto z-[100]"
        align="center"
        side="top"
        sideOffset={6}
        collisionPadding={16}
        onOpenAutoFocus={e => e.preventDefault()}
      >
        <div className="flex items-center gap-1">
          {PLATFORMS.map(id => {
            const Icon = PlatformSvg[id];
            const isActive = value.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                className={`relative group/sel w-6 h-6 rounded-md flex items-center justify-center transition-all duration-150 ${
                  isActive
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded bg-gray-500 text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover/sel:opacity-100 transition-opacity duration-100 pointer-events-none">
                  {PLATFORM_LABELS[id]}
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PlatformSelector;
