
import { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TrendingContent {
  title: string;
  platform: string;
  views: string;
  description: string;
}

const mockTrendingData: TrendingContent[] = [
  {
    title: "Growing Community Engagement",
    platform: "Instagram",
    views: "1.2M views",
    description: "Strategies for authentic community building and engagement tactics"
  },
  {
    title: "Content Creation Tips",
    platform: "YouTube",
    views: "800K views",
    description: "Latest trends in content creation and editing techniques"
  }
];

const TrendingFeed = () => {
  const [niche, setNiche] = useState('');
  const [trendingContent, setTrendingContent] = useState<TrendingContent[]>(mockTrendingData);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    // In a future implementation, this would make an API call to get real trending data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Enter your niche (e.g., fitness, cooking, tech)"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleSearch}
          disabled={!niche.trim() || isLoading}
          className="min-w-[120px]"
        >
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      <div className="grid gap-4">
        {trendingContent.map((content, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex justify-between items-start">
                <span>{content.title}</span>
                <span className="text-sm text-muted-foreground flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {content.views}
                </span>
              </CardTitle>
              <span className="text-sm text-primary">{content.platform}</span>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{content.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrendingFeed;
