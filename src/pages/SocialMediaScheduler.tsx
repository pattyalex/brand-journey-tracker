
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { Instagram, Facebook, Twitter, Youtube, ExternalLink, Settings, Plus, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Type definition for content items from calendar
interface ContentItem {
  id: string;
  title: string;
  description?: string;
  format?: string;
  tags?: string[];
  platforms?: string[];
  scheduledDate?: Date | null;
  url?: string;
}

// Type for connected social media accounts
interface SocialAccount {
  id: string;
  platform: "instagram" | "facebook" | "twitter" | "youtube";
  username: string;
  profileImage?: string;
  isConnected: boolean;
}

// Type for scheduled social posts
interface ScheduledPost {
  id: string;
  contentId: string;
  accountId: string;
  platform: string;
  scheduledTime: string;
  status: "scheduled" | "posted" | "failed";
  postText: string;
  mediaUrls?: string[];
}

const SocialMediaScheduler = () => {
  const [scheduledContent, setScheduledContent] = useState<ContentItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [newAccountPlatform, setNewAccountPlatform] = useState<"instagram" | "facebook" | "twitter" | "youtube">("instagram");
  const [newAccountUsername, setNewAccountUsername] = useState("");
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [postTime, setPostTime] = useState("12:00");
  const [postText, setPostText] = useState("");
  const { toast } = useToast();

  // Load content from localStorage
  useEffect(() => {
    try {
      const scheduledData = localStorage.getItem('scheduledContent');
      if (scheduledData) {
        const parsedData = JSON.parse(scheduledData);
        const contentWithDates = parsedData.map((item: any) => ({
          ...item,
          scheduledDate: item.scheduledDate ? new Date(item.scheduledDate) : null,
        }));
        setScheduledContent(contentWithDates);
      }

      // Load connected accounts from localStorage
      const accountsData = localStorage.getItem('connectedSocialAccounts');
      if (accountsData) {
        setConnectedAccounts(JSON.parse(accountsData));
      }

      // Load scheduled posts from localStorage
      const postsData = localStorage.getItem('scheduledSocialPosts');
      if (postsData) {
        setScheduledPosts(JSON.parse(postsData));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  // Save connected accounts to localStorage when they change
  useEffect(() => {
    localStorage.setItem('connectedSocialAccounts', JSON.stringify(connectedAccounts));
  }, [connectedAccounts]);

  // Save scheduled posts to localStorage when they change
  useEffect(() => {
    localStorage.setItem('scheduledSocialPosts', JSON.stringify(scheduledPosts));
  }, [scheduledPosts]);

  // Filter content for selected date
  const getContentForDate = () => {
    return scheduledContent.filter(item => {
      if (!item.scheduledDate) return false;
      const contentDate = new Date(item.scheduledDate);
      return (
        contentDate.getDate() === selectedDate.getDate() &&
        contentDate.getMonth() === selectedDate.getMonth() &&
        contentDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  };

  // Get posts scheduled for the selected date
  const getScheduledPostsForDate = () => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduledTime);
      return (
        postDate.getDate() === selectedDate.getDate() &&
        postDate.getMonth() === selectedDate.getMonth() &&
        postDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  };

  // Handle connecting a new social account
  const handleConnectAccount = () => {
    if (!newAccountUsername.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    // In a real application, this would involve OAuth or API integration
    // For demo purposes, we're just simulating the connection
    const newAccount: SocialAccount = {
      id: Math.random().toString(36).substring(2, 9),
      platform: newAccountPlatform,
      username: newAccountUsername,
      isConnected: true,
    };

    setConnectedAccounts(prev => [...prev, newAccount]);
    setIsConnectDialogOpen(false);
    setNewAccountUsername("");

    toast({
      title: "Account Connected",
      description: `Your ${newAccountPlatform} account @${newAccountUsername} has been connected.`,
    });
  };

  // Handle scheduling a post
  const handleSchedulePost = () => {
    if (!selectedContent) return;
    if (!selectedAccount) {
      toast({
        title: "Error",
        description: "Please select an account to post to",
        variant: "destructive",
      });
      return;
    }

    // Create the scheduled post
    const scheduledTime = new Date(selectedDate);
    const [hours, minutes] = postTime.split(':').map(Number);
    scheduledTime.setHours(hours, minutes);

    const newPost: ScheduledPost = {
      id: Math.random().toString(36).substring(2, 9),
      contentId: selectedContent.id,
      accountId: selectedAccount,
      platform: connectedAccounts.find(acc => acc.id === selectedAccount)?.platform || "instagram",
      scheduledTime: scheduledTime.toISOString(),
      status: "scheduled",
      postText: postText || selectedContent.title,
    };

    setScheduledPosts(prev => [...prev, newPost]);
    setIsScheduleDialogOpen(false);
    resetScheduleForm();

    toast({
      title: "Post Scheduled",
      description: `Your post "${selectedContent.title}" has been scheduled for ${format(scheduledTime, "PPp")}`,
    });
  };

  // Reset the scheduling form
  const resetScheduleForm = () => {
    setSelectedContent(null);
    setSelectedAccount("");
    setPostTime("12:00");
    setPostText("");
  };

  // Open the schedule dialog for a content item
  const openScheduleDialog = (content: ContentItem) => {
    setSelectedContent(content);
    // Pre-fill the post text with the content title
    setPostText(content.title || "");
    setIsScheduleDialogOpen(true);
  };

  // Get platform icon based on platform name
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-5 w-5" />;
      case 'facebook':
        return <Facebook className="h-5 w-5" />;
      case 'twitter':
        return <Twitter className="h-5 w-5" />;
      case 'youtube':
        return <Youtube className="h-5 w-5" />;
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };

  return (
    <Layout>
      <div className="container py-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Social Media Scheduler</h1>
        <p className="text-muted-foreground mb-6">
          Schedule and publish your content directly to social media platforms.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Calendar & Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Calendar</CardTitle>
                <CardDescription>
                  Select a date to see content scheduled for that day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-medium mb-4">
                      Content for {format(selectedDate, "MMMM d, yyyy")}
                    </h3>
                    {getContentForDate().length > 0 ? (
                      <div className="space-y-3">
                        {getContentForDate().map((content) => (
                          <div 
                            key={content.id} 
                            className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{content.title}</h4>
                                {content.description && (
                                  <p className="text-muted-foreground text-sm mt-1">
                                    {content.description}
                                  </p>
                                )}
                                {content.platforms && content.platforms.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {content.platforms.map((platform, idx) => (
                                      <Badge
                                        key={`platform-${idx}`}
                                        variant="secondary"
                                        className="flex items-center gap-1"
                                      >
                                        {getPlatformIcon(platform)}
                                        <span>{platform}</span>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openScheduleDialog(content)}
                              >
                                Schedule Post
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No content scheduled for this date.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduled Posts</CardTitle>
                <CardDescription>
                  Posts scheduled to be published to social media
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getScheduledPostsForDate().length > 0 ? (
                  <div className="space-y-4">
                    {getScheduledPostsForDate().map((post) => {
                      const content = scheduledContent.find(c => c.id === post.contentId);
                      const account = connectedAccounts.find(a => a.id === post.accountId);
                      if (!content || !account) return null;
                      
                      return (
                        <div 
                          key={post.id} 
                          className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <div className="mt-1">
                                {getPlatformIcon(account.platform)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">@{account.username}</span>
                                  <Badge 
                                    variant={post.status === "scheduled" ? "outline" : 
                                           post.status === "posted" ? "success" : "destructive"}
                                    className="text-xs"
                                  >
                                    {post.status}
                                  </Badge>
                                </div>
                                <h4 className="font-medium mt-1">{content.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {post.postText}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Scheduled for {format(new Date(post.scheduledTime), "h:mm a")}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // In a real app, this would trigger the post or cancel it
                                toast({
                                  title: "Not implemented",
                                  description: "This feature would publish the post immediately in a real application.",
                                });
                              }}
                            >
                              Publish Now
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No posts scheduled for this date.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Connected Accounts */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Connected Accounts</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsConnectDialogOpen(true)}
                    className="h-8 gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Connect
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {connectedAccounts.length > 0 ? (
                  <div className="space-y-3">
                    {connectedAccounts.map((account) => (
                      <div 
                        key={account.id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center h-10 w-10 bg-muted rounded-full overflow-hidden">
                            {getPlatformIcon(account.platform)}
                          </div>
                          <div>
                            <h4 className="font-medium">@{account.username}</h4>
                            <p className="text-xs text-muted-foreground capitalize">
                              {account.platform}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            toast({
                              title: "Not implemented",
                              description: "Account settings would be available here in a real application.",
                            });
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">No accounts connected yet</p>
                    <Button onClick={() => setIsConnectDialogOpen(true)}>
                      Connect Your First Account
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-2">
                    Connect your accounts to see post performance analytics
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Not implemented",
                        description: "Social media analytics would be available here in a real application.",
                      });
                    }}
                  >
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Connect Account Dialog */}
        <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Connect Social Media Account</DialogTitle>
              <DialogDescription>
                Connect your accounts to schedule and publish content.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="platform">Platform</Label>
                <Select 
                  value={newAccountPlatform} 
                  onValueChange={(value: any) => setNewAccountPlatform(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newAccountUsername}
                  onChange={(e) => setNewAccountUsername(e.target.value)}
                  placeholder="@yourusername"
                />
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Note: In a real application, this would redirect you to authenticate with the platform.
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConnectAccount}>
                Connect Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Post Dialog */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule Social Media Post</DialogTitle>
              <DialogDescription>
                Schedule this content to be published to your social media.
              </DialogDescription>
            </DialogHeader>
            {selectedContent && (
              <div className="grid gap-4 py-4">
                <div className="p-3 border rounded-md bg-muted/50">
                  <h4 className="font-medium">{selectedContent.title}</h4>
                  {selectedContent.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedContent.description}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="account">Post to</Label>
                  <Select 
                    value={selectedAccount} 
                    onValueChange={setSelectedAccount}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {connectedAccounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(account.platform)}
                            <span>@{account.username} ({account.platform})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 border rounded-md p-2 bg-muted/50 flex-1">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{format(selectedDate, "MMMM d, yyyy")}</span>
                    </div>
                    <Input
                      id="time"
                      type="time"
                      value={postTime}
                      onChange={(e) => setPostTime(e.target.value)}
                      className="w-24"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="postText">Post Caption</Label>
                  <Textarea
                    id="postText"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="Write your post caption here..."
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSchedulePost}>
                Schedule Post
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default SocialMediaScheduler;
