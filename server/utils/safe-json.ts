/**
 * Safe JSON parsing utility for AI responses
 * Prevents crashes from malformed JSON responses
 */

export function safeJsonParse<T>(content: string | null | undefined, fallback: T): T {
  if (!content) return fallback;
  
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    console.error("[SafeJSON] Failed to parse JSON:", error);
    console.error("[SafeJSON] Content preview:", content.substring(0, 200));
    return fallback;
  }
}

/**
 * Parse AI response content with logging
 */
export function parseAiResponse<T>(
  response: { choices?: Array<{ message?: { content?: string | null } }> } | null | undefined,
  fallback: T,
  context?: string
): T {
  const content = response?.choices?.[0]?.message?.content;
  
  if (!content) {
    console.warn(`[SafeJSON] Empty AI response${context ? ` for ${context}` : ""}`);
    return fallback;
  }
  
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`[SafeJSON] Failed to parse AI response${context ? ` for ${context}` : ""}:`, error);
    console.error("[SafeJSON] Content preview:", content.substring(0, 500));
    return fallback;
  }
}
