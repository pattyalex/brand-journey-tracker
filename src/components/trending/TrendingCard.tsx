
import { Instagram, Linkedin, Twitter, Youtube, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TrendingContent {
  title: string;
  platform: string;
  views: string;
  description: string;
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

  return (
    <Card className="hover:shadow-md transition-shadow">
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
  );
};

export default TrendingCard;
