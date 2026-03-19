import React from "react";
import {
  Eye, ThumbsUp, MessageSquare, Share2, BookmarkIcon, BarChart,
  Instagram, Facebook, Twitter,
} from "lucide-react";
import PerformanceTab, { ContentCellLayout, ContentCellHelpers } from "./PerformanceTab";

interface PostPerformanceTabProps {
  platforms: string[];
}

interface Post {
  id: string;
  content: string;
  platform: string;
  thumbnail: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saved: number;
  date: string;
  engagementRate: number;
  url: string;
}

const posts: Post[] = [
  { id: "1", content: "Just launched my new course on content creation! 🚀 Use code LAUNCH50 for 50% off.", platform: "Instagram", thumbnail: "https://placehold.co/90x90/E1306C/white?text=Post", impressions: 34689, likes: 5432, comments: 278, shares: 132, saved: 421, date: "2023-11-10", engagementRate: 16.8, url: "https://instagram.com/p/example1" },
  { id: "2", content: "Here are 5 tools I use every day as a content creator. #3 might surprise you!", platform: "Twitter", thumbnail: "https://placehold.co/90x90/1DA1F2/white?text=Post", impressions: 28976, likes: 3241, comments: 187, shares: 415, saved: 132, date: "2023-10-28", engagementRate: 13.3, url: "https://twitter.com/example/status/example2" },
  { id: "3", content: "What's your biggest challenge as a content creator? Let me know in the comments!", platform: "Facebook", thumbnail: "https://placehold.co/90x90/4267B2/white?text=Post", impressions: 18754, likes: 1845, comments: 492, shares: 87, saved: 98, date: "2023-10-15", engagementRate: 12.9, url: "https://facebook.com/posts/example3" },
  { id: "4", content: "Feeling grateful for this amazing community. Thank you all for your support! ❤️", platform: "Instagram", thumbnail: "https://placehold.co/90x90/E1306C/white?text=Post", impressions: 42315, likes: 7654, comments: 431, shares: 89, saved: 652, date: "2023-11-01", engagementRate: 19.3, url: "https://instagram.com/p/example4" },
  { id: "5", content: "Check out my new workspace setup! Link to all the gear in my bio.", platform: "Instagram", thumbnail: "https://placehold.co/90x90/E1306C/white?text=Post", impressions: 31542, likes: 4523, comments: 198, shares: 65, saved: 387, date: "2023-11-15", engagementRate: 15.2, url: "https://instagram.com/p/example5" },
];

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "Instagram": return <Instagram className="h-4 w-4 text-pink-500" />;
    case "Facebook": return <Facebook className="h-4 w-4 text-blue-600" />;
    case "Twitter": return <Twitter className="h-4 w-4 text-blue-400" />;
    default: return null;
  }
};

const PostPerformanceTab: React.FC<PostPerformanceTabProps> = ({ platforms }) => (
  <PerformanceTab<Post>
    platforms={platforms}
    config={{
      title: "Post Performance",
      emptyMessage: "No post data available for the selected platform.",
      items: posts,
      defaultSortKey: "impressions",
      dataTypeLabel: "post",
      getItemTitle: (p) => p.content.substring(0, 40) + (p.content.length > 40 ? "..." : ""),
      getItemPlatform: (p) => p.platform,
      getItemUrl: (p) => p.url,
      getItemKey: (p) => p.id,
      renderContentCell: (post: Post, helpers: ContentCellHelpers) => (
        <ContentCellLayout
          thumbnailSrc={post.thumbnail}
          thumbnailAlt={post.content.substring(0, 20)}
          thumbnailClassName="w-16 h-16"
          title={post.content.length > 60 ? post.content.substring(0, 60) + "..." : post.content}
          subtitle={
            <div className="flex items-center gap-1">
              {getPlatformIcon(post.platform)}
              <span>{post.platform}</span>
            </div>
          }
          helpers={helpers}
        />
      ),
      columns: [
        { key: "impressions", label: "Impressions", sortDescriptionLabel: "impressions", render: (p) => <div className="flex items-center gap-1"><Eye className="h-4 w-4 text-muted-foreground" />{p.impressions.toLocaleString()}</div> },
        { key: "likes", label: "Likes", render: (p) => <div className="flex items-center gap-1"><ThumbsUp className="h-4 w-4 text-muted-foreground" />{p.likes.toLocaleString()}</div> },
        { key: "comments", label: "Comments", render: (p) => <div className="flex items-center gap-1"><MessageSquare className="h-4 w-4 text-muted-foreground" />{p.comments.toLocaleString()}</div> },
        { key: "shares", label: "Shares", render: (p) => <div className="flex items-center gap-1"><Share2 className="h-4 w-4 text-muted-foreground" />{p.shares.toLocaleString()}</div> },
        { key: "saved", label: "Saved", sortDescriptionLabel: "saves", render: (p) => <div className="flex items-center gap-1"><BookmarkIcon className="h-4 w-4 text-muted-foreground" />{p.saved.toLocaleString()}</div> },
        { key: "engagementRate", label: "Engagement", sortDescriptionLabel: "engagement rate", render: (p) => <div className="flex items-center gap-1"><BarChart className="h-4 w-4 text-muted-foreground" />{p.engagementRate}%</div> },
        { key: "date", label: "Date", sortable: false, render: (p) => <>{new Date(p.date).toLocaleDateString()}</> },
      ],
    }}
  />
);

export default PostPerformanceTab;
