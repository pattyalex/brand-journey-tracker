import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Users, ThumbsUp, MessageSquare, BarChartIcon, TrendingUp, Megaphone, Radio } from "lucide-react";
import { 
  BarChart,
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart,
  Area
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import TimeFilterSelect from "@/components/analytics/TimeFilterSelect";
import { Button } from "@/components/ui/button";

const engagementData = [
  { name: "Jan", Instagram: 4000, Facebook: 2400, Twitter: 1800, YouTube: 3200 },
  { name: "Feb", Instagram: 3000, Facebook: 1398, Twitter: 2800, YouTube: 2800 },
  { name: "Mar", Instagram: 2000, Facebook: 9800, Twitter: 2200, YouTube: 4800 },
  { name: "Apr", Instagram: 2780, Facebook: 3908, Twitter: 1200, YouTube: 3800 },
  { name: "May", Instagram: 1890, Facebook: 4800, Twitter: 2500, YouTube: 5200 },
  { name: "Jun", Instagram: 2390, Facebook: 3800, Twitter: 2800, YouTube: 4300 },
];

const followersData = [
  { name: "Jan", Instagram: 15200, Facebook: 12400, Twitter: 8800, YouTube: 6200 },
  { name: "Feb", Instagram: 16800, Facebook: 13100, Twitter: 9200, YouTube: 6800 },
  { name: "Mar", Instagram: 18400, Facebook: 14200, Twitter: 9800, YouTube: 7500 },
  { name: "Apr", Instagram: 21000, Facebook: 15400, Twitter: 10400, YouTube: 8300 },
  { name: "May", Instagram: 23500, Facebook: 16700, Twitter: 11200, YouTube: 9100 },
  { name: "Jun", Instagram: 26000, Facebook: 18000, Twitter: 12000, YouTube: 10000 },
];

const impressionsData = [
  { name: "Jan", Instagram: 42000, Facebook: 32400, Twitter: 21800, YouTube: 25200 },
  { name: "Feb", Instagram: 38000, Facebook: 31398, Twitter: 24800, YouTube: 27800 },
  { name: "Mar", Instagram: 45000, Facebook: 39800, Twitter: 22200, YouTube: 31800 },
  { name: "Apr", Instagram: 52780, Facebook: 43908, Twitter: 27200, YouTube: 33800 },
  { name: "May", Instagram: 61890, Facebook: 48800, Twitter: 32500, YouTube: 38200 },
  { name: "Jun", Instagram: 72390, Facebook: 53800, Twitter: 38800, YouTube: 44300 },
];

const reachData = [
  { name: "Jan", Instagram: 22000, Facebook: 18400, Twitter: 12800, YouTube: 15200 },
  { name: "Feb", Instagram: 24000, Facebook: 19398, Twitter: 14800, YouTube: 16800 },
  { name: "Mar", Instagram: 28000, Facebook: 21800, Twitter: 15200, YouTube: 17800 },
  { name: "Apr", Instagram: 32780, Facebook: 24908, Twitter: 17200, YouTube: 19800 },
  { name: "May", Instagram: 36890, Facebook: 28800, Twitter: 19500, YouTube: 21200 },
  { name: "Jun", Instagram: 41390, Facebook: 33800, Twitter: 22800, YouTube: 24300 },
];

const statsData = [
  { title: "Total Followers", value: "67,893", icon: Users, change: "+2.5%" },
  { title: "Impressions", value: "5.7M", icon: Megaphone, change: "+15.3%" },
  { title: "Reach", value: "3.4M", icon: Radio, change: "+12.8%" },
  { title: "Engagement Rate", value: "5.32%", icon: ThumbsUp, change: "+1.2%" },
];

interface OverviewTabProps {
  platforms: string[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ platforms }) => {
  const [timeRange, setTimeRange] = useState<string>("last30days");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [selectedPlatform, setSelectedPlatform] = useState<string>(platforms.length > 0 ? platforms[0] : "");
  
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };
  
  const handleCustomDateChange = (start: Date | undefined, end: Date | undefined) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
  };
  
  const config = {
    Instagram: { color: "#E1306C" },
    Facebook: { color: "#4267B2" },
    Twitter: { color: "#1DA1F2" },
    YouTube: { color: "#FF0000" },
  };

  const singlePlatformEngagementData = engagementData.map(item => ({
    name: item.name,
    value: item[selectedPlatform as keyof typeof item] || 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {platforms.map((platform) => (
            <Button
              key={platform}
              variant={selectedPlatform === platform ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPlatform(platform)}
              className="flex items-center gap-2"
            >
              {platform}
            </Button>
          ))}
        </div>
        <TimeFilterSelect 
          selectedRange={timeRange}
          onDateRangeChange={handleTimeRangeChange}
          onCustomDateChange={handleCustomDateChange}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <TrendingUp className="h-5 w-5" /> Followers Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ChartContainer config={config}>
              <AreaChart data={followersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {platforms.includes("Instagram") && (
                  <Area type="monotone" dataKey="Instagram" stroke="#E1306C" fill="#E1306C" fillOpacity={0.2} />
                )}
                {platforms.includes("Facebook") && (
                  <Area type="monotone" dataKey="Facebook" stroke="#4267B2" fill="#4267B2" fillOpacity={0.2} />
                )}
                {platforms.includes("Twitter") && (
                  <Area type="monotone" dataKey="Twitter" stroke="#1DA1F2" fill="#1DA1F2" fillOpacity={0.2} />
                )}
                {platforms.includes("YouTube") && (
                  <Area type="monotone" dataKey="YouTube" stroke="#FF0000" fill="#FF0000" fillOpacity={0.2} />
                )}
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" /> Reach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ChartContainer config={config}>
              <LineChart data={reachData}>
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
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" /> Impressions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ChartContainer config={config}>
              <BarChart data={impressionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {platforms.includes("Instagram") && (
                  <Bar dataKey="Instagram" fill="#E1306C" stackId="a" />
                )}
                {platforms.includes("Facebook") && (
                  <Bar dataKey="Facebook" fill="#4267B2" stackId="a" />
                )}
                {platforms.includes("Twitter") && (
                  <Bar dataKey="Twitter" fill="#1DA1F2" stackId="a" />
                )}
                {platforms.includes("YouTube") && (
                  <Bar dataKey="YouTube" fill="#FF0000" stackId="a" />
                )}
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="h-5 w-5" /> Engagement for {selectedPlatform}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ChartContainer config={config}>
              <LineChart data={singlePlatformEngagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name={selectedPlatform}
                  stroke={config[selectedPlatform as keyof typeof config]?.color || "#E1306C"} 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
