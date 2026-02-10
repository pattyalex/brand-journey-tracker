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
    // Get API key from environment variable
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    if (!apiKey) {
      return {
        suggestions: [],
        error: "AI service is temporarily unavailable. Please try again later."
      };
    }

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
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Claude API error:", data);
      const errorMessage = data.error?.message || "Unknown error";
      if (errorMessage.includes("invalid") && errorMessage.includes("key")) {
        return { suggestions: [], error: "AI service is temporarily unavailable. Please try again later." };
      }
      return { suggestions: [], error: `Claude API error: ${errorMessage}` };
    }

    const content = data.content[0].text;

    // Parse the JSON response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return { suggestions: [], error: 'Failed to parse AI response' };
    }

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
