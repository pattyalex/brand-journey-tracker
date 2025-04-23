
import { Instagram, Linkedin, Twitter, Youtube, TrendingUp, Image, Video } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface TrendingContent {
  title: string;
  platform: string;
  views: string;
  description?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
}

interface TrendingCardProps {
  content: TrendingContent;
}

const TrendingCard = ({ content }: TrendingCardProps) => {
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

  const getMediaTypeIcon = (mediaType?: string) => {
    switch (mediaType) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex justify-between items-start">
          <span className="flex items-center gap-2">
            {getMediaTypeIcon(content.mediaType)}
            {content.title}
          </span>
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
      <CardContent className="space-y-4">
        {content.mediaUrl && (
          <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
            {content.mediaType === 'video' ? (
              <video
                src={content.mediaUrl}
                className="object-cover w-full h-full"
                controls
              />
            ) : (
              <img
                src={content.mediaUrl}
                alt={content.title}
                className="object-cover w-full h-full"
              />
            )}
          </AspectRatio>
        )}
        {content.description && (
          <p className="text-sm text-muted-foreground">{content.description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendingCard;
