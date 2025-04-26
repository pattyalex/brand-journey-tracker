
import { FileText, Image, Video, MessageSquare, ChartBar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CampaignWorkspaceProps {
  campaignName: string;
}

const CampaignWorkspace = ({ campaignName }: CampaignWorkspaceProps) => {
  const workspaceItems = [
    { title: "Brand Brief", description: "PDF/Notes upload area", icon: FileText },
    { title: "Moodboard", description: "Image uploads here", icon: Image },
    { title: "Content Drafts", description: "Upload videos, captions, thumbnails", icon: Video },
    { title: "Comments & Feedback", description: "Notes and approvals area", icon: MessageSquare },
    { title: "Analytics Upload", description: "Upload screenshots + auto-generate report", icon: ChartBar }
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{campaignName} - Workspace</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaceItems.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <item.icon className="h-5 w-5" />
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default CampaignWorkspace;
