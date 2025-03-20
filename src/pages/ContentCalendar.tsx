
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday,
  addMonths,
  subMonths,
  parseISO,
  getDay,
  setDefaultOptions,
  setYear,
  setMonth,
  setDate,
  startOfWeek,
  endOfWeek
} from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarIcon, FileText, ChevronLeft, ChevronRight, PlusCircle, Trash2, Instagram, Youtube, AtSign } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define the content item type
interface ContentItem {
  id: string;
  title: string;
  description: string;
  format?: string;
  tags?: string[];
  buckets?: string[];
  platforms?: string[];
  scheduledDate?: Date | null;
}

const formatColors: Record<string, string> = {
  "Video": "bg-purple-100 text-purple-800",
  "Blog Post": "bg-blue-100 text-blue-800",
  "Reel": "bg-pink-100 text-pink-800",
  "Story": "bg-amber-100 text-amber-800",
  "Podcast": "bg-emerald-100 text-emerald-800",
  "Newsletter": "bg-indigo-100 text-indigo-800",
  "Post": "bg-cyan-100 text-cyan-800",
  "Vlog": "bg-purple-100 text-purple-800"
};

// Map platform names to their respective icons
const getPlatformIcon = (platform: string) => {
  const lowercasePlatform = platform.toLowerCase();
  
  switch (lowercasePlatform) {
    case 'instagram':
      return <Instagram className="h-3 w-3" />;
    case 'youtube':
      return <Youtube className="h-3 w-3" />;
    case 'twitter':
    case 'x':
      return <AtSign className="h-3 w-3" />;
    default:
      return <AtSign className="h-3 w-3" />;
  }
};

const isWeekend = (date: Date) => {
  const day = getDay(date);
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

const ContentCalendar = () => {
  // Set today as March 14, 2025 (Friday)
  const getToday = () => {
    const today = new Date(2025, 2, 14); // Note: months are 0-indexed, so 2 = March
    return today;
  };

  const [currentMonth, setCurrentMonth] = useState(getToday());
  const [readyToScheduleContent, setReadyToScheduleContent] = useState<ContentItem[]>([]);
  const [scheduledContent, setScheduledContent] = useState<ContentItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(getToday());
  const [showReadyContent, setShowReadyContent] = useState(true);
  const [newContentDialogOpen, setNewContentDialogOpen] = useState(false);
  const [newContentTitle, setNewContentTitle] = useState("");
  const [newContentDescription, setNewContentDescription] = useState("");
  const [newContentFormat, setNewContentFormat] = useState("Post");

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
  };

  const createNewContent = () => {
    if (!newContentTitle.trim()) return;
    
    const newItem: ContentItem = {
      id: Math.random().toString(36).substring(2, 9),
      title: newContentTitle,
      description: newContentDescription,
      format: newContentFormat,
      tags: [],
      platforms: [],
      scheduledDate: selectedDate
    };
    
    setScheduledContent(prev => [...prev, newItem]);
    setNewContentDialogOpen(false);
    setNewContentTitle("");
    setNewContentDescription("");
    setNewContentFormat("Post");
  };

  const deleteContent = (contentId: string) => {
    // Remove content from ready to schedule
    setReadyToScheduleContent(prev => prev.filter(item => item.id !== contentId));
  };

  const deleteScheduledContent = (contentId: string) => {
    // Remove content from scheduled
    setScheduledContent(prev => prev.filter(item => item.id !== contentId));
  };

  // Helper function to get the correct format display
  const getContentFormat = (content: ContentItem) => {
    if (content.format && content.format !== 'text') {
      return content.format;
    }
    
    return "Post"; // Default format
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

  // Navigation functions
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(getToday());

  // Generate days for the current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate start and end of the calendar grid (Sunday to Saturday)
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  // Generate all calendar days
  const calendarDays = eachDayOfInterval({ 
    start: calendarStart, 
    end: calendarEnd 
  });

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
            <p className="text-muted-foreground">
              Schedule and organize your content publishing plan.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={prevMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={goToToday}
              className="h-8"
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              onClick={nextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => setShowReadyContent(!showReadyContent)}
                    variant={showReadyContent ? "default" : "outline"}
                    className="h-8"
                  >
                    Ready Content
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View content ready to be scheduled</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Content Ready to Schedule Section - Always visible */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Content Ready to be Scheduled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {readyToScheduleContent.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {readyToScheduleContent.map((content) => (
                  <Card key={content.id} className="overflow-hidden h-fit max-w-[250px]">
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
                          <Badge 
                            variant="secondary" 
                            className={`text-xs flex items-center gap-1 ${
                              formatColors[getContentFormat(content)] ? formatColors[getContentFormat(content)] : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <FileText className="h-3 w-3" />
                            {getContentFormat(content)}
                          </Badge>
                        )}
                        
                        {/* Display platform tags */}
                        {content.platforms && content.platforms.length > 0 && 
                          content.platforms.slice(0, 2).map((platform, idx) => (
                            <Badge 
                              key={`platform-${idx}`} 
                              className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                            >
                              {getPlatformIcon(platform)}
                              <span>{platform}</span>
                            </Badge>
                          ))
                        }
                        {content.platforms && content.platforms.length > 2 && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            +{content.platforms.length - 2}
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
        
        <div className="text-center text-2xl font-semibold mb-4">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        
        {/* Main Calendar View */}
        <div className="border rounded-md bg-white overflow-hidden">
          {/* Calendar Header - Days of week */}
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 min-h-[70vh]">
            {calendarDays.map((day, i) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);
              const dayContent = getContentForDate(day);
              const isWeekendDay = isWeekend(day);
              
              return (
                <div 
                  key={i} 
                  className={`border-t border-l min-h-[120px] p-1 ${
                    !isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
                  } ${isCurrentDay ? "bg-blue-50" : ""} ${
                    isWeekendDay && isCurrentMonth ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    setSelectedDate(day);
                    if (isCurrentMonth && dayContent.length === 0) {
                      setNewContentDialogOpen(true);
                    }
                  }}
                >
                  <div className="flex justify-between items-start p-1">
                    <div className={`text-sm font-medium ${
                      isCurrentDay ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center" : ""
                    }`}>
                      {format(day, 'd')}
                    </div>
                    {isCurrentMonth && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(day);
                          setNewContentDialogOpen(true);
                        }}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Content items for the day */}
                  <div className="space-y-1 mt-1 max-h-[90px] overflow-y-auto">
                    {dayContent.map((content) => (
                      <div 
                        key={content.id} 
                        className="group"
                      >
                        <div 
                          className={`text-xs p-1 rounded cursor-pointer ${
                            content.format && formatColors[getContentFormat(content)] 
                              ? formatColors[getContentFormat(content)] 
                              : "bg-gray-100 text-gray-800"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open a dialog with details here if needed
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{content.title}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-4 w-4 opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteScheduledContent(content.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Display platform tags in calendar view */}
                        {content.platforms && content.platforms.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 ml-1">
                            {content.platforms.slice(0, 2).map((platform, idx) => (
                              <Badge
                                key={`cal-platform-${content.id}-${idx}`}
                                className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0 rounded-full flex items-center gap-0.5"
                              >
                                {getPlatformIcon(platform)}
                                <span className="text-[9px]">{platform}</span>
                              </Badge>
                            ))}
                            {content.platforms.length > 2 && (
                              <Badge className="bg-purple-100 text-purple-800 text-[9px]">
                                +{content.platforms.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* New Content Dialog */}
        <Dialog open={newContentDialogOpen} onOpenChange={setNewContentDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Content</DialogTitle>
              <DialogDescription>
                Create a new content item for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'selected date'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <input
                  id="title"
                  value={newContentTitle}
                  onChange={(e) => setNewContentTitle(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Content title"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <textarea
                  id="description"
                  value={newContentDescription}
                  onChange={(e) => setNewContentDescription(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Content description"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="format" className="text-sm font-medium">Format</label>
                <select
                  id="format"
                  value={newContentFormat}
                  onChange={(e) => setNewContentFormat(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Post">Post</option>
                  <option value="Video">Video</option>
                  <option value="Blog Post">Blog Post</option>
                  <option value="Reel">Reel</option>
                  <option value="Story">Story</option>
                  <option value="Podcast">Podcast</option>
                  <option value="Newsletter">Newsletter</option>
                  <option value="Vlog">Vlog</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewContentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createNewContent}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ContentCalendar;
