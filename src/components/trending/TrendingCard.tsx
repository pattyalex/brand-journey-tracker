
import { useState } from 'react';
import { Eye, ThumbsUp, MessageSquare, Share2, Bookmark, Instagram, Video, RefreshCw } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import TrendingContentDialog from './TrendingContentDialog';
import CreateSimilarContentDialog from '../analytics/CreateSimilarContentDialog';
import { toast } from "sonner";

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
  description?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
}

interface TrendingCardProps {
  content: TrendingContent;
}

const TrendingCard = ({ content }: TrendingCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRecreateDialogOpen, setIsRecreateDialogOpen] = useState(false);

  const MetricDisplay = ({ icon: Icon, value }: { icon: any, value: string }) => (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="w-4 h-4" />
      <span>{value}</span>
    </div>
  );

  const handleRecreateClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from triggering
    setIsRecreateDialogOpen(true);
  };

  const handleRecreateComplete = () => {
    setIsRecreateDialogOpen(false);
    toast.success("Content idea created successfully!");
  };

  return (
    <>
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer" 
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="flex gap-4 p-4">
          <div className="flex flex-col justify-center">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full p-2 hover:bg-purple-100 focus:bg-purple-100 transition-colors group"
              onClick={handleRecreateClick}
            >
              <RefreshCw 
                className="w-5 h-5 text-purple-600 group-hover:text-purple-700 transition-colors" 
                strokeWidth={2.5} 
              />
            </Button>
          </div>
          <div className="w-40 h-28 bg-muted rounded-md overflow-hidden flex-shrink-0">
            {content.mediaUrl && (
              <AspectRatio ratio={16 / 9} className="h-full">
                {content.mediaType === 'video' ? (
                  <div className="relative h-full">
                    <video
                      src={content.mediaUrl}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1 rounded">
                      {content.duration}
                    </div>
                  </div>
                ) : (
                  <img
                    src={content.mediaUrl}
                    alt={content.title}
                    className="object-cover w-full h-full"
                  />
                )}
              </AspectRatio>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{content.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Instagram className="w-4 h-4" />
                  <span>{content.creator}</span>
                  {content.mediaType === 'video' && (
                    <Video className="w-4 h-4 ml-2" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <MetricDisplay icon={Eye} value={content.views} />
              <MetricDisplay icon={ThumbsUp} value={content.likes} />
              <MetricDisplay icon={MessageSquare} value={content.comments} />
              <MetricDisplay icon={Share2} value={content.shares} />
              <MetricDisplay icon={Bookmark} value={content.saves} />
            </div>
          </div>
        </div>
      </Card>
      
      <TrendingContentDialog 
        content={content}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />

      <CreateSimilarContentDialog
        open={isRecreateDialogOpen}
        onOpenChange={setIsRecreateDialogOpen}
        contentDetails={{
          title: content.title,
          platform: content.platform,
          link: content.mediaUrl,
        }}
        onSave={handleRecreateComplete}
        onCancel={() => setIsRecreateDialogOpen(false)}
      />
    </>
  );
};

export default TrendingCard;
