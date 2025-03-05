import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ContentItem } from "@/types/content";
import { Badge } from "@/components/ui/badge";
import { isSameDay, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ContentCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [scheduledContents, setScheduledContents] = useState<ContentItem[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  useEffect(() => {
    const storedContent = localStorage.getItem('scheduledContents');
    if (storedContent) {
      try {
        const parsed = JSON.parse(storedContent);
        const withDates = parsed.map((item: any) => ({
          ...item,
          dateCreated: new Date(item.dateCreated),
          scheduledDate: item.scheduledDate ? new Date(item.scheduledDate) : undefined
        }));
        setScheduledContents(withDates);
      } catch (error) {
        console.error("Error parsing scheduled content:", error);
        setScheduledContents([]);
      }
    }
  }, []);
  
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

  const scheduledForDate = date 
    ? scheduledContents.filter(content => 
        content.scheduledDate && isSameDay(new Date(content.scheduledDate), date)
      ) 
    : [];

  const scheduledDates = scheduledContents
    .filter(content => content.scheduledDate)
    .map(content => new Date(content.scheduledDate as Date));

  const handleRemoveScheduledContent = (contentId: string) => {
    const newScheduledContents = scheduledContents.filter(content => content.id !== contentId);
    setScheduledContents(newScheduledContents);
    localStorage.setItem('scheduledContents', JSON.stringify(newScheduledContents));
    toast.success("Content removed from schedule");
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
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mb-4"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0" 
                  align="start"
                  style={{ backgroundColor: "white", opacity: 1 }}
                >
                  <div className="bg-white rounded-md" style={{ backgroundColor: "white", opacity: 1 }}>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => {
                        setDate(newDate);
                        setCalendarOpen(false);
                      }}
                      className="rounded-md border bg-white"
                      modifiers={{
                        booked: scheduledDates,
                      }}
                      modifiersStyles={{
                        booked: {
                          backgroundColor: "hsl(var(--primary) / 0.1)",
                          fontWeight: "bold",
                          borderRadius: "0",
                        },
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border bg-white"
                modifiers={{
                  booked: scheduledDates,
                }}
                modifiersStyles={{
                  booked: {
                    backgroundColor: "hsl(var(--primary) / 0.1)",
                    fontWeight: "bold",
                    borderRadius: "0",
                  },
                }}
              />
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Content Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="scheduled" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="scheduled">Scheduled Content</TabsTrigger>
                  <TabsTrigger value="add">Add Event</TabsTrigger>
                  <TabsTrigger value="view">View Events</TabsTrigger>
                </TabsList>
                
                <TabsContent value="scheduled" className="space-y-4">
                  {scheduledForDate.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="font-medium text-sm">
                        Content scheduled for {date ? format(date, "MMMM d, yyyy") : "today"}
                      </h3>
                      
                      {scheduledForDate.map((content) => (
                        <Card key={content.id} className="overflow-hidden">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-lg">{content.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground mb-2">{content.description}</p>
                            
                            <div className="flex flex-wrap gap-1 mb-3">
                              {content.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex justify-end">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRemoveScheduledContent(content.id)}
                              >
                                Remove from schedule
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-dashed rounded-lg">
                      <p className="text-muted-foreground">
                        No content scheduled for {date ? format(date, "MMMM d, yyyy") : "today"}.
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">
                        Schedule content by using the calendar button on your content cards.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
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
