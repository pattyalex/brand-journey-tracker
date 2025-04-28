
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";

interface CampaignCardSectionProps {
  selectedCampaign: string | null;
  setSelectedCampaign: (campaign: string | null) => void;
}

const CampaignCardSection = ({ 
  selectedCampaign, 
  setSelectedCampaign 
}: CampaignCardSectionProps) => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Campaign Workspace</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setSelectedCampaign(selectedCampaign === "Brand X Spring Launch" ? null : "Brand X Spring Launch")}
        >
          <AspectRatio ratio={16 / 9}>
            <img 
              src="/placeholder.svg" 
              alt="Campaign Thumbnail"
              className="object-cover w-full h-full"
            />
          </AspectRatio>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Brand X Spring Launch</CardTitle>
            <p className="text-sm text-muted-foreground">Post Dates: May 1 - May 10</p>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant={selectedCampaign === "Brand X Spring Launch" ? "default" : "outline"}
            >
              {selectedCampaign === "Brand X Spring Launch" ? "Hide Workspace" : "View Workspace"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CampaignCardSection;
