import { shotTemplates } from "./shotTemplates";
import { StoryboardScene } from "../types";
import { getString, StorageKeys } from "@/lib/storage";

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

    // Get API key from localStorage (set in settings)
    const apiKey = getString(StorageKeys.anthropicApiKey);

    if (!apiKey) {
      return {
        scenes: [],
        error: "Please add your Anthropic API key in Settings to use this feature."
      };
    }

    // Build template reference for the prompt
    const templateReference = shotTemplates.map(t =>
      `- "${t.id}": ${t.user_facing_name} - ${t.description.slice(0, 100)}...`
    ).join('\n');

    const validTemplateIds = shotTemplates.map(t => t.id);

    const systemPrompt = `You are a professional video director helping content creators plan their shoots.
Your task is to analyze a script and break it into filmable scenes, selecting the most appropriate shot type for each.

AVAILABLE SHOT TYPES (you MUST only use these exact IDs):
${templateReference}

CRITICAL RULES:
1. Break the script into logical moments/scenes (each line or sentence that represents one shot)
2. For "scriptLine" you MUST use the EXACT TEXT copied directly from the script - do NOT paraphrase or summarize
3. For each scene, select the MOST appropriate shot from the available options using ONLY the provided IDs
4. Write a practical, beginner-friendly filming description (framing + simple direction)
5. Keep descriptions concise but actionable (1-2 sentences)
6. Vary the shot types for visual interest - don't use the same shot repeatedly
7. Consider the content type: ${format || 'video'} for ${platform || 'social media'}

IMPORTANT: The "scriptLine" field must contain EXACT quotes from the script, not summaries or descriptions.

RESPOND WITH ONLY a JSON array in this exact format (no other text):
[
  {
    "scriptLine": "Copy the EXACT text from the script here - no paraphrasing",
    "shotTemplateId": "one-of-the-valid-shot-ids",
    "filmingDescription": "Brief, practical direction for how to film this shot"
  }
]`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          { role: "user", content: `Here is the script to break into filmable scenes:\n\n${script}` }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Claude API error:", data);
      const errorMessage = data.error?.message || "Unknown error";
      if (errorMessage.includes("invalid") && errorMessage.includes("key")) {
        return { scenes: [], error: "Invalid API key. Please check your Anthropic API key in Settings." };
      }
      if (errorMessage.includes("credit") || errorMessage.includes("billing")) {
        return { scenes: [], error: "Your Anthropic account needs credits. Please add billing at console.anthropic.com" };
      }
      return { scenes: [], error: `Claude API error: ${errorMessage}` };
    }

    const content = data.content[0].text;

    // Parse the JSON response
    let scenes: GeneratedScene[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item.scriptLine && item.shotTemplateId && item.filmingDescription) {
              // Validate shot ID - default to medium-shot if invalid
              const shotId = validTemplateIds.includes(item.shotTemplateId)
                ? item.shotTemplateId
                : 'medium-shot';

              const template = shotTemplates.find(t => t.id === shotId);

              scenes.push({
                scriptLine: item.scriptLine,
                shotTemplateId: shotId,
                shotName: template?.user_facing_name || 'Medium Shot',
                filmingDescription: item.filmingDescription
              });
            }
          }
        }
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return { scenes: [], error: "Failed to parse AI response. Please try again." };
    }

    if (scenes.length === 0) {
      return { scenes: [], error: "Could not generate scenes from script. Please try again." };
    }

    return { scenes };

  } catch (error) {
    console.error("Error generating storyboard:", error);
    return {
      scenes: [],
      error: "Failed to generate storyboard. Please check your internet connection and try again."
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
