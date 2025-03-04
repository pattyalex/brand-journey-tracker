
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ContentCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !eventTitle) {
      toast.error("Please select a date and enter an event title");
      return;
    }
    
    toast.success(`Event "${eventTitle}" added to ${date.toLocaleDateString()}`);
    setEventTitle("");
    setEventDescription("");
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8 fade-in">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold">Content Calendar</h1>
          <p className="text-muted-foreground">
            Plan and schedule your content with an organized calendar
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Content Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="add" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="add">Add Event</TabsTrigger>
                  <TabsTrigger value="view">View Events</TabsTrigger>
                </TabsList>
                
                <TabsContent value="add" className="space-y-4">
                  <form onSubmit={handleAddEvent} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Event Title</Label>
                      <Input 
                        id="title"
                        placeholder="Enter event title"
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your content or event"
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        rows={4}
                      />
                    </div>
                    
                    <Button type="submit">Add to Calendar</Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="view">
                  <div className="p-6 text-center text-muted-foreground">
                    <p>No events scheduled for the selected date.</p>
                    <p className="mt-2">Select "Add Event" to schedule new content.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ContentCalendar;
