import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarIcon, FileText, ClipboardCheck, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Define the content item type
interface ContentItem {
  id: string;
  title: string;
  description: string;
  format?: string;
  tags?: string[];
  buckets?: string[];
  scheduledDate?: Date | null;
}

const ContentCalendar = () => {
  const [readyToScheduleContent, setReadyToScheduleContent] = useState<ContentItem[]>([]);
  const [scheduledContent, setScheduledContent] = useState<ContentItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [schedulingContentId, setSchedulingContentId] = useState<string | null>(null);

  // Load content from localStorage on component mount
  useEffect(() => {
    try {
      // Load ready to schedule content
      const readyToScheduleData = localStorage.getItem('readyToScheduleContent');
      if (readyToScheduleData) {
        const parsedData = JSON.parse(readyToScheduleData);
        // Parse any date strings back to Date objects
        const contentWithDates = parsedData.map((item: any) => ({
          ...item,
          scheduledDate: item.scheduledDate ? new Date(item.scheduledDate) : null
        }));
        setReadyToScheduleContent(contentWithDates);
      }

      // Load scheduled content
      const scheduledData = localStorage.getItem('scheduledContent');
      if (scheduledData) {
        const parsedData = JSON.parse(scheduledData);
        // Parse any date strings back to Date objects
        const contentWithDates = parsedData.map((item: any) => ({
          ...item,
          scheduledDate: item.scheduledDate ? new Date(item.scheduledDate) : null
        }));
        setScheduledContent(contentWithDates);
      }
    } catch (error) {
      console.error("Error loading content from localStorage:", error);
    }
  }, []);

  // Save content to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('readyToScheduleContent', JSON.stringify(readyToScheduleContent));
  }, [readyToScheduleContent]);

  useEffect(() => {
    localStorage.setItem('scheduledContent', JSON.stringify(scheduledContent));
  }, [scheduledContent]);

  const scheduleContent = (contentId: string, date: Date) => {
    // Find the content item
    const contentItem = readyToScheduleContent.find(item => item.id === contentId);
    
    if (!contentItem) return;
    
    // Create a new version with the scheduled date
    const scheduledItem = {
      ...contentItem,
      scheduledDate: date
    };
    
    // Remove from ready to schedule
    setReadyToScheduleContent(prev => prev.filter(item => item.id !== contentId));
    
    // Add to scheduled content
    setScheduledContent(prev => [...prev, scheduledItem]);
    
    // Reset the scheduling content ID
    setSchedulingContentId(null);
  };

  const deleteContent = (contentId: string) => {
    // Remove content from ready to schedule
    setReadyToScheduleContent(prev => prev.filter(item => item.id !== contentId));
  };

  const deleteScheduledContent = (contentId: string) => {
    // Remove content from scheduled
    setScheduledContent(prev => prev.filter(item => item.id !== contentId));
  };

  const getContentForDate = (date: Date) => {
    return scheduledContent.filter(content => {
      if (!content.scheduledDate) return false;
      
      const contentDate = new Date(content.scheduledDate);
      return (
        contentDate.getDate() === date.getDate() &&
        contentDate.getMonth() === date.getMonth() &&
        contentDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Get content for currently selected date
  const selectedDateContent = selectedDate ? getContentForDate(selectedDate) : [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
            <p className="text-muted-foreground">
              Schedule and organize your content publishing plan.
            </p>
          </div>
        </div>
        
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Content Ready to be Scheduled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {readyToScheduleContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {readyToScheduleContent.map((content) => (
                  <Card key={content.id} className="overflow-hidden h-fit">
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-base">{content.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{content.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {content.tags && content.tags.slice(0, 2).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {content.tags && content.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{content.tags.length - 2}
                          </Badge>
                        )}
                        
                        {content.format && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {content.format}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button size="sm" className="h-8 text-xs px-2">
                              <CalendarIcon className="mr-1 h-3 w-3" />
                              Schedule
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={undefined}
                              onSelect={(date) => {
                                if (date) {
                                  scheduleContent(content.id, date);
                                }
                              }}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        
                        <Button 
                          size="icon"
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={() => deleteContent(content.id)}
                        >
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No content ready to be scheduled.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create content ideas in the Content Ideation section and mark them as ready for scheduling.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Calendar Column */}
          <Card className="md:col-span-3 overflow-hidden">
            <CardHeader>
              <CardTitle>Content Publishing Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          
          {/* Scheduled Content for Selected Date Column */}
          <Card className="md:col-span-2 overflow-hidden">
            <CardHeader>
              <CardTitle>
                {selectedDate 
                  ? `Content for ${format(selectedDate, 'MMMM d, yyyy')}`
                  : 'Select a date to view content'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateContent.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateContent.map((content) => (
                    <Card key={content.id} className="overflow-hidden">
                      <CardHeader className="p-3 pb-1">
                        <CardTitle className="text-base">{content.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-xs text-muted-foreground">{content.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
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
                        
                        <div className="flex justify-end mt-2">
                          <Button 
                            size="icon"
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => deleteScheduledContent(content.id)}
                          >
                            <Trash2 className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {selectedDate 
                      ? 'No content scheduled for this date.' 
                      : 'Select a date to view scheduled content.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ContentCalendar;
