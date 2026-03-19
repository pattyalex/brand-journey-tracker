import React from "react";
import {
  Eye, ThumbsUp, MessageSquare, Share2, BookmarkIcon, Repeat, Clock,
  Youtube, Instagram, Facebook, Twitter,
} from "lucide-react";
import PerformanceTab, { ContentCellLayout, ContentCellHelpers } from "./PerformanceTab";

interface VideoPerformanceTabProps {
  platforms: string[];
}

interface Video {
  id: string;
  title: string;
  platform: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saved: number;
  watchTime: string;
  retentionRate: number;
  date: string;
  link: string;
}

const videos: Video[] = [
  { id: "1", title: "How I Made $10,000 in My First Month as a Content Creator", platform: "YouTube", thumbnail: "https://placehold.co/120x68/333/white?text=Video+1", views: 156283, likes: 12453, comments: 843, shares: 2453, saved: 3724, watchTime: "28:52", retentionRate: 64, date: "2023-09-15", link: "https://youtube.com/watch?v=sample1" },
  { id: "2", title: "5 Productivity Tips Every Creator Should Know", platform: "YouTube", thumbnail: "https://placehold.co/120x68/333/white?text=Video+2", views: 98456, likes: 7845, comments: 512, shares: 1845, saved: 2567, watchTime: "12:24", retentionRate: 72, date: "2023-10-02", link: "https://youtube.com/watch?v=sample2" },
  { id: "3", title: "Behind the Scenes: My Content Creation Setup", platform: "Instagram", thumbnail: "https://placehold.co/120x68/E1306C/white?text=Video+3", views: 68932, likes: 9456, comments: 745, shares: 1267, saved: 1932, watchTime: "05:18", retentionRate: 58, date: "2023-10-18", link: "https://instagram.com/p/sample3" },
  { id: "4", title: "How to Grow Your Audience in 30 Days", platform: "Facebook", thumbnail: "https://placehold.co/120x68/4267B2/white?text=Video+4", views: 45238, likes: 3456, comments: 287, shares: 956, saved: 786, watchTime: "19:34", retentionRate: 51, date: "2023-11-05", link: "https://facebook.com/videos/sample4" },
  { id: "5", title: "My Morning Routine as a Full-Time Creator", platform: "YouTube", thumbnail: "https://placehold.co/120x68/333/white?text=Video+5", views: 34589, likes: 2876, comments: 234, shares: 567, saved: 932, watchTime: "08:47", retentionRate: 49, date: "2023-11-20", link: "https://youtube.com/watch?v=sample5" },
];

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "YouTube": return <Youtube className="h-4 w-4 text-red-500" />;
    case "Instagram": return <Instagram className="h-4 w-4 text-pink-500" />;
    case "Facebook": return <Facebook className="h-4 w-4 text-blue-600" />;
    case "Twitter": return <Twitter className="h-4 w-4 text-blue-400" />;
    default: return null;
  }
};

const VideoPerformanceTab: React.FC<VideoPerformanceTabProps> = ({ platforms }) => (
  <PerformanceTab<Video>
    platforms={platforms}
    config={{
      title: "Video Performance",
      emptyMessage: "No video data available for the selected platform.",
      items: videos,
      defaultSortKey: "views",
      dataTypeLabel: "video",
      getItemTitle: (v) => v.title,
      getItemPlatform: (v) => v.platform,
      getItemUrl: (v) => v.link,
      getItemKey: (v) => v.id,
      renderContentCell: (video: Video, helpers: ContentCellHelpers) => (
        <ContentCellLayout
          thumbnailSrc={video.thumbnail}
          thumbnailAlt={video.title}
          thumbnailClassName="w-24 h-14"
          title={video.title.length > 40 ? video.title.substring(0, 40) + "..." : video.title}
          subtitle={
            <div className="flex items-center gap-1">
              {getPlatformIcon(video.platform)}
              <span>{video.platform}</span>
              <span>&bull;</span>
              <Clock className="h-3 w-3" />
              <span>{video.watchTime}</span>
            </div>
          }
          helpers={helpers}
        />
      ),
      columns: [
        { key: "views", label: "Views", render: (v) => <div className="flex items-center gap-1"><Eye className="h-4 w-4 text-muted-foreground" />{v.views.toLocaleString()}</div> },
        { key: "likes", label: "Likes", render: (v) => <div className="flex items-center gap-1"><ThumbsUp className="h-4 w-4 text-muted-foreground" />{v.likes.toLocaleString()}</div> },
        { key: "comments", label: "Comments", render: (v) => <div className="flex items-center gap-1"><MessageSquare className="h-4 w-4 text-muted-foreground" />{v.comments.toLocaleString()}</div> },
        { key: "shares", label: "Shares", render: (v) => <div className="flex items-center gap-1"><Share2 className="h-4 w-4 text-muted-foreground" />{v.shares.toLocaleString()}</div> },
        { key: "saved", label: "Saved", sortDescriptionLabel: "saves", render: (v) => <div className="flex items-center gap-1"><BookmarkIcon className="h-4 w-4 text-muted-foreground" />{v.saved.toLocaleString()}</div> },
        { key: "retentionRate", label: "Retention", sortDescriptionLabel: "retention rate", render: (v) => <div className="flex items-center gap-1"><Repeat className="h-4 w-4 text-muted-foreground" />{v.retentionRate}%</div> },
        { key: "date", label: "Date", sortable: false, render: (v) => <>{new Date(v.date).toLocaleDateString()}</> },
      ],
    }}
  />
);

export default VideoPerformanceTab;
