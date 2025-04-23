
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Instagram, Linkedin, Twitter, Youtube, TrendingUp } from 'lucide-react';

interface TrendingContent {
  title: string;
  platform: string;
  views: string;
  description?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
}

interface TrendingContentDialogProps {
  content: TrendingContent;
  isOpen: boolean;
  onClose: () => void;
}

const TrendingContentDialog = ({ content, isOpen, onClose }: TrendingContentDialogProps) => {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{content.title}</span>
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              {getPlatformIcon(content.platform)}
              {content.platform}
              <span className="ml-2">{content.views}</span>
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {content.mediaUrl && (
            <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
              {content.mediaType === 'video' ? (
                <video
                  src={content.mediaUrl}
                  className="object-cover w-full h-full"
                  controls
                  autoPlay
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
            <p className="text-muted-foreground">{content.description}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrendingContentDialog;
