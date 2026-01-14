import { StorageKeys, getString } from "@/lib/storage";
import { shotTemplates, getAllTemplateIds, ShotTemplate } from "./shotTemplates";

export interface ShotSuggestion {
  template_id: string;
  reason: string;
}

export interface ShotSuggestionResponse {
  suggestions: ShotSuggestion[];
  error?: string;
}

// Build the template reference for the AI prompt
const buildTemplateReference = (): string => {
  return shotTemplates.map(t =>
    `- ID: "${t.id}" | Name: "${t.user_facing_name}" | Tags: [${t.internal_tags.join(', ')}]`
  ).join('\n');
};

export const suggestShotsForScene = async (
  sceneTitle: string,
  sceneVisualNotes: string,
  scriptExcerpt: string,
  format?: string,
  platform?: string
): Promise<ShotSuggestionResponse> => {
  try {
    const apiKey = getString(StorageKeys.openaiApiKey);

    if (!apiKey) {
      return {
        suggestions: [],
        error: "OpenAI API key not configured. Please add it in Settings."
      };
    }

    const validTemplateIds = getAllTemplateIds();
    const templateReference = buildTemplateReference();

    const systemPrompt = `You are a cinematography assistant helping content creators choose how to film their scenes.

IMPORTANT RULES:
1. You MUST only select from the provided shot template IDs below. NEVER invent new shot types.
2. Return exactly 2-3 recommendations.
3. Keep reasons short (1 sentence max).
4. Consider the scene's emotional tone, purpose, and content type.

AVAILABLE SHOT TEMPLATES (use ONLY these IDs):
${templateReference}

VALID TEMPLATE IDs: ${validTemplateIds.join(', ')}

Respond ONLY with valid JSON in this exact format:
{
  "suggestions": [
    {"template_id": "exact-id-from-list", "reason": "Brief reason why this shot works"},
    {"template_id": "exact-id-from-list", "reason": "Brief reason why this shot works"}
  ]
}`;

    const userPrompt = `Suggest 2-3 shot types for this scene:

Scene Title: ${sceneTitle || 'Untitled'}
Visual Notes: ${sceneVisualNotes || 'None provided'}
Script Excerpt: "${scriptExcerpt || 'No script'}"
${format ? `Video Format: ${format}` : ''}
${platform ? `Platform: ${platform}` : ''}

Remember: Only use template IDs from the provided list.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return {
        suggestions: [],
        error: errorData.error?.message || "Failed to generate shot suggestions"
      };
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the JSON response
    let parsed;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return {
        suggestions: [],
        error: "Failed to parse AI response"
      };
    }

    // Validate that all template IDs are valid
    const validatedSuggestions: ShotSuggestion[] = [];
    for (const suggestion of parsed.suggestions || []) {
      if (validTemplateIds.includes(suggestion.template_id)) {
        validatedSuggestions.push({
          template_id: suggestion.template_id,
          reason: suggestion.reason || "Recommended for this scene"
        });
      }
    }

    // If no valid suggestions, return an error
    if (validatedSuggestions.length === 0) {
      return {
        suggestions: [],
        error: "AI returned invalid shot types. Please try again."
      };
    }

    return { suggestions: validatedSuggestions };

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return {
      suggestions: [],
      error: "Failed to connect to OpenAI. Please try again."
    };
  }
};
