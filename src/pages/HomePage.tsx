import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BrainDump from '@/components/BrainDump';

const HomePage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome to HeyMegan</h1>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quick-notes">Quick Notes</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Snapshot</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Content Ideas</CardTitle>
                <CardDescription>Manage your content ideas</CardDescription>
              </CardHeader>
              <CardContent>
                <p>You have 12 content ideas ready to develop.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduled Content</CardTitle>
                <CardDescription>Your upcoming content schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <p>5 pieces of content scheduled for this week.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Brand Partnerships</CardTitle>
                <CardDescription>Track your brand collaborations</CardDescription>
              </CardHeader>
              <CardContent>
                <p>3 active partnerships, 2 pending proposals.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quick-notes">
          <Card>
            <CardHeader>
              <CardTitle>Quick Notes</CardTitle>
              <CardDescription>Jot down ideas and thoughts</CardDescription>
            </CardHeader>
            <CardContent>
              <BrainDump />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">Yesterday</span>
                  <span>Added 3 new content ideas to Bank of Content</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">2 days ago</span>
                  <span>Updated partnership details for Brand X</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">3 days ago</span>
                  <span>Scheduled 2 posts for next week</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Snapshot</CardTitle>
              <CardDescription>Quick overview of your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Engagement Rate</p>
                  <p className="text-2xl font-bold">4.2%</p>
                  <p className="text-xs text-muted-foreground">+0.5% from last month</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">New Followers</p>
                  <p className="text-2xl font-bold">1,248</p>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomePage;