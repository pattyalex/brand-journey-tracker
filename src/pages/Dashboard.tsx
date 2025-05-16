import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Calendar, TrendingUp, Users } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24,892</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.5%</div>
            <p className="text-xs text-muted-foreground">+0.3% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Content Published</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,492</div>
            <p className="text-xs text-muted-foreground">+12.3% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
            <CardDescription>Your best content from the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Summer Outfit Ideas 2025</p>
                  <p className="text-sm text-muted-foreground">Instagram Reel</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">125k views</p>
                  <p className="text-sm text-muted-foreground">8.7% engagement</p>
                </div>
              </li>
              <li className="flex justify-between items-center">
                <div>
                  <p className="font-medium">5-Minute Makeup Tutorial</p>
                  <p className="text-sm text-muted-foreground">TikTok</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">98k views</p>
                  <p className="text-sm text-muted-foreground">7.2% engagement</p>
                </div>
              </li>
              <li className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Morning Routine 2025</p>
                  <p className="text-sm text-muted-foreground">YouTube</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">45k views</p>
                  <p className="text-sm text-muted-foreground">6.4% engagement</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Content</CardTitle>
            <CardDescription>Content scheduled for the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Product Review: New Skincare Line</p>
                  <p className="text-sm text-muted-foreground">Instagram Post • Tomorrow</p>
                </div>
              </li>
              <li className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Day in My Life as a Content Creator</p>
                  <p className="text-sm text-muted-foreground">YouTube • Wednesday</p>
                </div>
              </li>
              <li className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Summer Fashion Haul 2025</p>
                  <p className="text-sm text-muted-foreground">TikTok • Friday</p>
                </div>
              </li>
              <li className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Q&A Session: Creator Business Tips</p>
                  <p className="text-sm text-muted-foreground">Instagram Stories • Sunday</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;