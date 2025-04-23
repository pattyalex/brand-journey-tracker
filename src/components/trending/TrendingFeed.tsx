import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LocationSelector from './LocationSelector';
import PlatformSelector from './PlatformSelector';
import TrendingCard from './TrendingCard';

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
  },
  {
    title: "Professional Networking Guide",
    platform: "LinkedIn",
    views: "500K views",
    description: "Expert tips for building meaningful professional connections"
  },
  {
    title: "Social Media Strategy",
    platform: "X",
    views: "900K views",
    description: "Latest trends in social media marketing and engagement"
  }
];

const TrendingFeed = () => {
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('all');
  const [location, setLocation] = useState('global');
  const [customLocation, setCustomLocation] = useState('');
  const [trendingContent, setTrendingContent] = useState<TrendingContent[]>(mockTrendingData);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    const filteredContent = platform === 'all' 
      ? mockTrendingData 
      : mockTrendingData.filter(content => 
          content.platform.toLowerCase() === platform.toLowerCase()
        );
    
    setTimeout(() => {
      setTrendingContent(filteredContent);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Enter your niche (e.g., fitness, cooking, tech)"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="min-w-[200px]">
          <PlatformSelector 
            value={platform} 
            onValueChange={setPlatform} 
          />
        </div>
        <div className="min-w-[200px]">
          <LocationSelector
            location={location}
            customLocation={customLocation}
            onLocationSelect={setLocation}
            onCustomLocationChange={setCustomLocation}
          />
        </div>
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
          <TrendingCard key={index} content={content} />
        ))}
      </div>
    </div>
  );
};

export default TrendingFeed;
