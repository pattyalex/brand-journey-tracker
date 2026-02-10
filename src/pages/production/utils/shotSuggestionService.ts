import { shotTemplates, getAllTemplateIds } from "./shotTemplates";

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
        shotTemplates // Send templates to server for validation
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
