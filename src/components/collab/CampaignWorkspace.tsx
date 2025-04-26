
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import BrandBriefSection from "./BrandBriefSection";
import MoodboardSection from "./MoodboardSection";
import ContentDraftsSection from "./ContentDraftsSection";
import CommentsSection from "./CommentsSection";
import AnalyticsSection from "./AnalyticsSection";

interface CampaignWorkspaceProps {
  campaignName: string;
}

const CampaignWorkspace = ({ campaignName }: CampaignWorkspaceProps) => {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{campaignName} - Workspace</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BrandBriefSection />
        <MoodboardSection />
        <ContentDraftsSection />
        <CommentsSection />
        <AnalyticsSection />
      </div>
    </section>
  );
};

export default CampaignWorkspace;
