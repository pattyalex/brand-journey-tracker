
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  TikTok, 
  MoreHorizontal, 
  Edit2, 
  Trash, 
  Plus, 
  Link as LinkIcon,
  Clock,
  CheckCircle,
  XCircle,
  FileImage,
  FileText,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

// Mock schedule data
const scheduledPosts = [
  {
    id: "1",
    title: "5 Tips for Better Content",
    content: "Here are 5 tips that will help you create better content...",
    platform: "instagram",
    scheduledFor: new Date(2023, 11, 10, 14, 30),
    status: "scheduled",
    image: "/placeholder.svg",
    type: "image"
  },
  {
    id: "2",
    title: "Upcoming Workshop Announcement",
    content: "Join us next week for an exclusive workshop on content strategy!",
    platform: "linkedin",
    scheduledFor: new Date(2023, 11, 12, 10, 0),
    status: "scheduled",
    image: null,
    type: "text"
  },
  {
    id: "3",
    title: "Behind the Scenes",
    content: "Take a look behind the scenes of our latest project...",
    platform: "tiktok",
    scheduledFor: new Date(2023, 11, 8, 16, 15),
    status: "published",
    image: "/placeholder.svg",
    type: "video"
  },
  {
    id: "4",
    title: "New Product Launch",
    content: "We're excited to announce our new product line launching next month!",
    platform: "twitter",
    scheduledFor: new Date(2023, 11, 15, 9, 0),
    status: "failed",
    image: "/placeholder.svg",
    type: "image"
  }
];

// Mock connected accounts
const connectedAccounts = [
  { id: "1", platform: "instagram", username: "creativecontent", isActive: true },
  { id: "2", platform: "linkedin", username: "creative.content.official", isActive: true },
  { id: "3", platform: "twitter", username: "creativecontentco", isActive: false },
  { id: "4", platform: "facebook", username: "Creative Content Co.", isActive: true },
  { id: "5", platform: "tiktok", username: "@creativecontent", isActive: true }
];

// Platform icons mapping
const platformIcons: Record<string, React.ComponentType> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: TikTok
};

// Status badge color mapping
const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  published: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800"
};

// Status icons
const statusIcons: Record<string, React.ReactNode> = {
  scheduled: <Clock className="h-4 w-4 mr-1" />,
  published: <CheckCircle className="h-4 w-4 mr-1" />,
  failed: <XCircle className="h-4 w-4 mr-1" />
};

// Content type icons
const contentTypeIcons: Record<string, React.ReactNode> = {
  image: <FileImage className="h-4 w-4 mr-1" />,
  video: <Activity className="h-4 w-4 mr-1" />,
  text: <FileText className="h-4 w-4 mr-1" />
};

const SocialMediaScheduler = () => {
  const [posts, setPosts] = useState(scheduledPosts);
  const [accounts, setAccounts] = useState(connectedAccounts);
  const [activeTab, setActiveTab] = useState("upcoming");
  
  const handleConnect = (platform: string) => {
    toast.success(`Connected to ${platform} successfully!`);
    setAccounts(prev => 
      prev.map(account => 
        account.platform === platform 
          ? { ...account, isActive: true } 
          : account
      )
    );
  };
  
  const handleDisconnect = (id: string) => {
    toast.success("Account disconnected");
    setAccounts(prev => 
      prev.map(account => 
        account.id === id 
          ? { ...account, isActive: false } 
          : account
      )
    );
  };
  
  const handleDelete = (id: string) => {
    toast.success("Post deleted from schedule");
    setPosts(prev => prev.filter(post => post.id !== id));
  };
  
  const filteredPosts = activeTab === "upcoming" 
    ? posts.filter(post => post.status === "scheduled")
    : activeTab === "published"
    ? posts.filter(post => post.status === "published")
    : posts.filter(post => post.status === "failed");
  
  const getPlatformIcon = (platform: string) => {
    const Icon = platformIcons[platform] || LinkIcon;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8 fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Social Media Scheduler</h1>
            <p className="text-muted-foreground">Schedule, manage and publish content to your social platforms</p>
          </div>
          
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            <span>Create New Post</span>
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Scheduled Content</CardTitle>
                <CardDescription>
                  View and manage your upcoming, published, and failed posts
                </CardDescription>
              </CardHeader>
              
              <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
                <div className="px-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="published">Published</TabsTrigger>
                    <TabsTrigger value="failed">Failed</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value={activeTab} className="pt-2">
                  <ScrollArea className="h-[400px] w-full">
                    <div className="px-6">
                      {filteredPosts.length === 0 ? (
                        <div className="h-[200px] flex items-center justify-center flex-col text-center p-8 space-y-2">
                          <div className="bg-gray-100 p-3 rounded-full">
                            {activeTab === "upcoming" ? (
                              <Clock className="h-8 w-8 text-muted-foreground" />
                            ) : activeTab === "published" ? (
                              <CheckCircle className="h-8 w-8 text-muted-foreground" />
                            ) : (
                              <XCircle className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <h3 className="font-medium">No {activeTab} posts</h3>
                          <p className="text-muted-foreground text-sm">
                            {activeTab === "upcoming" 
                              ? "You don't have any scheduled posts yet"
                              : activeTab === "published"
                              ? "Your published posts will appear here"
                              : "Any failed posts will be shown here"}
                          </p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Content</TableHead>
                              <TableHead>Platform</TableHead>
                              <TableHead>Schedule/Publish Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredPosts.map(post => (
                              <TableRow key={post.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    {post.image && (
                                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {contentTypeIcons[post.type]}
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-medium">{post.title}</div>
                                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                        {post.content}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    {getPlatformIcon(post.platform)}
                                    <span className="capitalize">{post.platform}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {format(post.scheduledFor, "MMM d, yyyy · h:mm a")}
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant="outline" 
                                    className={`${statusColors[post.status]} flex items-center gap-1 capitalize`}
                                  >
                                    {statusIcons[post.status]}
                                    {post.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem className="flex items-center gap-2">
                                        <Edit2 className="h-4 w-4" />
                                        <span>Edit</span>
                                      </DropdownMenuItem>
                                      
                                      {post.status === "scheduled" && (
                                        <DropdownMenuItem className="flex items-center gap-2">
                                          <Clock className="h-4 w-4" />
                                          <span>Reschedule</span>
                                        </DropdownMenuItem>
                                      )}
                                      
                                      {post.status === "failed" && (
                                        <DropdownMenuItem className="flex items-center gap-2">
                                          <Clock className="h-4 w-4" />
                                          <span>Retry</span>
                                        </DropdownMenuItem>
                                      )}
                                      
                                      <DropdownMenuSeparator />
                                      
                                      <DropdownMenuItem 
                                        className="flex items-center gap-2 text-destructive"
                                        onClick={() => handleDelete(post.id)}
                                      >
                                        <Trash className="h-4 w-4" />
                                        <span>Delete</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>
                  Manage your social media connections
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {accounts.map(account => (
                  <div key={account.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(account.platform)}
                      <div>
                        <div className="font-medium capitalize">{account.platform}</div>
                        <div className="text-sm text-muted-foreground">
                          {account.username}
                        </div>
                      </div>
                    </div>
                    
                    {account.isActive ? (
                      <Badge 
                        variant="outline" 
                        className="bg-green-100 text-green-800"
                      >
                        Connected
                      </Badge>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleConnect(account.platform)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full mt-2 gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Account</span>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Your social media performance
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Total Scheduled Posts
                    </div>
                    <div className="text-3xl font-bold">
                      {posts.filter(p => p.status === "scheduled").length}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Published Posts
                    </div>
                    <div className="text-3xl font-bold">
                      {posts.filter(p => p.status === "published").length}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Failed Posts
                    </div>
                    <div className="text-3xl font-bold text-destructive">
                      {posts.filter(p => p.status === "failed").length}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  View Detailed Analytics
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SocialMediaScheduler;
