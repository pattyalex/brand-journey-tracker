
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  BarChart as RechartsBarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from "recharts";
import { Calendar, Clock, MapPin, Users, BarChart, PieChart } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer } from "@/components/ui/chart";
import TimeFilterSelect from "./TimeFilterSelect";

interface CommunityTabProps {
  platforms: string[];
}

// Mock data - would be replaced with real API data
const ageData = [
  { name: "13-17", value: 5 },
  { name: "18-24", value: 35 },
  { name: "25-34", value: 40 },
  { name: "35-44", value: 15 },
  { name: "45+", value: 5 },
];

const genderData = [
  { name: "Female", value: 67 },
  { name: "Male", value: 33 },
];

const locationData = [
  { country: "United States", percentage: 42 },
  { country: "United Kingdom", percentage: 15 },
  { country: "Germany", percentage: 8 },
  { country: "Canada", percentage: 7 },
  { country: "Australia", percentage: 6 },
  { country: "France", percentage: 5 },
  { country: "Brazil", percentage: 4 },
  { country: "Other", percentage: 13 },
];

const activityData = [
  { time: "00:00", users: 120 },
  { time: "03:00", users: 70 },
  { time: "06:00", users: 150 },
  { time: "09:00", users: 480 },
  { time: "12:00", users: 760 },
  { time: "15:00", users: 850 },
  { time: "18:00", users: 1200 },
  { time: "21:00", users: 940 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const CommunityTab: React.FC<CommunityTabProps> = ({ platforms }) => {
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [timeRange, setTimeRange] = useState("last30days");
  
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    // Here you would typically fetch new data based on the selected time range
    console.log(`Fetching community data for time range: ${range}`);
  };
  
  const handleCustomDateChange = (startDate: Date | undefined, endDate: Date | undefined) => {
    if (startDate && endDate) {
      // Here you would typically fetch new data based on the custom date range
      console.log(`Fetching community data from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Audience Demographics</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <TimeFilterSelect 
            selectedRange={timeRange} 
            onDateRangeChange={handleTimeRangeChange} 
            onCustomDateChange={handleCustomDateChange}
          />
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {platforms.map(platform => (
                <SelectItem key={platform} value={platform}>{platform}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Age Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of your audience by age group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ChartContainer config={{}}>
                <RechartsBarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Bar dataKey="value" fill="#8884d8">
                    {ageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" /> Gender Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of your audience by gender
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ChartContainer config={{}}>
                <RechartsPieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </RechartsPieChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Top Locations
            </CardTitle>
            <CardDescription>
              Countries where your audience is located
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locationData.map((location, index) => (
                  <TableRow key={index}>
                    <TableCell>{location.country}</TableCell>
                    <TableCell className="text-right">{location.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Activity Times */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Audience Activity
            </CardTitle>
            <CardDescription>
              When your audience is most active (UTC)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ChartContainer config={{}}>
                <RechartsBarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#82ca9d" />
                </RechartsBarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityTab;
