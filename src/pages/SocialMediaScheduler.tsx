
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Youtube, 
  ArrowRight, 
  Plus, 
  Calendar, 
  Clock, 
  ExternalLink,
  BellRing
} from 'lucide-react';
import PlatformIcon from '@/components/content/weeklyFlow/PlatformIcon';
import { Platform } from '@/types/content-flow';

const SocialMediaScheduler = () => {
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);

  // Sample scheduled posts data
  const scheduledPosts = [
    {
      id: 1,
      title: "New Product Launch",
      platform: "instagram",
      date: "2023-08-15",
      time: "10:00 AM",
      status: "scheduled",
    },
    {
      id: 2,
      title: "Weekly Tips & Tricks",
      platform: "facebook",
      date: "2023-08-16",
      time: "3:30 PM",
      status: "scheduled",
    },
    {
      id: 3,
      title: "Customer Testimonial",
      platform: "linkedin",
      date: "2023-08-17",
      time: "9:00 AM",
      status: "draft",
    }
  ];

  const platforms = [
    { name: "Instagram", icon: <Instagram size={24} />, id: "instagram" },
    { name: "Facebook", icon: <Facebook size={24} />, id: "facebook" },
    { name: "Twitter", icon: <Twitter size={24} />, id: "twitter" },
    { name: "LinkedIn", icon: <Linkedin size={24} />, id: "linkedin" },
    { name: "YouTube", icon: <Youtube size={24} />, id: "youtube" },
  ];

  const handleConnectAccount = (platformId: string) => {
    // In a real app, this would handle OAuth flow
    setConnectedAccounts([...connectedAccounts, platformId]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-green-500">Scheduled</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getPlatformIcon = (platformId: string): Platform => {
    const iconMapping: Record<string, string> = {
      instagram: "instagram",
      facebook: "pencil",
      twitter: "at-sign",
      linkedin: "briefcase",
      youtube: "play"
    };
    
    return {
      id: platformId,
      name: platformId.charAt(0).toUpperCase() + platformId.slice(1),
      icon: iconMapping[platformId] || "pencil"
    };
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Social Media Scheduler</h1>
          <Button>
            <Plus className="mr-2" size={16} />
            Create Post
          </Button>
        </div>

        {/* Connected Accounts Section */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>Connect your social media accounts to schedule posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {platforms.map((platform) => (
                <Card key={platform.id} className="border hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {platform.icon}
                      <span className="font-medium">{platform.name}</span>
                    </div>
                    {connectedAccounts.includes(platform.id) ? (
                      <Badge className="bg-green-500">Connected</Badge>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleConnectAccount(platform.id)}
                      >
                        Connect
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Posts Section */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Posts</CardTitle>
            <CardDescription>Manage your upcoming social media posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <PlatformIcon platform={getPlatformIcon(post.platform)} size={18} />
                    <div>
                      <h3 className="font-medium">{post.title}</h3>
                      <div className="text-sm text-gray-500 flex gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {post.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    {getStatusBadge(post.status)}
                    <Button variant="ghost" size="sm">
                      <ExternalLink size={14} className="mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline">
              View All Scheduled Posts
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Tips Section */}
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing size={20} />
              Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Schedule posts at optimal times to maximize engagement</li>
              <li>Use a consistent posting schedule to build audience expectations</li>
              <li>Cross-promote content across different platforms</li>
              <li>Review analytics regularly to refine your content strategy</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SocialMediaScheduler;
