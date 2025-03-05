
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { ContentItem } from "@/types/content";
import { BarChart, Calendar, Star, Tag } from "lucide-react";
import { useLocation } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { getTagColorClasses } from "@/utils/tagColors";

const Analytics = () => {
  const [analyticsLog, setAnalyticsLog] = useState("");
  const [postedContent, setPostedContent] = useState<ContentItem[]>([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get('tab') || "log";
  
  useEffect(() => {
    // Load posted content from localStorage
    const storedContent = localStorage.getItem('postedContent');
    if (storedContent) {
      setPostedContent(JSON.parse(storedContent));
    }
  }, []);
  
  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!analyticsLog.trim()) {
      toast.error("Please enter some analytics data");
      return;
    }
    
    // Here we would typically save the analytics data
    toast.success("Analytics data logged successfully");
    setAnalyticsLog("");
  };
  
  const handleDeletePostedContent = (contentId: string) => {
    const updatedContent = postedContent.filter(item => item.id !== contentId);
    setPostedContent(updatedContent);
    localStorage.setItem('postedContent', JSON.stringify(updatedContent));
    toast.success("Content removed from posted items");
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8 fade-in">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track, analyze, and improve your content performance
          </p>
        </div>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="log">Log Your Analytics</TabsTrigger>
            <TabsTrigger value="posted">Posted Content</TabsTrigger>
            <TabsTrigger value="overview" disabled>Overview</TabsTrigger>
            <TabsTrigger value="reports" disabled>Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="log" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Log Your Analytics Data</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="analytics" className="text-sm font-medium">
                      Enter your analytics data
                    </label>
                    <Textarea
                      id="analytics"
                      placeholder="Paste analytics data here or write notes about your performance..."
                      value={analyticsLog}
                      onChange={(e) => setAnalyticsLog(e.target.value)}
                      rows={8}
                      className="w-full"
                    />
                  </div>
                  <Button type="submit">Save Analytics Data</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="posted" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Posted Content
                </CardTitle>
                <CardDescription>
                  Track and analyze your posted content
                </CardDescription>
              </CardHeader>
              <CardContent>
                {postedContent.length === 0 ? (
                  <div className="text-center p-8 border border-dashed rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">
                      No posted content yet. Move content cards from your Bank of Content to start tracking.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {postedContent.map((content) => (
                      <Card key={content.id} className="overflow-hidden">
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">{content.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {content.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {content.tags && content.tags.length > 0 ? (
                              content.tags.map((tag, index) => (
                                <span 
                                  key={index} 
                                  className={`text-xs px-2 py-1 rounded-full ${getTagColorClasses(tag)}`}
                                >
                                  {tag}
                                </span>
                              ))
                            ) : null}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground mt-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              {content.dateCreated ? formatDistanceToNow(new Date(content.dateCreated), { addSuffix: true }) : 'Unknown date'}
                            </span>
                          </div>
                          
                          {/* Performance tracking placeholders */}
                          <div className="mt-4 pt-4 border-t border-border">
                            <h4 className="text-sm font-medium mb-2">Performance Tracking</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center text-xs">
                                <Star className="h-3 w-3 mr-1 text-yellow-500" />
                                <span>0 likes</span>
                              </div>
                              <div className="flex items-center text-xs">
                                <Tag className="h-3 w-3 mr-1 text-blue-500" />
                                <span>0 shares</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="xs"
                            onClick={() => handleDeletePostedContent(content.id)}
                            aria-label="Remove"
                            className="h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="overview">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Analytics overview will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Analytics reports will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Analytics;
