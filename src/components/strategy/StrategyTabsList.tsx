import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebar } from "@/components/ui/sidebar";
import { TrendingUp, PenTool } from "lucide-react";

interface StrategyTabsListProps {
  activeTab: string;
  handleTabChange: (value: string) => void;
}

const StrategyTabsList: React.FC<StrategyTabsListProps> = ({ activeTab, handleTabChange }) => {
  const { state: sidebarState } = useSidebar();
  const isSidebarCollapsed = sidebarState === 'collapsed';

  return (
    <TabsList className="inline-flex items-center gap-0 bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6">
      <TabsTrigger
        value="growth-goals"
        className="relative px-6 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-[#612A4F] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-[#8B7082] data-[state=inactive]:hover:text-[#612A4F] data-[state=inactive]:hover:bg-[#F5F0F3]"
      >
        <TrendingUp className="w-4 h-4 mr-2 inline-block" />
        Growth Goals
      </TabsTrigger>
      <TabsTrigger
        value="brand-identity"
        className="relative px-6 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-[#612A4F] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-[#8B7082] data-[state=inactive]:hover:text-[#612A4F] data-[state=inactive]:hover:bg-[#F5F0F3]"
      >
        <PenTool className="w-4 h-4 mr-2 inline-block" />
        Positioning
      </TabsTrigger>
    </TabsList>
  );
};

export default StrategyTabsList;
