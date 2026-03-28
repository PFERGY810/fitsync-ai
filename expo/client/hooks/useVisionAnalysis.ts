import { useState, useCallback } from "react";
import { getApiUrl } from "@/lib/query-client";
import { convertPhotosToBase64 } from "@/lib/image-utils";

interface VisionAnalysisOptions {
  endpoint: string;
  timeout?: number;
  retries?: number;
}

export function useVisionAnalysis(options: VisionAnalysisOptions) {
  const { endpoint, timeout = 120000, retries = 2 } = options; // Increased to 120s
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(
    async (
      photos: {
        front?: string;
        side?: string;
        back?: string;
        legs?: string;
      },
      additionalData?: Record<string, any>,
    ) => {
      setAnalyzing(true);
      setError(null);

      let retryCount = 0;

      while (retryCount <= retries) {
        try {
          const base64Photos = await convertPhotosToBase64(photos);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          const response = await fetch(
            new URL(endpoint, getApiUrl()).toString(),
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                photos: base64Photos,
                ...additionalData,
              }),
              signal: controller.signal,
            },
          );

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Analysis failed: ${response.status}`);
          }

          const data = await response.json();
          setAnalyzing(false);
          return data;
        } catch (err: any) {
          console.error("Vision analysis error:", err);

          if (err.name === "AbortError") {
            setError("Analysis timed out. Please try again.");
            setAnalyzing(false);
            throw err;
          }

          if (retryCount < retries) {
            retryCount++;
            console.log(`Retrying analysis (attempt ${retryCount + 1}/${retries + 1})...`);
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }

          setError(err.message || "Failed to analyze photos");
          setAnalyzing(false);
          throw err;
        }
      }
    },
    [endpoint, timeout, retries],
  );

  return {
    analyze,
    analyzing,
    error,
  };
}
