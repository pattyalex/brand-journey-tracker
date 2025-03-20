
import { ContentItem } from "@/types/content";

export const restoreContentToIdeas = (content: ContentItem) => {
  try {
    // Get existing restored content from localStorage
    const restoredIdeasKey = 'restoredToIdeasContent';
    let restoredIdeas = [];
    
    const storedContent = localStorage.getItem(restoredIdeasKey);
    if (storedContent) {
      restoredIdeas = JSON.parse(storedContent);
    }
    
    // Add current content to restored ideas
    restoredIdeas.push({
      ...content,
      restoredAt: new Date().toISOString()
    });
    
    // Save back to localStorage
    localStorage.setItem(restoredIdeasKey, JSON.stringify(restoredIdeas));
    
    return true;
  } catch (error) {
    console.error("Error restoring content to ideas:", error);
    return false;
  }
};

export const getRestoredIdeas = (): ContentItem[] => {
  try {
    const restoredIdeasKey = 'restoredToIdeasContent';
    const storedContent = localStorage.getItem(restoredIdeasKey);
    
    if (storedContent) {
      const restoredIdeas = JSON.parse(storedContent);
      
      // Clear the restored ideas from localStorage after retrieving them
      localStorage.removeItem(restoredIdeasKey);
      
      return restoredIdeas;
    }
    
    return [];
  } catch (error) {
    console.error("Error getting restored ideas:", error);
    return [];
  }
};
