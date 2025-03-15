
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { ContentItem } from "@/types/content";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  FileText, 
  Filter, 
  PenLine, 
  Trash2, 
  ClipboardCheck, 
  Search 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import DateSchedulePicker from "@/components/content/DateSchedulePicker";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";

type ContentStatus = "scheduled" | "ready" | "draft" | "published";

const ContentPlanning = () => {
  const [finalizedIdeas, setFinalizedIdeas] = useState<ContentItem[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<ContentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  
  // Form setup for editing schedule date
  const form = useForm({
    defaultValues: {
      scheduleDate: undefined as Date | undefined,
    }
  });

  useEffect(() => {
    // Load content from localStorage
    const loadContent = () => {
      // This would be replaced with proper API calls in a production app
      const allPillarsStr = localStorage.getItem("contentPillars");
      if (!allPillarsStr) return [];
      
      try {
        const allPillars = JSON.parse(allPillarsStr);
        // Flatten all content from all pillars
        return allPillars.flatMap((pillar: any) => pillar.content || []);
      } catch (error) {
        console.error("Error loading content:", error);
        return [];
      }
    };
    
    // Get finalized content (for demo, we'll assume anything with a title is "finalized")
    const allContent = loadContent();
    const finalizedContent = allContent.filter((item: ContentItem) => item.title && (item.bucketId || item.status));
    setFinalizedIdeas(finalizedContent);
    setFilteredIdeas(finalizedContent);
  }, []);

  // Filter content whenever search term or status filter changes
  useEffect(() => {
    let filtered = [...finalizedIdeas];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) || 
        (item.description && item.description.toLowerCase().includes(term))
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => 
        item.status === statusFilter || 
        (item.bucketId === statusFilter)
      );
    }
    
    setFilteredIdeas(filtered);
  }, [searchTerm, statusFilter, finalizedIdeas]);

  const handleScheduleItem = (itemId: string, date: Date) => {
    setFinalizedIdeas(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, scheduledDate: date } 
          : item
      )
    );
    
    toast.success("Content scheduled successfully");
    setEditingItemId(null);
  };

  const handleStatusChange = (itemId: string, newStatus: ContentStatus) => {
    setFinalizedIdeas(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, status: newStatus } 
          : item
      )
    );
    
    toast.success(`Status updated to ${newStatus}`);
  };

  const handleDelete = (itemId: string) => {
    setFinalizedIdeas(prevItems => prevItems.filter(item => item.id !== itemId));
    toast.success("Content removed from planning");
  };

  // Function to get the content format from the URL field (if stored as JSON)
  const getContentFormat = (item: ContentItem) => {
    if (item.format) return item.format;
    
    if (item.url) {
      try {
        const parsedContent = JSON.parse(item.url);
        return parsedContent.format;
      } catch {
        return "text";
      }
    }
    
    return "text";
  };

  // Function to determine badge color based on status
  const getStatusBadgeColor = (status: string | undefined) => {
    switch(status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "ready": return "bg-green-100 text-green-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "published": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplay = (item: ContentItem) => {
    return item.status || item.bucketId || "draft";
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6 fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Content Planning</h1>
            <p className="text-muted-foreground">Schedule and manage your finalized content ideas</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search content..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setStatusFilter("all")}
                  className={statusFilter === "all" ? "bg-accent" : ""}
                >
                  All Content
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setStatusFilter("draft")}
                  className={statusFilter === "draft" ? "bg-accent" : ""}
                >
                  Drafts
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setStatusFilter("ready")}
                  className={statusFilter === "ready" ? "bg-accent" : ""}
                >
                  Ready to Schedule
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setStatusFilter("scheduled")}
                  className={statusFilter === "scheduled" ? "bg-accent" : ""}
                >
                  Scheduled
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setStatusFilter("published")}
                  className={statusFilter === "published" ? "bg-accent" : ""}
                >
                  Published
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="bg-white rounded-md border shadow-sm overflow-hidden">
          <ScrollArea className="h-[calc(100vh-220px)]">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[250px]">Content Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Format</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[160px]">Scheduled Date</TableHead>
                  <TableHead className="w-[150px]">Platforms</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIdeas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ClipboardCheck className="h-8 w-8 mb-2" />
                        <p>No content ideas found</p>
                        <p className="text-sm">
                          Finalize ideas in the Idea Development section to see them here
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIdeas.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.title}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <FileText className="h-3 w-3" />
                          {getContentFormat(item)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`${getStatusBadgeColor(getStatusDisplay(item))} capitalize`}
                        >
                          {getStatusDisplay(item)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {editingItemId === item.id ? (
                          <Form {...form}>
                            <FormField
                              control={form.control}
                              name="scheduleDate"
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <DateSchedulePicker
                                      date={field.value || item.scheduledDate}
                                      onDateChange={(date) => {
                                        field.onChange(date);
                                        if (date) handleScheduleItem(item.id, date);
                                      }}
                                      label=""
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </Form>
                        ) : (
                          <div 
                            className="flex items-center gap-1 cursor-pointer"
                            onClick={() => setEditingItemId(item.id)}
                          >
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {item.scheduledDate ? (
                              <span>
                                {format(new Date(item.scheduledDate), "MMM d, yyyy")}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Not scheduled</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.platforms && item.platforms.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.platforms.slice(0, 2).map((platform, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {platform}
                              </Badge>
                            ))}
                            {item.platforms.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.platforms.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <PenLine className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-[200px] p-2">
                              <div className="space-y-1">
                                <p className="text-sm font-medium mb-2">Update Status</p>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-start"
                                  onClick={() => handleStatusChange(item.id, "draft")}
                                >
                                  <Badge className="bg-gray-100 text-gray-800 mr-2">
                                    Draft
                                  </Badge>
                                  <span>Draft</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-start"
                                  onClick={() => handleStatusChange(item.id, "ready")}
                                >
                                  <Badge className="bg-green-100 text-green-800 mr-2">
                                    Ready
                                  </Badge>
                                  <span>Ready to Schedule</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-start"
                                  onClick={() => handleStatusChange(item.id, "scheduled")}
                                >
                                  <Badge className="bg-blue-100 text-blue-800 mr-2">
                                    Scheduled
                                  </Badge>
                                  <span>Scheduled</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-start"
                                  onClick={() => handleStatusChange(item.id, "published")}
                                >
                                  <Badge className="bg-purple-100 text-purple-800 mr-2">
                                    Published
                                  </Badge>
                                  <span>Published</span>
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>
    </Layout>
  );
};

export default ContentPlanning;
