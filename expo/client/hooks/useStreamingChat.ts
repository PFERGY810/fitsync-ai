import { useState, useCallback, useRef } from "react";
import { getApiUrl } from "@/lib/query-client";

interface StreamingChatOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: string) => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface StreamingChatResult {
  sendMessage: (
    message: string,
    profile: any,
    conversationHistory?: ChatMessage[]
  ) => Promise<string>;
  isStreaming: boolean;
  currentResponse: string;
  cancel: () => void;
}

/**
 * Hook for streaming AI chat responses
 * Provides real-time response updates for better UX
 */
export function useStreamingChat(options: StreamingChatOptions = {}): StreamingChatResult {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (
      message: string,
      profile: any,
      conversationHistory: ChatMessage[] = []
    ): Promise<string> => {
      // Cancel any existing stream
      cancel();

      setIsStreaming(true);
      setCurrentResponse("");

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const baseUrl = getApiUrl();
        const response = await fetch(`${baseUrl}/api/coach/chat/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "bypass-tunnel-reminder": "true",
          },
          body: JSON.stringify({
            message,
            profile,
            conversationHistory,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let fullResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === "chunk") {
                  fullResponse += data.content;
                  setCurrentResponse(fullResponse);
                  options.onChunk?.(data.content);
                } else if (data.type === "done") {
                  options.onComplete?.(fullResponse);
                } else if (data.type === "error") {
                  options.onError?.(data.error);
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }

        setIsStreaming(false);
        return fullResponse;
      } catch (error: any) {
        if (error.name === "AbortError") {
          // Request was cancelled
          return currentResponse;
        }

        setIsStreaming(false);
        const errorMessage = error?.message || "Stream failed";
        options.onError?.(errorMessage);
        throw error;
      }
    },
    [cancel, currentResponse, options]
  );

  return {
    sendMessage,
    isStreaming,
    currentResponse,
    cancel,
  };
}

/**
 * Fallback to non-streaming chat if streaming fails
 */
export async function sendChatMessage(
  message: string,
  profile: any,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  const baseUrl = getApiUrl();
  const response = await fetch(`${baseUrl}/api/coach/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "bypass-tunnel-reminder": "true",
    },
    body: JSON.stringify({
      message,
      profile,
      conversationHistory,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.response;
}
