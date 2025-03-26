
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  ArrowRight, 
  Calendar,
  BarChart,
  Instagram,
  Link,
  Copy,
  Repeat
} from "lucide-react";
import { 
  BarChart as RechartsBarChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import CreateSimilarContentDialog from "./CreateSimilarContentDialog";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StoryPerformanceTabProps {
  platforms: string[];
}

// Mock data - would be replaced with real API data
const stories = [
  {
    id: "1",
    title: "Morning routine",
    platform: "Instagram",
    thumbnail: "https://placehold.co/90x160/E1306C/white?text=Story",
    views: 12543,
    completionRate: 75,
    linkClicks: 234,
    date: "2023-11-22",
    hasLink: true,
  },
  {
    id: "2",
    title: "New product sneak peek",
    platform: "Instagram",
    thumbnail: "https://placehold.co/90x160/E1306C/white?text=Story",
    views: 10876,
    completionRate: 68,
    linkClicks: 312,
    date: "2023-11-20",
    hasLink: true,
  },
  {
    id: "3",
    title: "Q&A session",
    platform: "TikTok",
    thumbnail: "https://placehold.co/90x160/000000/white?text=Story",
    views: 8432,
    completionRate: 82,
    linkClicks: 189,
    date: "2023-11-18",
    hasLink: true,
  },
  {
    id: "4",
    title: "Behind the scenes",
    platform: "Instagram",
    thumbnail: "https://placehold.co/90x160/E1306C/white?text=Story",
    views: 9543,
    completionRate: 71,
    linkClicks: 0,
    date: "2023-11-15",
    hasLink: false,
  },
  {
    id: "5",
    title: "Promotion announcement",
    platform: "TikTok",
    thumbnail: "https://placehold.co/90x160/000000/white?text=Story",
    views: 7654,
    completionRate: 64,
    linkClicks: 276,
    date: "2023-11-12",
    hasLink: true,
  },
  {
    id: "6",
    title: "Daily vlog highlight",
    platform: "Instagram",
    thumbnail: "https://placehold.co/90x160/E1306C/white?text=Story",
    views: 6432,
    completionRate: 55,
    linkClicks: null,
    date: "2023-11-10",
    hasLink: false,
  },
];

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "Instagram":
      return <Instagram className="h-4 w-4 text-pink-500" />;
    case "TikTok":
      // Since TikTok icon is not available in lucide-react, we use SVG directly
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="h-4 w-4 text-black"
        >
          <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
          <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
          <path d="M15 8v8a4 4 0 0 1-4 4" />
          <line x1="15" y1="4" x2="15" y2="12" />
        </svg>
      );
    default:
      return null;
  }
};

// Weekly story performance data
const weeklyStoryData = [
  { day: "Mon", views: 15253, completionRate: 72 },
  { day: "Tue", views: 18456, completionRate: 69 },
  { day: "Wed", views: 21345, completionRate: 74 },
  { day: "Thu", views: 19876, completionRate: 71 },
  { day: "Fri", views: 23456, completionRate: 76 },
  { day: "Sat", views: 20123, completionRate: 68 },
  { day: "Sun", views: 17654, completionRate: 65 },
];

const StoryPerformanceTab: React.FC<StoryPerformanceTabProps> = ({ platforms }) => {
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [sortBy, setSortBy] = useState("views");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{title: string, platform: string} | null>(null);

  const hasStoryPlatforms = platforms.some(p => p === "Instagram" || p === "TikTok");

  const filteredStories = selectedPlatform === "All"
    ? stories.filter(story => platforms.includes(story.platform))
    : stories.filter(story => story.platform === selectedPlatform);

  const sortedStories = [...filteredStories].sort((a, b) => {
    const multiplier = sortOrder === "desc" ? -1 : 1;
    return multiplier * (a[sortBy as keyof typeof a] > b[sortBy as keyof typeof b] ? 1 : -1);
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleCreateSimilar = (story: typeof stories[0]) => {
    setSelectedContent({
      title: story.title,
      platform: story.platform
    });
    setIsCreateDialogOpen(true);
  };

  if (!hasStoryPlatforms) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4 py-8">
            <BarChart className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <h3 className="text-xl font-medium">No Story Data Available</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Connect Instagram or TikTok to see Story performance analytics.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Story Performance</h2>
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Platforms</SelectItem>
            {platforms
              .filter(p => p === "Instagram" || p === "TikTok")
              .map(platform => (
                <SelectItem key={platform} value={platform}>{platform}</SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Story Performance</CardTitle>
            <CardDescription>Story views and completion rates for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ChartContainer config={{}}>
                <RechartsBarChart
                  data={weeklyStoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="views" fill="#8884d8" name="Views" />
                  <Bar yAxisId="right" dataKey="completionRate" fill="#82ca9d" name="Completion Rate (%)" />
                </RechartsBarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Stories</CardTitle>
              <CardDescription>
                Sorted by {
                  sortBy === "views" ? "views" : 
                  sortBy === "completionRate" ? "completion rate" : 
                  sortBy === "linkClicks" ? "link clicks" : "date"
                }
                {sortOrder === "desc" ? " (highest first)" : " (lowest first)"}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Copy className="h-4 w-4" />
              Export Data
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Story</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("views")}
                      className="flex items-center gap-1 -ml-3"
                    >
                      Views
                      {sortBy === "views" && (
                        sortOrder === "desc" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("completionRate")}
                      className="flex items-center gap-1 -ml-3"
                    >
                      Completion
                      {sortBy === "completionRate" && (
                        sortOrder === "desc" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("linkClicks")}
                      className="flex items-center gap-1 -ml-3"
                    >
                      Link Clicks
                      {sortBy === "linkClicks" && (
                        sortOrder === "desc" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("date")}
                      className="flex items-center gap-1 -ml-3"
                    >
                      Date
                      {sortBy === "date" && (
                        sortOrder === "desc" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStories.map((story) => (
                  <TableRow key={story.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <TooltipProvider>
                          <UITooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleCreateSimilar(story)}
                                className="h-8 w-8 rounded-full"
                              >
                                <Repeat className="h-4 w-4 text-purple-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Recreate content</p>
                            </TooltipContent>
                          </UITooltip>
                        </TooltipProvider>
                        <div className="relative w-10 h-16 rounded overflow-hidden">
                          <img 
                            src={story.thumbnail} 
                            alt={story.title} 
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{story.title}</div>
                          <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                            {getPlatformIcon(story.platform)}
                            <span>{story.platform}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        {story.views.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>{story.completionRate}%</TableCell>
                    <TableCell>
                      {story.hasLink ? (
                        <div className="flex items-center gap-1">
                          <Link className="h-4 w-4 text-muted-foreground" />
                          {story.linkClicks ? story.linkClicks.toLocaleString() : '0'}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(story.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Removed the "Create Similar" button from here since it's now on the left */}
                    </TableCell>
                  </TableRow>
                ))}
                {sortedStories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <BarChart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p>No story data available for the selected platform.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <CreateSimilarContentDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        contentDetails={selectedContent}
        onSave={() => setIsCreateDialogOpen(false)}
        onCancel={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
};

export default StoryPerformanceTab;
