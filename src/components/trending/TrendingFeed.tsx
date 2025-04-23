
import { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import LocationSelector from './LocationSelector';
import PlatformSelector from './PlatformSelector';
import TrendingCard from './TrendingCard';
import { FirecrawlService } from '@/utils/FirecrawlService';

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
  description?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
}

// Extend the mock data to have 8 items
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
  },
  // Add 4 more mock items
  {
    title: "Digital Marketing Trends",
    platform: "TikTok",
    creator: "@digitalmarketer",
    views: "600K",
    likes: "25K",
    comments: "1.5K",
    shares: "3.9K",
    saves: "4.7K",
    description: "Emerging digital marketing strategies for 2024",
    mediaType: "video",
    duration: "7:45",
    mediaUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    title: "Fitness Motivation",
    platform: "Instagram",
    creator: "@fitnessinspiration",
    views: "750K",
    likes: "42K",
    comments: "2.1K",
    shares: "6.2K",
    saves: "5.3K",
    description: "Workout routines and motivational fitness content",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1517836357598-8edb3ba7ebe3?q=80&w=1000"
  },
  {
    title: "Travel Vlogging Tips",
    platform: "YouTube",
    creator: "@travelvlogger",
    views: "400K",
    likes: "22K",
    comments: "1.7K",
    shares: "3.5K",
    saves: "4.1K",
    description: "How to create engaging travel content",
    mediaType: "video",
    duration: "12:30",
    mediaUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    title: "Tech Innovation Insights",
    platform: "LinkedIn",
    creator: "@techinnovator",
    views: "550K",
    likes: "30K",
    comments: "2.0K",
    shares: "4.6K",
    saves: "5.8K",
    description: "Latest technological innovations and startup trends",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1517976487492-5750f3a60ffe?q=80&w=1000"
  }
];

const TrendingFeed = () => {
  const { toast } = useToast();
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('all');
  const [location, setLocation] = useState('global');
  const [customLocation, setCustomLocation] = useState('');
  const [trendingContent, setTrendingContent] = useState<TrendingContent[]>(mockTrendingData);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [apiKey, setApiKey] = useState(FirecrawlService.getApiKey() || '');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleSearch = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Firecrawl API key first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setPage(1);
    
    try {
      FirecrawlService.saveApiKey(apiKey);
      const result = await FirecrawlService.crawlSocialContent(platform);
      
      if (result.success && result.data) {
        const transformedContent = result.data.data?.map((item: any) => ({
          title: item.title || 'Untitled',
          platform: platform,
          creator: item.creator || '@unknown',
          views: item.views || '0',
          likes: item.likes || '0',
          comments: item.comments || '0',
          shares: item.shares || '0',
          saves: item.saves || '0',
          description: item.description,
          mediaType: item.mediaType || 'image',
          mediaUrl: item.mediaUrl,
        })) || [];

        setTrendingContent(transformedContent);
        setHasMore(transformedContent.length >= 10); // Assuming 10 items per page
        toast({
          title: "Success",
          description: "Successfully fetched trending content",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch trending content",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching trending content:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trending content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const result = await FirecrawlService.crawlSocialContent(platform);
      
      if (result.success && result.data) {
        const newContent = result.data.data?.map((item: any) => ({
          title: item.title || 'Untitled',
          platform: platform,
          creator: item.creator || '@unknown',
          views: item.views || '0',
          likes: item.likes || '0',
          comments: item.comments || '0',
          shares: item.shares || '0',
          saves: item.saves || '0',
          description: item.description,
          mediaType: item.mediaType || 'image',
          mediaUrl: item.mediaUrl,
        })) || [];

        setTrendingContent(prev => [...prev, ...newContent]);
        setPage(prev => prev + 1);
        setHasMore(newContent.length >= 10); // Assuming 10 items per page
      }
    } catch (error) {
      console.error('Error loading more content:', error);
      toast({
        title: "Error",
        description: "Failed to load more content",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Enter your Firecrawl API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type="password"
            className="mb-4"
          />
          <Input
            placeholder="Enter your niche (e.g., fitness, cooking, tech)"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="min-w-[200px]">
          <PlatformSelector value={platform} onValueChange={setPlatform} />
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
          disabled={!apiKey || !niche.trim() || isLoading}
          className="min-w-[120px]"
        >
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      <div className="grid gap-4">
        {trendingContent.map((content, index) => (
          <TrendingCard key={`${content.creator}-${index}`} content={content} />
        ))}
      </div>

      {hasMore && trendingContent.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            size="lg"
            className="w-40"
          >
            {isLoadingMore ? (
              "Loading..."
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                More
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TrendingFeed;
