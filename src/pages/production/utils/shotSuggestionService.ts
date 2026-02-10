import { shotTemplates, getAllTemplateIds } from "./shotTemplates";
import { getString, StorageKeys } from "@/lib/storage";

export interface ShotSuggestion {
  template_id: string;
  reason: string;
}

export interface ShotSuggestionResponse {
  suggestions: ShotSuggestion[];
  error?: string;
}

export const suggestShotsForScene = async (
  sceneTitle: string,
  sceneVisualNotes: string,
  scriptExcerpt: string,
  format?: string,
  platform?: string
): Promise<ShotSuggestionResponse> => {
  try {
    // Get API key from localStorage (set in settings)
    const apiKey = getString(StorageKeys.anthropicApiKey);

    const response = await fetch("http://localhost:3001/api/suggest-shots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sceneTitle,
        sceneVisualNotes,
        scriptExcerpt,
        format,
        platform,
        shotTemplates, // Send templates to server for validation
        apiKey // Pass the API key from settings
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Shot suggestion API error:", errorData);
      return {
        suggestions: [],
        error: errorData.error || "Failed to generate shot suggestions"
      };
    }

    const data = await response.json();
    return { suggestions: data.suggestions };

  } catch (error) {
    console.error("Error calling shot suggestion API:", error);
    return {
      suggestions: [],
      error: "Failed to connect to server. Make sure the server is running."
    };
  }
};
