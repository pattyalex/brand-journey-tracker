
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
  Clock, 
  Repeat, 
  BarChart,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  ExternalLink
} from "lucide-react";

interface VideoPerformanceTabProps {
  platforms: string[];
}

// Mock data - would be replaced with real API data
const videos = [
  {
    id: "1",
    title: "How I Made $10,000 in My First Month as a Content Creator",
    platform: "YouTube",
    thumbnail: "https://placehold.co/120x68/333/white?text=Video+1",
    views: 156283,
    likes: 12453,
    comments: 843,
    watchTime: "28:52",
    retentionRate: 64,
    date: "2023-09-15",
  },
  {
    id: "2",
    title: "5 Productivity Tips Every Creator Should Know",
    platform: "YouTube",
    thumbnail: "https://placehold.co/120x68/333/white?text=Video+2",
    views: 98456,
    likes: 7845,
    comments: 512,
    watchTime: "12:24",
    retentionRate: 72,
    date: "2023-10-02",
  },
  {
    id: "3",
    title: "Behind the Scenes: My Content Creation Setup",
    platform: "Instagram",
    thumbnail: "https://placehold.co/120x68/E1306C/white?text=Video+3",
    views: 68932,
    likes: 9456,
    comments: 745,
    watchTime: "05:18",
    retentionRate: 58,
    date: "2023-10-18",
  },
  {
    id: "4",
    title: "How to Grow Your Audience in 30 Days",
    platform: "Facebook",
    thumbnail: "https://placehold.co/120x68/4267B2/white?text=Video+4",
    views: 45238,
    likes: 3456,
    comments: 287,
    watchTime: "19:34",
    retentionRate: 51,
    date: "2023-11-05",
  },
  {
    id: "5",
    title: "My Morning Routine as a Full-Time Creator",
    platform: "YouTube",
    thumbnail: "https://placehold.co/120x68/333/white?text=Video+5",
    views: 34589,
    likes: 2876,
    comments: 234,
    watchTime: "08:47",
    retentionRate: 49,
    date: "2023-11-20",
  },
];

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "YouTube":
      return <Youtube className="h-4 w-4 text-red-500" />;
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

const VideoPerformanceTab: React.FC<VideoPerformanceTabProps> = ({ platforms }) => {
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [sortBy, setSortBy] = useState("views");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredVideos = selectedPlatform === "All"
    ? videos.filter(video => platforms.includes(video.platform))
    : videos.filter(video => video.platform === selectedPlatform);

  const sortedVideos = [...filteredVideos].sort((a, b) => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Video Performance</h2>
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

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Sorted by {sortBy === "views" ? "views" : sortBy === "likes" ? "likes" : sortBy === "comments" ? "comments" : "retention rate"}
            {sortOrder === "desc" ? " (highest first)" : " (lowest first)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video</TableHead>
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
                    onClick={() => handleSort("retentionRate")}
                    className="flex items-center gap-1 -ml-3"
                  >
                    Retention
                    {sortBy === "retentionRate" && (
                      sortOrder === "desc" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVideos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative w-24 h-14 rounded overflow-hidden">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <div className="font-medium truncate max-w-xs" title={video.title}>
                          {video.title.length > 40 ? video.title.substring(0, 40) + "..." : video.title}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                          {getPlatformIcon(video.platform)}
                          <span>{video.platform}</span>
                          <span>&bull;</span>
                          <Clock className="h-3 w-3" />
                          <span>{video.watchTime}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      {video.views.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                      {video.likes.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      {video.comments.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Repeat className="h-4 w-4 text-muted-foreground" />
                      {video.retentionRate}%
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(video.date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {sortedVideos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <BarChart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p>No video data available for the selected platform.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoPerformanceTab;
