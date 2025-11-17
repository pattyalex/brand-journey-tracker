
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { Instagram, Facebook, Twitter, Youtube, Users, BarChart, Percent, Clock, MapPin, ChevronDown, Plus } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import SocialMediaConnector from "@/components/analytics/SocialMediaConnector";
import OverviewTab from "@/components/analytics/OverviewTab";
import CommunityTab from "@/components/analytics/CommunityTab";
import VideoPerformanceTab from "@/components/analytics/VideoPerformanceTab";
import PostPerformanceTab from "@/components/analytics/PostPerformanceTab";
import StoryPerformanceTab from "@/components/analytics/StoryPerformanceTab";

const Analytics = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  
  const handleConnectPlatform = (platform: string) => {
    if (!connectedPlatforms.includes(platform)) {
      setConnectedPlatforms([...connectedPlatforms, platform]);
      toast.success(`${platform} connected successfully`);
    } else {
      toast.info(`${platform} is already connected`);
    }
  };

  const handleDisconnectPlatform = (platform: string) => {
    setConnectedPlatforms(connectedPlatforms.filter(p => p !== platform));
    toast.success(`${platform} disconnected`);
  };

  return (
    <Layout>
      <div className="w-full max-w-[1600px] mx-auto px-8 py-6 space-y-8 fade-in">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track, analyze, and improve your content performance
          </p>
        </div>
        
        {/* Platform Connector Section */}
        <SocialMediaConnector 
          connectedPlatforms={connectedPlatforms}
          onConnect={handleConnectPlatform}
          onDisconnect={handleDisconnectPlatform}
        />
        
        {connectedPlatforms.length > 0 ? (
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
              <TabsTrigger value="videos">Video Performance</TabsTrigger>
              <TabsTrigger value="posts">Post Performance</TabsTrigger>
              <TabsTrigger value="stories">Story Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <OverviewTab platforms={connectedPlatforms} />
            </TabsContent>
            
            <TabsContent value="community">
              <CommunityTab platforms={connectedPlatforms} />
            </TabsContent>
            
            <TabsContent value="videos">
              <VideoPerformanceTab platforms={connectedPlatforms} />
            </TabsContent>
            
            <TabsContent value="posts">
              <PostPerformanceTab platforms={connectedPlatforms} />
            </TabsContent>
            
            <TabsContent value="stories">
              <StoryPerformanceTab platforms={connectedPlatforms} />
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4 py-8">
                <BarChart className="mx-auto h-12 w-12 text-muted-foreground/60" />
                <h3 className="text-xl font-medium">Connect Your Social Platforms</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Connect your social media accounts to see analytics data across all your platforms in one place.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
