
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface Comment {
  id: number;
  text: string;
  timestamp: string;
}

const CommentsSection = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now(),
      text: newComment,
      timestamp: new Date().toLocaleString()
    };
    
    setComments(prev => [...prev, comment]);
    setNewComment("");
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments & Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment or feedback..."
            className="min-h-[80px]"
          />
          <Button onClick={addComment} className="w-full">
            Add Comment
          </Button>
        </div>
        {comments.length > 0 && (
          <div className="space-y-3">
            {comments.map(comment => (
              <div key={comment.id} className="bg-muted p-3 rounded-lg">
                <p className="text-sm">{comment.text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {comment.timestamp}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommentsSection;
