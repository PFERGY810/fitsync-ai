/**
 * Shared OpenAI client instance
 * Centralized configuration for all AI features
 */
import OpenAI from "openai";

/**
 * Check if the OpenAI client is properly configured
 */
export function isOpenAiConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return !!key && key !== "missing" && key.trim() !== "" && key.startsWith("sk-");
}

/**
 * Validate OpenAI API key - throws if invalid
 */
export function validateOpenAiKey(): void {
  if (!isOpenAiConfigured()) {
    throw new Error(
      "OpenAI API key is not configured. Set OPENAI_API_KEY in your .env file."
    );
  }
}

/**
 * Get a validated OpenAI client instance
 * Throws an error if API key is not configured
 */
function createOpenAiClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === "missing" || apiKey.trim() === "") {
    console.error("WARNING: OPENAI_API_KEY is not set. AI features will fail.");
    // Return client anyway - will fail on actual API calls
    return new OpenAI({ apiKey: "not-configured" });
  }
  
  return new OpenAI({ apiKey });
}

// Single OpenAI instance for the entire application
export const openai = createOpenAiClient();

/**
 * Default model for text generation
 */
export const DEFAULT_MODEL = "gpt-4o";

/**
 * Default max tokens for different use cases
 */
export const MAX_TOKENS = {
  SHORT: 500,
  MEDIUM: 1000,
  LONG: 1500,
  EXTRA_LONG: 2500,
  PROGRAM: 3000,
  COMPREHENSIVE: 3500,
} as const;

/**
 * Retry wrapper for OpenAI API calls with exponential backoff
 */
export async function withOpenAiRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelay?: number; context?: string } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, context = "OpenAI API call" } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const isRetryable = 
        (error as { status?: number }).status === 429 || // Rate limit
        (error as { status?: number }).status === 500 || // Server error
        (error as { status?: number }).status === 503 || // Service unavailable
        (error as { code?: string }).code === "ECONNRESET" ||
        (error as { code?: string }).code === "ETIMEDOUT";
      
      if (!isRetryable || attempt === maxRetries) {
        console.error(`${context} failed after ${attempt} attempt(s):`, error);
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(`${context} failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
