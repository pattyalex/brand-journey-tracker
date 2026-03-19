import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Eye, BarChart, Instagram, Link, Calendar, Music, Share2, BookmarkIcon, ExternalLink,
} from "lucide-react";
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import PerformanceTab, { ContentCellLayout, ContentCellHelpers } from "./PerformanceTab";

interface StoryPerformanceTabProps {
  platforms: string[];
}

interface Story {
  id: string;
  title: string;
  platform: string;
  thumbnail: string;
  views: number;
  completionRate: number;
  linkClicks: number | null;
  shares: number;
  saved: number;
  date: string;
  hasLink: boolean;
  url: string;
}

const stories: Story[] = [
  { id: "1", title: "Morning routine", platform: "Instagram", thumbnail: "https://placehold.co/90x160/E1306C/white?text=Story", views: 12543, completionRate: 75, linkClicks: 234, shares: 132, saved: 341, date: "2023-11-22", hasLink: true, url: "https://instagram.com/stories/user/example1" },
  { id: "2", title: "New product sneak peek", platform: "Instagram", thumbnail: "https://placehold.co/90x160/E1306C/white?text=Story", views: 10876, completionRate: 68, linkClicks: 312, shares: 87, saved: 265, date: "2023-11-20", hasLink: true, url: "https://instagram.com/stories/user/example2" },
  { id: "3", title: "Q&A session", platform: "TikTok", thumbnail: "https://placehold.co/90x160/000000/white?text=Story", views: 8432, completionRate: 82, linkClicks: 189, shares: 178, saved: 219, date: "2023-11-18", hasLink: true, url: "https://tiktok.com/@user/video/example3" },
  { id: "4", title: "Behind the scenes", platform: "Instagram", thumbnail: "https://placehold.co/90x160/E1306C/white?text=Story", views: 9543, completionRate: 71, linkClicks: 0, shares: 56, saved: 187, date: "2023-11-15", hasLink: false, url: "https://instagram.com/stories/user/example4" },
  { id: "5", title: "Promotion announcement", platform: "TikTok", thumbnail: "https://placehold.co/90x160/000000/white?text=Story", views: 7654, completionRate: 64, linkClicks: 276, shares: 145, saved: 232, date: "2023-11-12", hasLink: true, url: "https://tiktok.com/@user/video/example5" },
  { id: "6", title: "Daily vlog highlight", platform: "Instagram", thumbnail: "https://placehold.co/90x160/E1306C/white?text=Story", views: 6432, completionRate: 55, linkClicks: null, shares: 42, saved: 125, date: "2023-11-10", hasLink: false, url: "https://instagram.com/stories/user/example6" },
];

const weeklyStoryData = [
  { day: "Mon", views: 15253, completionRate: 72 },
  { day: "Tue", views: 18456, completionRate: 69 },
  { day: "Wed", views: 21345, completionRate: 74 },
  { day: "Thu", views: 19876, completionRate: 71 },
  { day: "Fri", views: 23456, completionRate: 76 },
  { day: "Sat", views: 20123, completionRate: 68 },
  { day: "Sun", views: 17654, completionRate: 65 },
];

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "Instagram": return <Instagram className="h-4 w-4 text-pink-500" />;
    case "TikTok": return <Music className="h-4 w-4 text-black" />;
    default: return null;
  }
};

const WeeklyChart = () => (
  <Card>
    <CardHeader>
      <CardTitle>Weekly Story Performance</CardTitle>
      <CardDescription>Story views and completion rates for the past week</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-80 w-full">
        <ChartContainer config={{}}>
          <RechartsBarChart data={weeklyStoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
);

const StoryPerformanceTab: React.FC<StoryPerformanceTabProps> = ({ platforms }) => (
  <PerformanceTab<Story>
    platforms={platforms}
    config={{
      title: "Story Performance",
      cardTitle: "Recent Stories",
      emptyMessage: "No story data available for the selected platform.",
      items: stories,
      defaultSortKey: "views",
      dataTypeLabel: "story",
      getItemTitle: (s) => s.title,
      getItemPlatform: (s) => s.platform,
      getItemUrl: (s) => s.url,
      getItemKey: (s) => s.id,
      hasPlatformCheck: (ps) => ps.some(p => p === "Instagram" || p === "TikTok"),
      noPlatformMessage: (
        <>
          <h3 className="text-xl font-medium">No Story Data Available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Connect Instagram or TikTok to see Story performance analytics.
          </p>
        </>
      ),
      filterPlatforms: (ps) => ps.filter(p => p === "Instagram" || p === "TikTok"),
      renderAboveTable: () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeeklyChart />
        </div>
      ),
      renderContentCell: (story: Story, helpers: ContentCellHelpers) => (
        <ContentCellLayout
          thumbnailSrc={story.thumbnail}
          thumbnailAlt={story.title}
          thumbnailClassName="w-10 h-16"
          title={story.title}
          subtitle={
            <div className="flex items-center gap-1">
              {getPlatformIcon(story.platform)}
              <span>{story.platform}</span>
            </div>
          }
          helpers={helpers}
        />
      ),
      columns: [
        { key: "views", label: "Views", render: (s) => <div className="flex items-center gap-1"><Eye className="h-4 w-4 text-muted-foreground" />{s.views.toLocaleString()}</div> },
        { key: "completionRate", label: "Completion", sortDescriptionLabel: "completion rate", render: (s) => <>{s.completionRate}%</> },
        { key: "shares", label: "Shares", render: (s) => <div className="flex items-center gap-1"><Share2 className="h-4 w-4 text-muted-foreground" />{s.shares?.toLocaleString() || "0"}</div> },
        { key: "saved", label: "Saved", sortDescriptionLabel: "saves", render: (s) => <div className="flex items-center gap-1"><BookmarkIcon className="h-4 w-4 text-muted-foreground" />{s.saved?.toLocaleString() || "0"}</div> },
        { key: "linkClicks", label: "Link Clicks", sortDescriptionLabel: "link clicks", render: (s) => s.hasLink ? <div className="flex items-center gap-1"><Link className="h-4 w-4 text-muted-foreground" />{s.linkClicks ? s.linkClicks.toLocaleString() : "0"}</div> : <span className="text-muted-foreground">N/A</span> },
        { key: "date", label: "Date", sortDescriptionLabel: "date", render: (s) => <div className="flex items-center gap-1"><Calendar className="h-4 w-4 text-muted-foreground" />{new Date(s.date).toLocaleDateString()}</div> },
      ],
    }}
  />
);

export default StoryPerformanceTab;
