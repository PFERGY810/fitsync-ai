import { QueryClient, QueryFunction, MutationCache, QueryCache } from "@tanstack/react-query";
import Constants from "expo-constants";

// Cache durations for different data types (in ms)
const CACHE_TIMES = {
  STATIC: 1000 * 60 * 60, // 1 hour - rarely changing data (achievements, templates)
  PROFILE: 1000 * 60 * 10, // 10 minutes - user profile data
  DYNAMIC: 1000 * 60 * 2, // 2 minutes - frequently changing (workouts, logs)
  REALTIME: 1000 * 30, // 30 seconds - live data (leaderboards)
};

// Request timeout (prevent hanging)
const REQUEST_TIMEOUT = 15000; // 15 seconds

/**
 * Gets the base URL for the Express API server
 */
export function getApiUrl(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  const devServerIp = hostUri ? hostUri.split(":")[0] : null;

  // Use environment variable if provided
  const host = process.env.EXPO_PUBLIC_DOMAIN;

  if (host) {
    return `https://${host}`;
  }

  // Fallback for development/local testing
  if (__DEV__ && devServerIp) {
    return `http://${devServerIp}:5000`;
  }

  // Fallback to localhost if all else fails
  return "http://localhost:5000";
}

/**
 * Fetch with timeout to prevent hanging requests
 */
async function fetchWithTimeout(
  url: string | URL,
  options: RequestInit,
  timeout = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Make API requests with proper error handling and timeout
 */
export async function apiRequest(
  method: string,
  route: string,
  data?: unknown,
  timeout?: number
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);

  const res = await fetchWithTimeout(
    url,
    {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        "bypass-tunnel-reminder": "true",
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    },
    timeout
  );

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);

    const res = await fetchWithTimeout(url, {
      credentials: "include",
      headers: { "bypass-tunnel-reminder": "true" },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

/**
 * Get cache time based on query key pattern
 */
function getCacheTimeForQuery(queryKey: readonly unknown[]): number {
  const key = queryKey[0]?.toString() || "";

  // Static data - cache longer
  if (key.includes("achievements") || key.includes("templates") || key.includes("exercises")) {
    return CACHE_TIMES.STATIC;
  }

  // Profile data - medium cache
  if (key.includes("profile") || key.includes("user") || key.includes("settings")) {
    return CACHE_TIMES.PROFILE;
  }

  // Real-time data - short cache
  if (key.includes("leaderboard") || key.includes("notifications")) {
    return CACHE_TIMES.REALTIME;
  }

  // Default for dynamic data
  return CACHE_TIMES.DYNAMIC;
}

// Query cache with smart invalidation
const queryCache = new QueryCache({
  onError: (error, query) => {
    // Log errors in development
    if (__DEV__) {
      console.warn(`Query error [${query.queryKey}]:`, error);
    }
  },
});

// Mutation cache with optimistic update support
const mutationCache = new MutationCache({
  onSuccess: (_data, _variables, _context, mutation) => {
    // Auto-invalidate related queries after mutations
    const mutationKey = mutation.options.mutationKey?.[0]?.toString();

    if (mutationKey?.includes("workout")) {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
    }

    if (mutationKey?.includes("profile")) {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    }

    if (mutationKey?.includes("food") || mutationKey?.includes("macro")) {
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition"] });
    }
  },
  onError: (error) => {
    if (__DEV__) {
      console.warn("Mutation error:", error);
    }
  },
});

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      // Smart caching based on query type
      staleTime: CACHE_TIMES.DYNAMIC,
      gcTime: CACHE_TIMES.STATIC, // Keep in garbage collection longer
      // Retry with exponential backoff
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      // Background refetch settings
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: false,
      // Network mode - fetch even if offline (will use cache)
      networkMode: "offlineFirst",
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
      networkMode: "offlineFirst",
    },
  },
});

// Export cache times for use in individual queries
export { CACHE_TIMES };

// Helper to prefetch common data
export async function prefetchCommonData() {
  // Prefetch static data that's used across the app
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["/api/exercises"],
      staleTime: CACHE_TIMES.STATIC,
    }),
    queryClient.prefetchQuery({
      queryKey: ["/api/templates"],
      staleTime: CACHE_TIMES.STATIC,
    }),
  ]);
}
