import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  ThumbsUp, 
  MessageSquare,
  Share2,
  Calendar, 
  BarChart,
  Instagram,
  Facebook,
  Twitter,
  Copy,
  Plus,
  Repeat
} from "lucide-react";
import CreateSimilarContentDialog from "./CreateSimilarContentDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import TimeFilterSelect from "./TimeFilterSelect";

interface PostPerformanceTabProps {
  platforms: string[];
}

const posts = [
  {
    id: "1",
    content: "Just launched my new course on content creation! 🚀 Use code LAUNCH50 for 50% off.",
    platform: "Instagram",
    thumbnail: "https://placehold.co/90x90/E1306C/white?text=Post",
    impressions: 34689,
    likes: 5432,
    comments: 278,
    shares: 132,
    date: "2023-11-10",
    engagementRate: 16.8,
  },
  {
    id: "2",
    content: "Here are 5 tools I use every day as a content creator. #3 might surprise you!",
    platform: "Twitter",
    thumbnail: "https://placehold.co/90x90/1DA1F2/white?text=Post",
    impressions: 28976,
    likes: 3241,
    comments: 187,
    shares: 415,
    date: "2023-10-28",
    engagementRate: 13.3,
  },
  {
    id: "3",
    content: "What's your biggest challenge as a content creator? Let me know in the comments!",
    platform: "Facebook",
    thumbnail: "https://placehold.co/90x90/4267B2/white?text=Post",
    impressions: 18754,
    likes: 1845,
    comments: 492,
    shares: 87,
    date: "2023-10-15",
    engagementRate: 12.9,
  },
  {
    id: "4",
    content: "Feeling grateful for this amazing community. Thank you all for your support! ❤️",
    platform: "Instagram",
    thumbnail: "https://placehold.co/90x90/E1306C/white?text=Post",
    impressions: 42315,
    likes: 7654,
    comments: 431,
    shares: 89,
    date: "2023-11-01",
    engagementRate: 19.3,
  },
  {
    id: "5",
    content: "Check out my new workspace setup! Link to all the gear in my bio.",
    platform: "Instagram",
    thumbnail: "https://placehold.co/90x90/E1306C/white?text=Post",
    impressions: 31542,
    likes: 4523,
    comments: 198,
    shares: 65,
    date: "2023-11-15",
    engagementRate: 15.2,
  },
];

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "Instagram":
      return <Instagram className="h-4 w-4 text-pink-500" />;
    case "Facebook":
      return <Facebook className="h-4 w-4 text-blue-600" />;
    case "Twitter":
      return <Twitter className="h-4 w-4 text-blue-400" />;
    default:
      return null;
  }
};

const PostPerformanceTab: React.FC<PostPerformanceTabProps> = ({ platforms }) => {
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [sortBy, setSortBy] = useState("impressions");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{title: string, platform: string} | null>(null);
  const [timeRange, setTimeRange] = useState("last30days");

  const filteredPosts = selectedPlatform === "All"
    ? posts.filter(post => platforms.includes(post.platform))
    : posts.filter(post => post.platform === selectedPlatform);

  const sortedPosts = [...filteredPosts].sort((a, b) => {
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

  const handleCreateSimilar = (post: typeof posts[0]) => {
    setSelectedContent({
      title: post.content.substring(0, 40) + (post.content.length > 40 ? "..." : ""),
      platform: post.platform
    });
    setIsCreateDialogOpen(true);
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    console.log(`Fetching post data for time range: ${range}`);
  };

  const handleCustomDateChange = (startDate: Date | undefined, endDate: Date | undefined) => {
    if (startDate && endDate) {
      console.log(`Fetching post data from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Post Performance</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <TimeFilterSelect 
            selectedRange={timeRange} 
            onDateRangeChange={handleTimeRangeChange} 
            onCustomDateChange={handleCustomDateChange}
          />
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Platforms</SelectItem>
              {platforms.map(platform => (
                <SelectItem key={platform} value={platform}>{platform}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Sorted by {
                sortBy === "impressions" ? "impressions" : 
                sortBy === "likes" ? "likes" : 
                sortBy === "comments" ? "comments" : 
                sortBy === "shares" ? "shares" : "engagement rate"
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
                <TableHead>Post</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("impressions")}
                    className="flex items-center gap-1 -ml-3"
                  >
                    Impressions
                    {sortBy === "impressions" && (
                      sortOrder === "desc" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("likes")}
                    className="flex items-center gap-1 -ml-3"
                  >
                    Likes
                    {sortBy === "likes" && (
                      sortOrder === "desc" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("comments")}
                    className="flex items-center gap-1 -ml-3"
                  >
                    Comments
                    {sortBy === "comments" && (
                      sortOrder === "desc" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("engagementRate")}
                    className="flex items-center gap-1 -ml-3"
                  >
                    Engagement
                    {sortBy === "engagementRate" && (
                      sortOrder === "desc" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleCreateSimilar(post)}
                              className="h-8 w-8 rounded-full"
                            >
                              <Repeat className="h-4 w-4 text-purple-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Recreate content</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div className="relative w-16 h-16 rounded overflow-hidden">
                        <img 
                          src={post.thumbnail} 
                          alt={post.content.substring(0, 20)} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <div className="font-medium truncate max-w-xs" title={post.content}>
                          {post.content.length > 60 ? post.content.substring(0, 60) + "..." : post.content}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                          {getPlatformIcon(post.platform)}
                          <span>{post.platform}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      {post.impressions.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                      {post.likes.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      {post.comments.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                      {post.engagementRate}%
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(post.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* No button here anymore, it's moved to the left side */}
                  </TableCell>
                </TableRow>
              ))}
              {sortedPosts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <BarChart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p>No post data available for the selected platform.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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

export default PostPerformanceTab;
