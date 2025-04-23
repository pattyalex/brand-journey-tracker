
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Eye, ThumbsUp, MessageSquare, Share2, Bookmark, Instagram, Video } from 'lucide-react';

interface TrendingContent {
  title: string;
  platform: string;
  creator: string;
  duration?: string;
  views: string;
  likes: string;
  comments: string;
  shares: string;
  saves: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
}

interface TrendingContentDialogProps {
  content: TrendingContent;
  isOpen: boolean;
  onClose: () => void;
}

const TrendingContentDialog = ({ content, isOpen, onClose }: TrendingContentDialogProps) => {
  const MetricDisplay = ({ icon: Icon, value }: { icon: any, value: string }) => (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="w-4 h-4" />
      <span>{value}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{content.title}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Instagram className="w-4 h-4" />
                <span>{content.creator}</span>
                {content.mediaType === 'video' && (
                  <Video className="w-4 h-4 ml-2" />
                )}
              </div>
            </div>
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
          <div className="flex items-center justify-between px-4">
            <MetricDisplay icon={Eye} value={content.views} />
            <MetricDisplay icon={ThumbsUp} value={content.likes} />
            <MetricDisplay icon={MessageSquare} value={content.comments} />
            <MetricDisplay icon={Share2} value={content.shares} />
            <MetricDisplay icon={Bookmark} value={content.saves} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrendingContentDialog;
