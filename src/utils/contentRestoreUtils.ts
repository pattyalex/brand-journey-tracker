
import { ContentItem } from "@/types/content";
import { StorageKeys, getString, remove, setString } from "@/lib/storage";

export const restoreContentToIdeas = (content: ContentItem, originalPillarId: string | undefined = undefined) => {
  try {
    // Get existing restored content from localStorage
    const restoredIdeasKey = StorageKeys.restoredToIdeasContent;
    let restoredIdeas = [];
    
    const storedContent = getString(restoredIdeasKey);
    if (storedContent) {
      restoredIdeas = JSON.parse(storedContent);
    }
    
    console.log(`ContentRestoreUtils: Restoring content "${content.title}" (ID: ${content.id})`);
    console.log(`- Content's existing originalPillarId: ${content.originalPillarId || "undefined"}`);
    console.log(`- Content's bucketId: ${content.bucketId || "undefined"}`);
    console.log(`- Explicitly provided originalPillarId: ${originalPillarId || "undefined"}`);
    
    // Prioritize in this order:
    // 1. Explicitly provided originalPillarId parameter
    // 2. Content's own originalPillarId property
    // 3. Content's bucketId property (if it represents a pillar)
    // We no longer default to "1"
    const finalPillarId = originalPillarId || content.originalPillarId || content.bucketId;
    
    if (!finalPillarId) {
      console.error(`No pillar ID found for content "${content.title}" (ID: ${content.id}). Cannot restore properly.`);
    }
    
    console.log(`- Final pillar ID for restoration: ${finalPillarId || "undefined"}`);
    
    // Add current content to restored ideas with a timestamp and original pillar ID
    restoredIdeas.push({
      ...content,
      restoredAt: new Date().toISOString(),
      // Adding a flag to make it easier to identify restored items
      isRestored: true,
      // Use the determined pillar ID, but NEVER default to "1"
      originalPillarId: finalPillarId
    });
    
    // Save back to localStorage
    setString(restoredIdeasKey, JSON.stringify(restoredIdeas));
    
    // Also add a log entry to track the restoration
    let restorationLog = [];
    const logKey = StorageKeys.contentRestorationLog;
    const existingLog = getString(logKey);
    
    if (existingLog) {
      restorationLog = JSON.parse(existingLog);
    }
    
    restorationLog.push({
      contentId: content.id,
      title: content.title,
      pillarId: finalPillarId,
      restoredAt: new Date().toISOString()
    });
    
    setString(logKey, JSON.stringify(restorationLog));
    
    console.log(`Content "${content.title}" (ID: ${content.id}) has been marked for restoration to Ideas Pillar ${finalPillarId || "unknown"}`);
    return true;
  } catch (error) {
    console.error("Error restoring content to ideas:", error);
    return false;
  }
};

export const getRestoredIdeas = (): ContentItem[] => {
  try {
    const restoredIdeasKey = StorageKeys.restoredToIdeasContent;
    const storedContent = getString(restoredIdeasKey);
    
    if (storedContent) {
      const restoredIdeas = JSON.parse(storedContent);
      console.log(`Retrieved ${restoredIdeas.length} items that were restored to Ideas`);
      
      // Only process items where originalPillarId isn't set
      // We no longer set default of "1"
      const processedIdeas = restoredIdeas.map((item: ContentItem) => {
        if (!item.originalPillarId) {
          console.log(`Warning: No originalPillarId for restored item: ${item.id}`);
        }
        return item;
      });
      
      // Clear the restored ideas from localStorage after retrieving them
      remove(restoredIdeasKey);
      
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
    const logKey = StorageKeys.contentRestorationLog;
    const existingLog = getString(logKey);
    
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
  remove(StorageKeys.contentRestorationLog);
};
