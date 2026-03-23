/**
 * Centralized Claude API service.
 * All calls to the Anthropic Messages API go through here.
 */

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const ANTHROPIC_VERSION = "2023-06-01";

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeRequestOptions {
  system: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  model?: string;
}

export interface ClaudeResponse {
  ok: boolean;
  text: string;
  error?: string;
}

/**
 * Call the Claude API with a system prompt and messages.
 * Returns { ok, text, error }.
 */
export async function callClaudeAPI(options: ClaudeRequestOptions): Promise<ClaudeResponse> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, text: "", error: "API key not configured" };
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: options.model ?? DEFAULT_MODEL,
        max_tokens: options.maxTokens ?? 800,
        system: options.system,
        messages: options.messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Claude API error:", data);
      const errorMessage = data.error?.message || "Unknown error";
      return { ok: false, text: "", error: errorMessage };
    }

    return { ok: true, text: data.content[0].text };
  } catch (err) {
    console.error("Claude API fetch error:", err);
    return { ok: false, text: "", error: "Network error calling Claude API" };
  }
}

/**
 * Call Claude and parse a JSON object from the response text.
 */
export async function callClaudeForJSON<T = unknown>(
  options: ClaudeRequestOptions,
  pattern: "object" | "array" = "object"
): Promise<{ ok: boolean; data: T | null; error?: string }> {
  const result = await callClaudeAPI(options);
  if (!result.ok) {
    return { ok: false, data: null, error: result.error };
  }

  try {
    const regex = pattern === "array" ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
    const match = result.text.match(regex);
    if (match) {
      return { ok: true, data: JSON.parse(match[0]) as T };
    }
    return { ok: false, data: null, error: "No valid JSON found in response" };
  } catch (err) {
    console.error("JSON parse error:", err);
    return { ok: false, data: null, error: "Failed to parse JSON from response" };
  }
}
