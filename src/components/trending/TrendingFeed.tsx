import { useState } from 'react';
import { Search, TrendingUp, Instagram, Linkedin, Twitter, Youtube, Globe, Flag } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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

const platforms = [
  { value: "all", label: "All Platforms" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
  { value: "tiktok", label: "TikTok" },
  { value: "threads", label: "Threads" }
];

const locations = [
  { value: "global", label: "Global", icon: Globe },
  { value: "usa", label: "USA", icon: Flag },
];

const TrendingFeed = () => {
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('all');
  const [location, setLocation] = useState('global');
  const [customLocation, setCustomLocation] = useState('');
  const [trendingContent, setTrendingContent] = useState<TrendingContent[]>(mockTrendingData);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

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

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'x':
        return <Twitter className="w-4 h-4" />;
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const handleLocationSelect = (value: string) => {
    setLocation(value);
    setOpen(false);
  };

  const currentLocationLabel = locations.find(loc => loc.value === location)?.label || customLocation || "Select location...";

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
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Select Platform" />
            </SelectTrigger>
            <SelectContent>
              {platforms.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[200px]">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {currentLocationLabel}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
              {locations.map((loc) => (
                <DropdownMenuItem
                  key={loc.value}
                  onSelect={() => handleLocationSelect(loc.value)}
                  className="flex items-center gap-2"
                >
                  {location === loc.value && <Check className="h-4 w-4" />}
                  {loc.icon && <loc.icon className="h-4 w-4" />}
                  {loc.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem className="p-0">
                <Input 
                  placeholder="Enter custom location..."
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={customLocation}
                  onChange={(e) => {
                    setCustomLocation(e.target.value);
                    if (e.target.value) {
                      setLocation('custom');
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex justify-between items-start">
                <span>{content.title}</span>
                <span className="text-sm text-muted-foreground flex items-center">
                  {getPlatformIcon(content.platform)}
                  <span className="ml-1">{content.views}</span>
                </span>
              </CardTitle>
              <span className="text-sm text-primary flex items-center gap-2">
                {getPlatformIcon(content.platform)}
                {content.platform}
              </span>
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
