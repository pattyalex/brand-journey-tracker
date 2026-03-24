/**
 * Centralized Claude API service.
 * All calls go through the server-side proxy at /api/claude
 * to keep the API key secure.
 */

import { supabase } from '@/lib/supabase';

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

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
 * Call the Claude API through the server-side proxy.
 * Returns { ok, text, error }.
 */
export async function callClaudeAPI(options: ClaudeRequestOptions): Promise<ClaudeResponse> {
  try {
    // Get the current session token for auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { ok: false, text: "", error: "Not authenticated" };
    }

    const response = await fetch("http://localhost:3001/api/claude", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
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
      const errorMessage = data.error?.message || data.error || "Unknown error";
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
