'use client';

import { MapPin } from 'lucide-react';
import { ShootLocation } from '@/types/shoots';

interface RouteMapProps {
  locations: ShootLocation[];
  optimizedOrder: string[];
}

export default function RouteMap({ locations, optimizedOrder }: RouteMapProps) {
  const orderedLocations = optimizedOrder.length
    ? optimizedOrder
        .map((id) => locations.find((l) => l.id === id))
        .filter(Boolean) as ShootLocation[]
    : locations;

  return (
    <div>
      {/* Map area */}
      <div className="rounded-xl overflow-hidden border border-gray-100 h-[220px] relative">
        {locations.length === 0 ? (
          <div className="h-full bg-gray-50 flex flex-col items-center justify-center gap-2">
            <MapPin size={28} className="text-gray-200" />
            <span className="text-xs text-gray-300">Add locations to see your route</span>
          </div>
        ) : (
          <div className="h-full bg-gradient-to-br from-blue-50 to-blue-100/50 relative flex flex-col">
            {/* Simulated pin layout */}
            <div className="flex-1 relative">
              {orderedLocations.map((loc, i) => {
                // Spread pins across the map area
                const xPercent = 15 + ((i * 47) % 70);
                const yPercent = 18 + ((i * 31) % 55);
                return (
                  <div
                    key={loc.id}
                    className="absolute flex flex-col items-center"
                    style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#612A4F] text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                      {i + 1}
                    </div>
                    <div className="w-px h-2 bg-[#612A4F]/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#612A4F]/30" />
                  </div>
                );
              })}

              {/* Dashed route line between pins (purely decorative) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {orderedLocations.length > 1 &&
                  orderedLocations.slice(0, -1).map((loc, i) => {
                    const x1 = 15 + ((i * 47) % 70);
                    const y1 = 18 + ((i * 31) % 55);
                    const x2 = 15 + (((i + 1) * 47) % 70);
                    const y2 = 18 + (((i + 1) * 31) % 55);
                    return (
                      <line
                        key={`line-${i}`}
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke="#612A4F"
                        strokeOpacity={0.2}
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                      />
                    );
                  })}
              </svg>
            </div>

            {/* Location name chips */}
            <div className="flex gap-1.5 px-3 pb-2.5 flex-wrap">
              {orderedLocations.map((loc, i) => (
                <span
                  key={loc.id}
                  className="text-[10px] bg-white/80 backdrop-blur-sm text-gray-600 px-2 py-0.5 rounded-full border border-gray-200/60 truncate max-w-[120px]"
                >
                  {i + 1}. {loc.name}
                </span>
              ))}
            </div>

            {/* API key notice */}
            <span className="absolute bottom-2.5 right-3 text-[10px] text-gray-300 italic">
              Map requires Google Maps API key
            </span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex justify-between text-[11px] text-gray-400 px-1 py-2">
        <span>{locations.length} location{locations.length !== 1 ? 's' : ''}</span>
        <span>Configure API for route</span>
      </div>
    </div>
  );
}
