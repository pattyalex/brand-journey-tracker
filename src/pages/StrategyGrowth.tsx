
import React from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, TrendingUp, Target, Award, Users } from "lucide-react";
import { 
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { month: "Jan", followers: 400 },
  { month: "Feb", followers: 850 },
  { month: "Mar", followers: 1200 },
  { month: "Apr", followers: 1600 },
  { month: "May", followers: 2100 },
  { month: "Jun", followers: 2500 },
];

const strategies = [
  {
    title: "Content Optimization",
    description: "Optimize your content for better engagement and conversion",
    icon: Target,
  },
  {
    title: "Audience Growth",
    description: "Strategies to grow your audience and reach new followers",
    icon: Users,
  },
  {
    title: "Performance Tracking",
    description: "Track your content performance and adjust strategies accordingly",
    icon: BarChart,
  },
  {
    title: "Monetization Strategies",
    description: "Explore different ways to monetize your content and audience",
    icon: Award,
  },
];

const StrategyGrowth = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8 fade-in">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold">Strategy & Growth</h1>
          <p className="text-muted-foreground">
            Analyze performance and implement strategies for audience growth
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Growth Analytics
            </CardTitle>
            <CardDescription>
              Audience growth over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="followers" fill="#8884d8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="strategies" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="strategies">Growth Strategies</TabsTrigger>
            <TabsTrigger value="goals">Set Goals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="strategies" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategies.map((strategy, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <strategy.icon className="w-5 h-5 text-primary" />
                      <CardTitle className="text-xl">{strategy.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{strategy.description}</p>
                    <Button className="mt-4" variant="outline">Explore Strategy</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="goals">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Goal setting feature coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default StrategyGrowth;
