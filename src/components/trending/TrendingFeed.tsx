
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
  creator: string;
  duration?: string;
  views: string;
  likes: string;
  comments: string;
  shares: string;
  saves: string;
  description?: string; // Added description as an optional property
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
}

const mockTrendingData: TrendingContent[] = [
  {
    title: "Growing Community Engagement",
    platform: "Instagram",
    creator: "@communitybuilder",
    views: "1.2M",
    likes: "45K",
    comments: "3.2K",
    shares: "12K",
    saves: "8.5K",
    description: "Strategies for authentic community building and engagement tactics",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1000"
  },
  {
    title: "Content Creation Tips",
    platform: "YouTube",
    creator: "@contentcreator",
    views: "800K",
    likes: "32K",
    comments: "2.8K",
    shares: "5.4K",
    saves: "7.2K",
    description: "Latest trends in content creation and editing techniques",
    mediaType: "video",
    duration: "10:23",
    mediaUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    title: "Professional Networking Guide",
    platform: "LinkedIn",
    creator: "@networkpro",
    views: "500K",
    likes: "28K",
    comments: "1.9K",
    shares: "4.3K",
    saves: "6.1K",
    description: "Expert tips for building meaningful professional connections",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000"
  },
  {
    title: "Social Media Strategy",
    platform: "X",
    creator: "@socialmediaguru",
    views: "900K",
    likes: "38K",
    comments: "2.3K",
    shares: "7.8K",
    saves: "5.6K",
    description: "Latest trends in social media marketing and engagement",
    mediaType: "video",
    duration: "5:17",
    mediaUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
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
