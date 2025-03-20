
import { ContentItem } from "@/types/content";

export const restoreContentToIdeas = (content: ContentItem, originalPillarId: string = "1") => {
  try {
    // Get existing restored content from localStorage
    const restoredIdeasKey = 'restoredToIdeasContent';
    let restoredIdeas = [];
    
    const storedContent = localStorage.getItem(restoredIdeasKey);
    if (storedContent) {
      restoredIdeas = JSON.parse(storedContent);
    }
    
    console.log(`Restoring content "${content.title}" to pillar ID: ${originalPillarId}`);
    
    // Add current content to restored ideas with a timestamp and original pillar ID
    restoredIdeas.push({
      ...content,
      restoredAt: new Date().toISOString(),
      // Adding a flag to make it easier to identify restored items
      isRestored: true,
      // Always store the specified originalPillarId
      originalPillarId: originalPillarId
    });
    
    // Save back to localStorage
    localStorage.setItem(restoredIdeasKey, JSON.stringify(restoredIdeas));
    
    // Also add a log entry to track the restoration
    let restorationLog = [];
    const logKey = 'contentRestorationLog';
    const existingLog = localStorage.getItem(logKey);
    
    if (existingLog) {
      restorationLog = JSON.parse(existingLog);
    }
    
    restorationLog.push({
      contentId: content.id,
      title: content.title,
      pillarId: originalPillarId,
      restoredAt: new Date().toISOString()
    });
    
    localStorage.setItem(logKey, JSON.stringify(restorationLog));
    
    console.log(`Content "${content.title}" (ID: ${content.id}) has been marked for restoration to Ideas Pillar ${originalPillarId}`);
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
      console.log(`Retrieved ${restoredIdeas.length} items that were restored to Ideas`);
      
      // Map through each item to ensure it has an originalPillarId
      const processedIdeas = restoredIdeas.map((item: ContentItem) => {
        if (!item.originalPillarId) {
          console.log(`Setting default originalPillarId for item: ${item.id}`);
          return { ...item, originalPillarId: "1" };
        }
        return item;
      });
      
      // Clear the restored ideas from localStorage after retrieving them
      localStorage.removeItem(restoredIdeasKey);
      
      return processedIdeas;
    }
    
    return [];
  } catch (error) {
    console.error("Error getting restored ideas:", error);
    return [];
  }
};

export const getRestorationLog = () => {
  try {
    const logKey = 'contentRestorationLog';
    const existingLog = localStorage.getItem(logKey);
    
    if (existingLog) {
      return JSON.parse(existingLog);
    }
    
    return [];
  } catch (error) {
    console.error("Error getting restoration log:", error);
    return [];
  }
};

export const clearRestorationLog = () => {
  localStorage.removeItem('contentRestorationLog');
};
