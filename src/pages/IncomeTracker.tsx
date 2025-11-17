
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DollarSign, TrendingUp, PieChart, CreditCard } from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const initialIncomeData = [
  { name: 'Brand Deals', value: 4000 },
  { name: 'Ad Revenue', value: 2400 },
  { name: 'Affiliate', value: 1500 },
  { name: 'Memberships', value: 2000 },
];

const IncomeTracker = () => {
  const [incomeData, setIncomeData] = useState(initialIncomeData);
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeSource, setIncomeSource] = useState("");
  const [customSource, setCustomSource] = useState("");
  
  const totalIncome = incomeData.reduce((sum, item) => sum + item.value, 0);
  
  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!incomeAmount || (!incomeSource && !customSource)) {
      toast.error("Please enter an amount and select a source");
      return;
    }
    
    const amount = parseFloat(incomeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }
    
    const source = incomeSource === "other" ? customSource : incomeSource;
    
    // Check if source already exists
    const existingIndex = incomeData.findIndex(item => item.name.toLowerCase() === source.toLowerCase());
    
    if (existingIndex !== -1) {
      // Update existing source
      const updatedData = [...incomeData];
      updatedData[existingIndex].value += amount;
      setIncomeData(updatedData);
    } else {
      // Add new source
      setIncomeData([...incomeData, { name: source, value: amount }]);
    }
    
    toast.success(`Added $${amount} from ${source}`);
    setIncomeAmount("");
    setIncomeSource("");
    setCustomSource("");
  };

  return (
    <Layout>
      <div className="w-full max-w-[1600px] mx-auto px-8 py-6 space-y-8 fade-in">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold">Income Tracker</h1>
          <p className="text-muted-foreground">
            Track and analyze your content creation income
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Total Income
            </CardTitle>
            <CardDescription>
              Your total income from all sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">${totalIncome.toLocaleString()}</div>
            <div className="h-[300px] mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={incomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {incomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="add">Add Income</TabsTrigger>
            <TabsTrigger value="history">Income History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Income</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddIncome} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                      <Input 
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={incomeAmount}
                        onChange={(e) => setIncomeAmount(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="source">Income Source</Label>
                    <Select value={incomeSource} onValueChange={setIncomeSource}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Brand Deals">Brand Deals</SelectItem>
                        <SelectItem value="Ad Revenue">Ad Revenue</SelectItem>
                        <SelectItem value="Affiliate">Affiliate</SelectItem>
                        <SelectItem value="Memberships">Memberships</SelectItem>
                        <SelectItem value="other">Other (specify)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {incomeSource === "other" && (
                    <div className="space-y-2">
                      <Label htmlFor="customSource">Specify Source</Label>
                      <Input 
                        id="customSource"
                        placeholder="Enter income source"
                        value={customSource}
                        onChange={(e) => setCustomSource(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <Button type="submit">Add Income</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Income History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="px-4 py-3 font-medium grid grid-cols-3 bg-muted">
                    <div>Source</div>
                    <div>Amount</div>
                    <div>Percentage</div>
                  </div>
                  <div className="divide-y">
                    {incomeData.map((item, index) => (
                      <div key={index} className="px-4 py-3 grid grid-cols-3">
                        <div>{item.name}</div>
                        <div>${item.value.toLocaleString()}</div>
                        <div>{((item.value / totalIncome) * 100).toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default IncomeTracker;
