
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { toast } from "sonner";

const Analytics = () => {
  const [analyticsLog, setAnalyticsLog] = useState("");
  
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
