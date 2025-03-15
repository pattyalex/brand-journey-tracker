
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
import { CalendarIcon, FileText } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocation } from "react-router-dom";

const ContentCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [scheduledContents, setScheduledContents] = useState<ContentItem[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [unscheduledContent, setUnscheduledContent] = useState<ContentItem[]>([]);
  const location = useLocation();
  
  // Load scheduled and unscheduled content
  useEffect(() => {
    // Load scheduled content from localStorage
    const storedContent = localStorage.getItem('scheduledContents');
    if (storedContent) {
      try {
        const parsed = JSON.parse(storedContent);
        const withDates = parsed.map((item: any) => ({
          ...item,
          dateCreated: new Date(item.dateCreated),
          scheduledDate: item.scheduledDate ? new Date(item.scheduledDate) : undefined
        }));
        
        // Split content into scheduled and unscheduled
        const scheduled: ContentItem[] = [];
        const unscheduled: ContentItem[] = [];
        
        withDates.forEach((item: ContentItem) => {
          if (item.scheduledDate) {
            scheduled.push(item);
          } else {
            unscheduled.push(item);
          }
        });
        
        setScheduledContents(scheduled);
        setUnscheduledContent(unscheduled);
      } catch (error) {
        console.error("Error parsing scheduled content:", error);
        setScheduledContents([]);
        setUnscheduledContent([]);
      }
    }
  }, []);
  
  // Check if redirected from Idea Development
  useEffect(() => {
    if (location.state?.fromIdeaDevelopment) {
      toast.info("Content was sent from Idea Development");
    }
  }, [location]);
  
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

  // Get content scheduled for the selected date
  const scheduledForDate = date 
    ? scheduledContents.filter(content => 
        content.scheduledDate && isSameDay(new Date(content.scheduledDate), date)
      ) 
    : [];

  // Get all dates that have scheduled content
  const scheduledDates = scheduledContents
    .filter(content => content.scheduledDate)
    .map(content => new Date(content.scheduledDate as Date));

  // Handle scheduling unscheduled content 
  const scheduleContent = (contentId: string, scheduleDate: Date) => {
    // Find content in unscheduled items
    const contentToSchedule = unscheduledContent.find(item => item.id === contentId);
    
    if (!contentToSchedule) return;
    
    // Add scheduledDate to content
    const updatedContent = {
      ...contentToSchedule,
      scheduledDate: scheduleDate
    };
    
    // Remove from unscheduled and add to scheduled
    setUnscheduledContent(unscheduledContent.filter(item => item.id !== contentId));
    setScheduledContents([...scheduledContents, updatedContent]);
    
    // Update localStorage (combine both lists)
    const allContent = [
      ...scheduledContents, 
      updatedContent,
      ...unscheduledContent.filter(item => item.id !== contentId)
    ];
    
    localStorage.setItem('scheduledContents', JSON.stringify(allContent));
    toast.success(`Content scheduled for ${format(scheduleDate, "MMMM d, yyyy")}`);
  };

  // Handle removing content from schedule
  const handleRemoveScheduledContent = (contentId: string) => {
    // Find the content to be removed
    const contentToRemove = scheduledContents.find(content => content.id === contentId);
    
    if (!contentToRemove) return;
    
    // Remove scheduled date
    const updatedContent = {
      ...contentToRemove,
      scheduledDate: undefined
    };
    
    // Move from scheduled to unscheduled
    setScheduledContents(scheduledContents.filter(content => content.id !== contentId));
    setUnscheduledContent([...unscheduledContent, updatedContent]);
    
    // Update localStorage
    const allContent = [
      ...scheduledContents.filter(content => content.id !== contentId),
      ...unscheduledContent,
      updatedContent
    ];
    
    localStorage.setItem('scheduledContents', JSON.stringify(allContent));
    toast.success("Content removed from schedule");
  };

  // Delete content completely
  const deleteContent = (contentId: string) => {
    // Remove from both lists
    const newScheduled = scheduledContents.filter(content => content.id !== contentId);
    const newUnscheduled = unscheduledContent.filter(content => content.id !== contentId);
    
    setScheduledContents(newScheduled);
    setUnscheduledContent(newUnscheduled);
    
    // Update localStorage
    const allContent = [...newScheduled, ...newUnscheduled];
    localStorage.setItem('scheduledContents', JSON.stringify(allContent));
    
    toast.success("Content deleted");
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
                  <TabsTrigger value="unscheduled">Unscheduled Content</TabsTrigger>
                  <TabsTrigger value="add">Add Event</TabsTrigger>
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
                              {content.tags && content.tags.map((tag, idx) => (
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
                        Schedule content from the "Unscheduled Content" tab.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="unscheduled" className="space-y-4">
                  {unscheduledContent.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="font-medium text-sm">Content waiting to be scheduled</h3>
                      
                      {unscheduledContent.map((content) => (
                        <Card key={content.id} className="overflow-hidden">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-lg">{content.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground mb-2">{content.description}</p>
                            
                            <div className="flex flex-wrap gap-1 mb-3">
                              {content.tags && content.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              
                              {content.format && (
                                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {content.format}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex justify-between mt-4">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button size="sm">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    Schedule
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-white" align="start">
                                  <div className="p-2">
                                    <h3 className="text-sm font-medium mb-2">Schedule Content</h3>
                                    <Calendar
                                      mode="single"
                                      initialFocus
                                      onSelect={(selectedDate) => {
                                        if (selectedDate) {
                                          scheduleContent(content.id, selectedDate);
                                        }
                                      }}
                                    />
                                  </div>
                                </PopoverContent>
                              </Popover>
                              
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => deleteContent(content.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-dashed rounded-lg">
                      <p className="text-muted-foreground">
                        No unscheduled content available.
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">
                        Send content from Idea Development to schedule it here.
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
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ContentCalendar;
