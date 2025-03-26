
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Users, ThumbsUp, MessageSquare, BarChart } from "lucide-react";
import { 
  BarChart as RechartsBarChart,
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

// Mock data - would be replaced with real API data
const engagementData = [
  { name: "Jan", Instagram: 4000, Facebook: 2400, Twitter: 1800, YouTube: 3200 },
  { name: "Feb", Instagram: 3000, Facebook: 1398, Twitter: 2800, YouTube: 2800 },
  { name: "Mar", Instagram: 2000, Facebook: 9800, Twitter: 2200, YouTube: 4800 },
  { name: "Apr", Instagram: 2780, Facebook: 3908, Twitter: 1200, YouTube: 3800 },
  { name: "May", Instagram: 1890, Facebook: 4800, Twitter: 2500, YouTube: 5200 },
  { name: "Jun", Instagram: 2390, Facebook: 3800, Twitter: 2800, YouTube: 4300 },
];

const statsData = [
  { title: "Total Followers", value: "67,893", icon: Users, change: "+2.5%" },
  { title: "Total Views", value: "1.2M", icon: Eye, change: "+18.2%" },
  { title: "Engagement Rate", value: "5.32%", icon: ThumbsUp, change: "+1.2%" },
  { title: "Comments", value: "8,246", icon: MessageSquare, change: "+7.1%" },
];

interface OverviewTabProps {
  platforms: string[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ platforms }) => {
  const config = {
    Instagram: { color: "#E1306C" },
    Facebook: { color: "#4267B2" },
    Twitter: { color: "#1DA1F2" },
    YouTube: { color: "#FF0000" },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className="rounded-full p-2 bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 text-xs">
                <span className={`inline-block rounded-full px-2 py-0.5 ${
                  stat.change.startsWith("+") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground ml-2">vs. last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" /> Engagement Across Platforms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ChartContainer config={config}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {platforms.includes("Instagram") && (
                  <Line type="monotone" dataKey="Instagram" stroke="#E1306C" activeDot={{ r: 8 }} />
                )}
                {platforms.includes("Facebook") && (
                  <Line type="monotone" dataKey="Facebook" stroke="#4267B2" />
                )}
                {platforms.includes("Twitter") && (
                  <Line type="monotone" dataKey="Twitter" stroke="#1DA1F2" />
                )}
                {platforms.includes("YouTube") && (
                  <Line type="monotone" dataKey="YouTube" stroke="#FF0000" />
                )}
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
