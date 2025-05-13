
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIRecommendationService, Recommendation } from "@/utils/AIRecommendationService";
import { Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface AIRecommendationsProps {
  connectedPlatforms: string[];
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ connectedPlatforms }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMoreDialog, setShowMoreDialog] = useState(false);
  const [allRecommendations, setAllRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const data = await AIRecommendationService.getRecommendations(connectedPlatforms);
        setRecommendations(data);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        // Set default recommendations on error
        setRecommendations(AIRecommendationService.getDefaultRecommendations());
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [connectedPlatforms]);

  const handleShowMore = async () => {
    try {
      const moreRecs = await AIRecommendationService.getMoreRecommendations(connectedPlatforms);
      setAllRecommendations(moreRecs);
      setShowMoreDialog(true);
    } catch (error) {
      console.error("Failed to fetch more recommendations:", error);
    }
  };

  return (
    <>
      <Card className="border border-primary/20 shadow-sm bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Recommendations
          </CardTitle>
          <CardDescription>Personalized tips based on your content performance</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-md shadow-sm h-24 animate-pulse" />
              <div className="p-4 bg-white rounded-md shadow-sm h-24 animate-pulse" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 bg-white rounded-md shadow-sm">
                  <h4 className="font-medium mb-1">{rec.title}</h4>
                  <p className="text-sm text-muted-foreground">{rec.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleShowMore}
            disabled={isLoading}
          >
            Get More Recommendations
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showMoreDialog} onOpenChange={setShowMoreDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>All AI Recommendations</DialogTitle>
            <DialogDescription>
              Personalized recommendations based on your content performance
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {allRecommendations.map((rec, index) => (
              <div key={index} className="p-4 bg-primary/5 rounded-md">
                <h4 className="font-medium mb-1">{rec.title}</h4>
                <p className="text-sm">{rec.content}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIRecommendations;
