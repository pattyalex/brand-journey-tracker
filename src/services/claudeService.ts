/**
 * Centralized Claude API service.
 * All calls go through the server-side proxy at /api/claude
 * to keep the API key secure.
 */

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
    const { supabase } = await import('@/lib/supabase');
    const { data: { session } } = await supabase.auth.getSession();
    const { API_BASE } = await import('@/lib/api-base');
    const response = await fetch(`${API_BASE}/api/claude`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {}),
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

  const regex = pattern === "array" ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;

  try {
    const match = result.text.match(regex);
    if (match) {
      return { ok: true, data: JSON.parse(match[0]) as T };
    }
  } catch (err) {
    console.error("JSON parse error on first attempt:", err);
  }

  // Retry once — Claude sometimes returns prose instead of JSON
  console.warn("[callClaudeForJSON] No valid JSON in response, retrying with stricter prompt...");
  const retry = await callClaudeAPI({
    ...options,
    messages: [
      ...options.messages,
      { role: "assistant", content: result.text },
      { role: "user", content: `That response was not valid JSON. You MUST return ONLY a raw JSON ${pattern} with no explanation, no markdown, no backticks. Just the ${pattern === "array" ? "[ ... ]" : "{ ... }"}.` },
    ],
  });

  if (!retry.ok) {
    return { ok: false, data: null, error: retry.error };
  }

  try {
    const retryMatch = retry.text.match(regex);
    if (retryMatch) {
      return { ok: true, data: JSON.parse(retryMatch[0]) as T };
    }
    return { ok: false, data: null, error: "No valid JSON found in response after retry" };
  } catch (err) {
    console.error("JSON parse error on retry:", err);
    return { ok: false, data: null, error: "Failed to parse JSON from response" };
  }
}
