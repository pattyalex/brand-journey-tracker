
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { Archive, Trash2 } from "lucide-react";

const Analytics = () => {
  const [analyticsLog, setAnalyticsLog] = useState("");
  const [archivedContent, setArchivedContent] = useState<any[]>([]);
  
  useEffect(() => {
    // Load archived content from localStorage
    const savedContent = JSON.parse(localStorage.getItem('archivedContent') || '[]');
    setArchivedContent(savedContent);
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

  const handleDeleteArchived = (index: number) => {
    const newArchivedContent = [...archivedContent];
    newArchivedContent.splice(index, 1);
    setArchivedContent(newArchivedContent);
    localStorage.setItem('archivedContent', JSON.stringify(newArchivedContent));
    toast.success("Archived content deleted");
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
        
        <Tabs defaultValue="log" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="log">Log Your Analytics</TabsTrigger>
            <TabsTrigger value="archived">Archived Content</TabsTrigger>
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
          
          <TabsContent value="archived" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Archived Content</CardTitle>
              </CardHeader>
              <CardContent>
                {archivedContent.length === 0 ? (
                  <div className="text-center p-8 border border-dashed rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">
                      No archived content yet. Archive your posted content from your content bank.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {archivedContent.map((content, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">
                            {content.title}
                          </CardTitle>
                          <div className="text-sm text-muted-foreground">
                            Originally from: {content.originalPillar || "Unknown pillar"}
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="line-clamp-2 text-sm">
                            {content.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {content.tags && content.tags.map((tag: string, tagIndex: number) => (
                              <span 
                                key={tagIndex} 
                                className="text-xs px-2 py-1 bg-muted rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            <Archive className="h-3 w-3 inline mr-1" />
                            Archived: {new Date(content.archivedDate).toLocaleDateString()}
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="xs"
                            onClick={() => handleDeleteArchived(index)}
                            aria-label="Delete"
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
