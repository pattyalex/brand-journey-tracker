
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIRecommendationService, Recommendation } from "@/utils/AIRecommendationService";
import { Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StorageKeys, getString, setString } from "@/lib/storage";

interface AIRecommendationsProps {
  connectedPlatforms: string[];
  platformUsernames?: Record<string, string>;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ 
  connectedPlatforms,
  platformUsernames = {} 
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMoreDialog, setShowMoreDialog] = useState(false);
  const [allRecommendations, setAllRecommendations] = useState<Recommendation[]>([]);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [platformUsername, setPlatformUsername] = useState<Record<string, string>>(platformUsernames);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        // Check if OpenAI API key is set
        const hasOpenAIKey = getString(StorageKeys.openaiKeySet) === "true";
        
        const data = await AIRecommendationService.getRecommendations(connectedPlatforms, platformUsername);
        setRecommendations(data);
        
        // If we don't have an API key, show a notification
        if (!hasOpenAIKey && connectedPlatforms.length > 0) {
          toast.info(
            "Add your OpenAI API key in Settings to get personalized AI recommendations based on your content.",
            { duration: 5000 }
          );
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        // Set default recommendations on error
        setRecommendations(AIRecommendationService.getDefaultRecommendations());
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have platforms connected
    if (connectedPlatforms.length > 0) {
      fetchRecommendations();
    } else {
      setRecommendations(AIRecommendationService.getDefaultRecommendations());
      setIsLoading(false);
    }
  }, [connectedPlatforms, platformUsername]);

  const handleShowMore = async () => {
    try {
      const moreRecs = await AIRecommendationService.getMoreRecommendations(connectedPlatforms);
      setAllRecommendations(moreRecs);
      setShowMoreDialog(true);
    } catch (error) {
      console.error("Failed to fetch more recommendations:", error);
    }
  };
  
  const handleAddUsername = (platform: string) => {
    setSelectedPlatform(platform);
    setShowUsernameDialog(true);
  };
  
  const saveUsername = (username: string) => {
    if (selectedPlatform && username) {
      setPlatformUsername(prev => ({
        ...prev,
        [selectedPlatform]: username
      }));
      setShowUsernameDialog(false);
      // Local storage to persist usernames
      const storedUsernames = JSON.parse(getString(StorageKeys.platformUsernames) || '{}');
      setString(StorageKeys.platformUsernames, JSON.stringify({
        ...storedUsernames,
        [selectedPlatform]: username
      }));
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
      
      {/* Username Dialog */}
      <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Your {selectedPlatform} Username</DialogTitle>
            <DialogDescription>
              This helps us generate more personalized recommendations for your content.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username (without @)</Label>
              <Input 
                id="username" 
                defaultValue={platformUsername[selectedPlatform] || ""}
                placeholder={`Enter your ${selectedPlatform} username`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowUsernameDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={() => {
              const input = document.getElementById('username') as HTMLInputElement;
              saveUsername(input.value);
            }}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Usernames display and edit buttons */}
      {connectedPlatforms.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Connected Accounts</h4>
          <div className="flex flex-wrap gap-2">
            {connectedPlatforms.map(platform => (
              <Button
                key={platform}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleAddUsername(platform)}
              >
                {platform}
                {platformUsername[platform] ? (
                  <span className="text-xs text-green-600">@{platformUsername[platform]}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Add username</span>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default AIRecommendations;
