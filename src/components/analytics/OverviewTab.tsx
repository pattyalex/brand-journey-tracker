import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Users, ThumbsUp, MessageSquare, BarChart as BarChartIcon, TrendingUp, Megaphone, Radio } from "lucide-react";
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
  { title: "Total Views", value: "1.2M", icon: Eye, change: "+18.2%" },
  { title: "Engagement Rate", value: "5.32%", icon: ThumbsUp, change: "+1.2%" },
  { title: "Comments", value: "8,246", icon: MessageSquare, change: "+7.1%" },
];

const platformMetrics = {
  Instagram: {
    impressions: { current: 72390, previous: 61890, change: "+16.9%" },
    reach: { current: 41390, previous: 36890, change: "+12.2%" }
  },
  Facebook: {
    impressions: { current: 53800, previous: 48800, change: "+10.2%" },
    reach: { current: 33800, previous: 28800, change: "+17.4%" }
  },
  Twitter: {
    impressions: { current: 38800, previous: 32500, change: "+19.4%" },
    reach: { current: 22800, previous: 19500, change: "+16.9%" }
  },
  YouTube: {
    impressions: { current: 44300, previous: 38200, change: "+16.0%" },
    reach: { current: 24300, previous: 21200, change: "+14.6%" }
  }
};

interface OverviewTabProps {
  platforms: string[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ platforms }) => {
  const [timeRange, setTimeRange] = useState<string>("last30days");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  
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

  const calculateTotalMetrics = (metricType: 'impressions' | 'reach') => {
    const totalCurrent = platforms.reduce((sum, platform) => 
      sum + (platformMetrics[platform as keyof typeof platformMetrics]?.[metricType]?.current || 0), 0);
    
    const totalPrevious = platforms.reduce((sum, platform) => 
      sum + (platformMetrics[platform as keyof typeof platformMetrics]?.[metricType]?.previous || 0), 0);
    
    const percentChange = totalPrevious > 0 
      ? (((totalCurrent - totalPrevious) / totalPrevious) * 100).toFixed(1)
      : "0.0";
    
    return {
      current: totalCurrent,
      previous: totalPrevious,
      change: `${Number(percentChange) >= 0 ? '+' : ''}${percentChange}%`
    };
  };

  const totalImpressions = calculateTotalMetrics('impressions');
  const totalReach = calculateTotalMetrics('reach');

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <TimeFilterSelect 
          selectedRange={timeRange}
          onDateRangeChange={handleTimeRangeChange}
          onCustomDateChange={handleCustomDateChange}
        />
      </div>
      
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
            <Megaphone className="h-5 w-5" /> Impressions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="col-span-1 lg:col-span-1">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-muted-foreground">Total Impressions</p>
                    <h3 className="text-3xl font-bold mt-1">{formatNumber(totalImpressions.current)}</h3>
                  </div>
                  <div className="rounded-full p-2 bg-primary/10">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-4 text-xs">
                  <span className={`inline-block rounded-full px-2 py-0.5 ${
                    totalImpressions.change.startsWith("+") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {totalImpressions.change}
                  </span>
                  <span className="text-muted-foreground ml-2">vs. previous period</span>
                </div>
              </CardContent>
            </Card>
            
            {platforms.map((platform) => {
              const platformData = platformMetrics[platform as keyof typeof platformMetrics]?.impressions;
              if (!platformData) return null;
              
              return (
                <Card key={`${platform}-impressions`} className="col-span-1">
                  <CardContent className="pt-6">
                    <div>
                      <p className="text-muted-foreground">{platform}</p>
                      <h3 className="text-2xl font-bold mt-1">{formatNumber(platformData.current)}</h3>
                    </div>
                    <div className="mt-4 text-xs">
                      <span className={`inline-block rounded-full px-2 py-0.5 ${
                        platformData.change.startsWith("+") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {platformData.change}
                      </span>
                      <span className="text-muted-foreground ml-2">vs. previous period</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="col-span-1 lg:col-span-1">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-muted-foreground">Total Reach</p>
                    <h3 className="text-3xl font-bold mt-1">{formatNumber(totalReach.current)}</h3>
                  </div>
                  <div className="rounded-full p-2 bg-primary/10">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-4 text-xs">
                  <span className={`inline-block rounded-full px-2 py-0.5 ${
                    totalReach.change.startsWith("+") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {totalReach.change}
                  </span>
                  <span className="text-muted-foreground ml-2">vs. previous period</span>
                </div>
              </CardContent>
            </Card>
            
            {platforms.map((platform) => {
              const platformData = platformMetrics[platform as keyof typeof platformMetrics]?.reach;
              if (!platformData) return null;
              
              return (
                <Card key={`${platform}-reach`} className="col-span-1">
                  <CardContent className="pt-6">
                    <div>
                      <p className="text-muted-foreground">{platform}</p>
                      <h3 className="text-2xl font-bold mt-1">{formatNumber(platformData.current)}</h3>
                    </div>
                    <div className="mt-4 text-xs">
                      <span className={`inline-block rounded-full px-2 py-0.5 ${
                        platformData.change.startsWith("+") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {platformData.change}
                      </span>
                      <span className="text-muted-foreground ml-2">vs. previous period</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
            <BarChartIcon className="h-5 w-5" /> Engagement Across Platforms
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
