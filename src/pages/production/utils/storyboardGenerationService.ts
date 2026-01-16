import { shotTemplates } from "./shotTemplates";
import { StoryboardScene } from "../types";

export interface GeneratedScene {
  scriptLine: string;
  shotTemplateId: string;
  shotName: string;
  filmingDescription: string;
}

export interface StoryboardGenerationResponse {
  scenes: GeneratedScene[];
  error?: string;
}

export const generateStoryboardFromScript = async (
  script: string,
  format?: string,
  platform?: string
): Promise<StoryboardGenerationResponse> => {
  try {
    if (!script || script.trim().length < 10) {
      return {
        scenes: [],
        error: "Script is too short. Please add more content to generate a storyboard."
      };
    }

    const response = await fetch("http://localhost:3001/api/generate-storyboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        script,
        format,
        platform,
        shotTemplates // Send templates to server for validation
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Storyboard generation API error:", errorData);
      return {
        scenes: [],
        error: errorData.error || "Failed to generate storyboard"
      };
    }

    const data = await response.json();
    return { scenes: data.scenes };

  } catch (error) {
    console.error("Error generating storyboard:", error);
    return {
      scenes: [],
      error: "Failed to connect to server. Make sure the server is running (npm run server)."
    };
  }
};

// Convert generated scenes to StoryboardScene format
const colorOrder: StoryboardScene['color'][] = ['amber', 'teal', 'rose', 'violet', 'sky', 'lime', 'fuchsia', 'cyan'];

export const convertToStoryboardScenes = (generatedScenes: GeneratedScene[]): StoryboardScene[] => {
  return generatedScenes.map((scene, index) => ({
    id: `scene-${Date.now()}-${index}`,
    order: index,
    title: `Scene ${index + 1}`,
    visualNotes: scene.filmingDescription,
    color: colorOrder[index % colorOrder.length],
    highlightStart: -1,
    highlightEnd: -1,
    selectedShotTemplateId: scene.shotTemplateId,
    scriptExcerpt: scene.scriptLine
  }));
};
