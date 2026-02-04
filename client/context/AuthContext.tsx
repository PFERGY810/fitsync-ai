import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from "@/lib/query-client";

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  userId?: string;
  name?: string;
  age?: number;
  height?: number;
  heightUnit?: string;
  weight?: number;
  weightUnit?: string;
  sex?: string;
  gender?: string;
  goal?: string;
  experienceLevel?: string;
  trainingDaysPerWeek?: number;
  trainingTemplate?: string;
  trainingProgram?: any;
  targetWeight?: number;
  targetTimeframe?: number;
  medications?: string[];
  medicationsWithDosage?: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
  }>;
  allergies?: string[];
  healthConditions?: string[];
  bloodPressureMedication?: boolean;
  hasDoctor?: boolean;
  strengthGoals?: {
    bench: { current: number; target: number };
    squat: { current: number; target: number };
    deadlift: { current: number; target: number };
    ohp: { current: number; target: number };
    pullups: { current: number; target: number };
  };
  budgetTier?: string;
  budgetAmount?: number;
  zipCode?: string;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  physiqueAnalysis?: any;
  compoundResearch?: any;
  aiMemory?: Record<string, any>;
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<Profile>) => void;
  saveProfileToServer: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AUTH_STORAGE_KEY = "@fitsync_auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const { user: storedUser, profile: storedProfile } =
          JSON.parse(storedAuth);
        setUser(storedUser);
        setProfile(storedProfile);

        // Set loading false immediately after local load for fast startup
        setIsLoading(false);

        // Refresh from server in background (non-blocking) with timeout
        if (storedUser?.id) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          try {
            const response = await fetch(
              new URL(`/api/auth/profile/${storedUser.id}`, getApiUrl()).toString(),
              { signal: controller.signal, headers: { "bypass-tunnel-reminder": "true" } }
            );
            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              if (data.profile) {
                setProfile(data.profile);
                // Update stored auth with refreshed profile
                await AsyncStorage.setItem(
                  AUTH_STORAGE_KEY,
                  JSON.stringify({
                    user: storedUser,
                    profile: data.profile,
                  }),
                );
              }
            }
          } catch (refreshError: any) {
            clearTimeout(timeoutId);
            console.log("Profile refresh skipped, using cached data");
          }
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
      setIsLoading(false);
    }
  };

  const refreshProfileFromServer = async (userId: string) => {
    try {
      const response = await fetch(
        new URL(`/api/auth/profile/${userId}`, getApiUrl()).toString(),
        { headers: { "bypass-tunnel-reminder": "true" } }
      );
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          if (data.profile) {
            setProfile(data.profile);
          }
        }
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await refreshProfileFromServer(user.id);
    }
  }, [user]);

  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch(
          new URL("/api/auth/login", getApiUrl()).toString(),
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "bypass-tunnel-reminder": "true" },
            body: JSON.stringify({ email, password }),
          },
        );

        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
          const errorMessage = data?.error || (await response.text()) || "Login failed";
          return { success: false, error: errorMessage };
        }

        setUser(data.user);
        setProfile(data.profile);

        await AsyncStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            user: data.user,
            profile: data.profile,
          }),
        );

        return { success: true };
      } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "Network error. Please try again." };
      }
    },
    [],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      name?: string,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch(
          new URL("/api/auth/register", getApiUrl()).toString(),
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "bypass-tunnel-reminder": "true" },
            body: JSON.stringify({ email, password, name }),
          },
        );

        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
          const errorMessage = data?.error || (await response.text()) || "Registration failed";
          return { success: false, error: errorMessage };
        }

        setUser(data.user);
        setProfile(data.profile);

        await AsyncStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            user: data.user,
            profile: data.profile,
          }),
        );

        return { success: true };
      } catch (error) {
        console.error("Registration error:", error);
        return { success: false, error: "Network error. Please try again." };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    setUser(null);
    setProfile(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const updateProfileData = useCallback((data: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...data } : (data as Profile)));
  }, []);

  const saveProfileToServer = useCallback(async () => {
    if (!user?.id || !profile) return;

    try {
      const response = await fetch(
        new URL(`/api/auth/profile/${user.id}`, getApiUrl()).toString(),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", "bypass-tunnel-reminder": "true" },
          body: JSON.stringify(profile),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);

        await AsyncStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            user,
            profile: data.profile,
          }),
        );
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  }, [user, profile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfileData,
        saveProfileToServer,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
