import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MissionStatementWidgetProps {
  missionStatement: string;
}

const MissionStatementWidget: React.FC<MissionStatementWidgetProps> = ({
  missionStatement,
}) => {
  const navigate = useNavigate();

  return (
    <section className="md:col-span-3 bg-white/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#e0d5db]">
      {/* Header with Edit button */}
      <div className="flex justify-end -mb-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate('/strategy-growth#mission')}
                className="text-[#8B7082] hover:text-[#612a4f] hover:bg-[#612a4f]/10 p-1 rounded transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white border-black">
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/strategy-growth#mission')}>
        {/* Decorative line above */}
        <div className="w-20 h-px mb-4 bg-gradient-to-r from-transparent via-[#8B7082]/40 to-transparent" />

        {/* Label */}
        <span
          className="text-xs tracking-[0.2em] text-[#8B7082] uppercase mb-4"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Your Mission
        </span>

        {/* Mission Quote */}
        <p
          className={`text-xl sm:text-2xl md:text-3xl italic text-center max-w-2xl leading-relaxed px-2 ${missionStatement ? 'text-[#2d2a26]' : 'text-gray-400'}`}
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          "{missionStatement || 'Set your mission statement...'}"
        </p>

        {/* Decorative line below */}
        <div className="mt-6 w-20 h-px bg-gradient-to-r from-transparent via-[#8B7082]/40 to-transparent" />
      </div>
    </section>
  );
};

export default MissionStatementWidget;
