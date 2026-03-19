import { shotTemplates, getAllTemplateIds } from "./shotTemplates";
import { callClaudeForJSON } from "@/services/claudeService";

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
    // Build template reference for the prompt
    const templateReference = shotTemplates.map(t =>
      `- ID: "${t.id}" | Name: "${t.user_facing_name}" | Tags: [${t.internal_tags.join(', ')}]`
    ).join('\n');

    const validTemplateIds = shotTemplates.map(t => t.id);

    const systemPrompt = `You are a cinematography assistant helping content creators choose how to film their scenes.

IMPORTANT RULES:
1. You MUST only select from the provided shot template IDs below. NEVER invent new shot types.
2. Return exactly 2-3 recommendations.
3. Keep reasons short (1 sentence max).
4. DO NOT repeat the shot name in your reason. Start directly with why it works (e.g., "Works well for..." or "Creates intimacy..." or "Adds visual variety...").
5. Consider the scene's emotional tone, purpose, and content type.

AVAILABLE SHOT TEMPLATES (use ONLY these IDs):
${templateReference}

VALID TEMPLATE IDs: ${validTemplateIds.join(', ')}

Respond ONLY with valid JSON in this exact format:
{
  "suggestions": [
    {"template_id": "exact-id-from-list", "reason": "Works well for [brief reason]"},
    {"template_id": "exact-id-from-list", "reason": "Creates [brief effect/benefit]"}
  ]
}`;

    const userPrompt = `Suggest 2-3 shot types for this scene:

Scene Title: ${sceneTitle || 'Untitled'}
Visual Notes: ${sceneVisualNotes || 'None provided'}
Script Excerpt: "${scriptExcerpt || 'No script'}"
${format ? `Video Format: ${format}` : ''}
${platform ? `Platform: ${platform}` : ''}

Remember: Only use template IDs from the provided list.`;

    const result = await callClaudeForJSON<{ suggestions: ShotSuggestion[] }>({
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      maxTokens: 300,
    }, "object");

    if (!result.ok) {
      const errorMessage = result.error || "Unknown error";
      if (errorMessage.includes("invalid") && errorMessage.includes("key")) {
        return { suggestions: [], error: "AI service is temporarily unavailable. Please try again later." };
      }
      return { suggestions: [], error: `Claude API error: ${errorMessage}` };
    }

    const parsed = result.data;

    // Validate that all template IDs are valid
    const validatedSuggestions: ShotSuggestion[] = [];
    for (const suggestion of parsed.suggestions || []) {
      if (validTemplateIds.includes(suggestion.template_id)) {
        validatedSuggestions.push({
          template_id: suggestion.template_id,
          reason: suggestion.reason || 'Recommended for this scene'
        });
      }
    }

    if (validatedSuggestions.length === 0) {
      return { suggestions: [], error: 'AI returned invalid shot types. Please try again.' };
    }

    return { suggestions: validatedSuggestions };

  } catch (error) {
    console.error("Error generating shot suggestions:", error);
    return {
      suggestions: [],
      error: "Failed to generate suggestions. Please check your internet connection and try again."
    };
  }
};
