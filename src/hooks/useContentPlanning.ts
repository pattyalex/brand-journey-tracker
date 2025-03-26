
import { useState, useEffect, useMemo } from "react";
import { ContentItem } from "@/types/content";
import { toast } from "sonner";

type ContentStatus = "scheduled" | "ready" | "draft" | "published";

export function useContentPlanning() {
  const [finalizedIdeas, setFinalizedIdeas] = useState<ContentItem[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<ContentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");

  // Load content once on mount
  useEffect(() => {
    // Load content from localStorage (would be replaced with API calls in production)
    const loadContent = () => {
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

  // Memoize filtered ideas for better performance
  const filteredContent = useMemo(() => {
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
    
    return filtered;
  }, [searchTerm, statusFilter, finalizedIdeas]);

  // Update filtered ideas whenever memoized results change
  useEffect(() => {
    setFilteredIdeas(filteredContent);
  }, [filteredContent]);

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

  return {
    filteredIdeas,
    searchTerm,
    setSearchTerm,
    editingItemId,
    setEditingItemId,
    statusFilter,
    setStatusFilter,
    handleScheduleItem,
    handleStatusChange, 
    handleDelete
  };
}
