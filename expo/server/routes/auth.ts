import type { Express } from "express";
import { db } from "../db";
import { eq, desc, and } from "drizzle-orm";
import {
  users,
  profiles,
  cycleInfo,
  macroTargets,
  dailyCheckIns,
  progressPhotos,
  generatedPrograms,
  workoutSessions,
  foodEntries,
  registerUserSchema,
  loginUserSchema,
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { encryptPayload, decryptPayload } from "../utils/encryption";
import { rateLimitMiddleware, validateProfile } from "../utils/validation";

export function registerAuthRoutes(app: Express) {
  // ============================================
  // AUTHENTICATION ENDPOINTS
  // ============================================

  // Register new user with email
  app.post("/api/auth/register", async (req, res) => {
    try {
      const parseResult = registerUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Invalid registration data",
          details: parseResult.error.issues,
        });
      }

      const { email, password, name } = parseResult.data;

      // Check if email already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (existingUser.length > 0) {
        return res.status(409).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          username: name || email.split("@")[0],
        })
        .returning();

      // Create empty profile for user
      const [newProfile] = await db
        .insert(profiles)
        .values({
          userId: newUser.id,
          name: name || null,
          onboardingCompleted: false,
        })
        .returning();

      console.log("New user registered:", {
        userId: newUser.id,
        email,
        profileId: newProfile.id,
      });

      res.json({
        success: true,
        user: { id: newUser.id, email: newUser.email },
        profile: { id: newProfile.id },
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  // Login user
  app.post("/api/auth/login", rateLimitMiddleware(60000, 5), async (req, res) => {
    try {
      const parseResult = loginUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid login data" });
      }

      const { email, password } = parseResult.data;

      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Get user's profile
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, user.id))
        .limit(1);

      console.log("User logged in:", {
        userId: user.id,
        email,
        profileId: profile?.id,
      });

      const decryptedProfile = profile
        ? {
            ...profile,
            medications: decryptPayload(profile.medications),
            medicationsWithDosage: decryptPayload(profile.medicationsWithDosage),
            allergies: decryptPayload(profile.allergies),
            healthConditions: decryptPayload(profile.healthConditions),
          }
        : null;
      res.json({
        success: true,
        user: { id: user.id, email: user.email },
        profile: decryptedProfile
          ? {
              ...decryptedProfile,
              sex: decryptedProfile.gender ?? (decryptedProfile as any).sex,
            }
          : null,
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Get user profile by userId
  app.get("/api/auth/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Get cycle info if exists
      const [userCycleInfo] = await db
        .select()
        .from(cycleInfo)
        .where(eq(cycleInfo.profileId, profile.id))
        .limit(1);

      // Get macro targets if exists
      const [userMacros] = await db
        .select()
        .from(macroTargets)
        .where(eq(macroTargets.profileId, profile.id))
        .limit(1);

      const profilePayload = profile
        ? {
            ...profile,
            sex: profile.gender ?? (profile as any).sex,
            medications: decryptPayload(profile.medications),
            medicationsWithDosage: decryptPayload(profile.medicationsWithDosage),
            allergies: decryptPayload(profile.allergies),
            healthConditions: decryptPayload(profile.healthConditions),
          }
        : null;
      const decryptedCycle = userCycleInfo
        ? { ...userCycleInfo, compounds: decryptPayload(userCycleInfo.compounds) }
        : null;
      res.json({
        profile: profilePayload,
        cycleInfo: decryptedCycle,
        macroTargets: userMacros || null,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Update user profile (save onboarding data)
  app.put("/api/auth/profile/:userId", validateProfile, async (req, res) => {
    try {
      const { userId } = req.params;
      const profileData = req.body;

      profileData.medications = encryptPayload(profileData.medications);
      profileData.medicationsWithDosage = encryptPayload(
        profileData.medicationsWithDosage,
      );
      profileData.allergies = encryptPayload(profileData.allergies);
      profileData.healthConditions = encryptPayload(profileData.healthConditions);

      console.log("=== SAVING USER PROFILE ===");
      console.log("UserId:", userId);
      console.log(
        "Profile data received:",
        JSON.stringify(profileData, null, 2),
      );

      // Get user's profile
      let [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);

      if (!profile) {
        // Create profile if doesn't exist
        [profile] = await db
          .insert(profiles)
          .values({
            userId,
            name: profileData.name,
            age: profileData.age,
            height: profileData.height,
            heightUnit: profileData.heightUnit,
            weight: profileData.weight,
            weightUnit: profileData.weightUnit,
            gender: profileData.sex,
            goal: profileData.goal,
            experienceLevel: profileData.experienceLevel,
            trainingDaysPerWeek: profileData.trainingProgram?.daysPerWeek,
            trainingTemplate: profileData.trainingProgram?.templateName,
            trainingProgram: profileData.trainingProgram,
            targetWeight: profileData.targetWeight,
            targetTimeframe: profileData.targetTimeframe,
            medications: profileData.medications,
            medicationsWithDosage: profileData.medicationsWithDosage,
            allergies: profileData.allergies,
            healthConditions: profileData.healthConditions,
            bloodPressureMedication: profileData.bloodPressureMedication,
            hasDoctor: profileData.hasDoctor,
            strengthGoals: profileData.strengthGoals,
            budgetTier: profileData.budgetTier,
            budgetAmount: profileData.budgetAmount,
            zipCode: profileData.zipCode,
            locationCity: profileData.locationCity,
            locationState: profileData.locationState,
            locationCountry: profileData.locationCountry,
            physiqueAnalysis: profileData.physiqueAnalysis,
            compoundResearch: profileData.compoundResearch,
            aiMemory: profileData.aiMemory,
            onboardingCompleted: profileData.onboardingComplete || false,
          })
          .returning();
      } else {
        // Update existing profile
        [profile] = await db
          .update(profiles)
          .set({
            name: profileData.name || profile.name,
            age: profileData.age ?? profile.age,
            height: profileData.height ?? profile.height,
            heightUnit: profileData.heightUnit || profile.heightUnit,
            weight: profileData.weight ?? profile.weight,
            weightUnit: profileData.weightUnit || profile.weightUnit,
            gender: profileData.sex || profile.gender,
            goal: profileData.goal || profile.goal,
            experienceLevel:
              profileData.experienceLevel || profile.experienceLevel,
            trainingDaysPerWeek:
              profileData.trainingProgram?.daysPerWeek ??
              profile.trainingDaysPerWeek,
            trainingTemplate:
              profileData.trainingProgram?.templateName ||
              profile.trainingTemplate,
            trainingProgram:
              profileData.trainingProgram ?? profile.trainingProgram,
            targetWeight: profileData.targetWeight ?? profile.targetWeight,
            targetTimeframe:
              profileData.targetTimeframe ?? profile.targetTimeframe,
            medications: profileData.medications ?? profile.medications,
            medicationsWithDosage:
              profileData.medicationsWithDosage ??
              profile.medicationsWithDosage,
            allergies: profileData.allergies ?? profile.allergies,
            healthConditions:
              profileData.healthConditions ?? profile.healthConditions,
            bloodPressureMedication:
              profileData.bloodPressureMedication ??
              profile.bloodPressureMedication,
            hasDoctor: profileData.hasDoctor ?? profile.hasDoctor,
            strengthGoals: profileData.strengthGoals ?? profile.strengthGoals,
            budgetTier: profileData.budgetTier ?? profile.budgetTier,
            budgetAmount: profileData.budgetAmount ?? profile.budgetAmount,
            zipCode: profileData.zipCode ?? profile.zipCode,
            locationCity: profileData.locationCity ?? profile.locationCity,
            locationState: profileData.locationState ?? profile.locationState,
            locationCountry:
              profileData.locationCountry ?? profile.locationCountry,
            physiqueAnalysis:
              profileData.physiqueAnalysis ?? profile.physiqueAnalysis,
            compoundResearch:
              profileData.compoundResearch ?? profile.compoundResearch,
            aiMemory: profileData.aiMemory ?? profile.aiMemory,
            onboardingCompleted:
              profileData.onboardingComplete ?? profile.onboardingCompleted,
            updatedAt: new Date(),
          })
          .where(eq(profiles.userId, userId))
          .returning();
      }

      // Handle cycle info if provided
      if (profileData.isOnCycle && profileData.cycleInfo) {
        const existingCycleInfo = await db
          .select()
          .from(cycleInfo)
          .where(eq(cycleInfo.profileId, profile.id))
          .limit(1);

        if (existingCycleInfo.length > 0) {
          await db
            .update(cycleInfo)
            .set({
              isEnhanced: true,
              weeksIn: profileData.cycleInfo.weeksIn,
              totalWeeks: profileData.cycleInfo.totalWeeks,
              compounds: encryptPayload(profileData.cycleInfo.compounds),
              updatedAt: new Date(),
            })
            .where(eq(cycleInfo.profileId, profile.id));
        } else {
          await db.insert(cycleInfo).values({
            profileId: profile.id,
            isEnhanced: true,
            weeksIn: profileData.cycleInfo.weeksIn,
            totalWeeks: profileData.cycleInfo.totalWeeks,
            compounds: encryptPayload(profileData.cycleInfo.compounds),
          });
        }
      }

      // Handle calculated macros if provided
      if (profileData.calculatedMacros) {
        const existingMacros = await db
          .select()
          .from(macroTargets)
          .where(eq(macroTargets.profileId, profile.id))
          .limit(1);

        if (existingMacros.length > 0) {
          await db
            .update(macroTargets)
            .set({
              calories: profileData.calculatedMacros.calories,
              protein: profileData.calculatedMacros.protein,
              carbs: profileData.calculatedMacros.carbs,
              fat: profileData.calculatedMacros.fat,
              updatedAt: new Date(),
            })
            .where(eq(macroTargets.profileId, profile.id));
        } else {
          await db.insert(macroTargets).values({
            profileId: profile.id,
            calories: profileData.calculatedMacros.calories,
            protein: profileData.calculatedMacros.protein,
            carbs: profileData.calculatedMacros.carbs,
            fat: profileData.calculatedMacros.fat,
          });
        }
      }

      console.log("Profile saved successfully:", profile.id);
      const decryptedProfile = {
        ...profile,
        medications: decryptPayload(profile.medications),
        medicationsWithDosage: decryptPayload(profile.medicationsWithDosage),
        allergies: decryptPayload(profile.allergies),
        healthConditions: decryptPayload(profile.healthConditions),
      };
      res.json({ success: true, profile: decryptedProfile });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // ============================================
  // DATABASE CRUD ENDPOINTS
  // ============================================

  // Reset all data for fresh onboarding
  app.post("/api/reset", async (req, res) => {
    try {
      await db.delete(foodEntries);
      await db.delete(workoutSessions);
      await db.delete(generatedPrograms);
      await db.delete(progressPhotos);
      await db.delete(dailyCheckIns);
      await db.delete(macroTargets);
      await db.delete(cycleInfo);
      await db.delete(profiles);
      console.log("All data reset successfully");
      res.json({ success: true, message: "All data cleared for fresh start" });
    } catch (error) {
      console.error("Error resetting data:", error);
      res.status(500).json({ error: "Failed to reset data" });
    }
  });

  // Create or update profile
  app.post("/api/profile", async (req, res) => {
    try {
      const profileData = req.body;
      console.log("Saving profile:", JSON.stringify(profileData, null, 2));

      // Extract nested data that should be saved to separate tables
      const {
        calculatedMacros,
        cycleInfo: cycleData,
        progressPhotos: photosData,
        ...coreProfileData
      } = profileData;
      const mappedProfileData = { ...coreProfileData };

      mappedProfileData.medications = encryptPayload(
        mappedProfileData.medications,
      );
      mappedProfileData.medicationsWithDosage = encryptPayload(
        mappedProfileData.medicationsWithDosage,
      );
      mappedProfileData.allergies = encryptPayload(mappedProfileData.allergies);
      mappedProfileData.healthConditions = encryptPayload(
        mappedProfileData.healthConditions,
      );

      // Map field names for compatibility (frontend uses onboardingComplete, schema uses onboardingCompleted)
      if (mappedProfileData.onboardingComplete !== undefined) {
        mappedProfileData.onboardingCompleted =
          mappedProfileData.onboardingComplete;
        delete mappedProfileData.onboardingComplete;
      }

      if (mappedProfileData.sex !== undefined) {
        mappedProfileData.gender = mappedProfileData.sex;
        delete mappedProfileData.sex;
      }

      // Convert string dates to Date objects for Drizzle/Postgres
      if (
        mappedProfileData.createdAt &&
        typeof mappedProfileData.createdAt === "string"
      ) {
        mappedProfileData.createdAt = new Date(mappedProfileData.createdAt);
      }
      if (
        mappedProfileData.updatedAt &&
        typeof mappedProfileData.updatedAt === "string"
      ) {
        mappedProfileData.updatedAt = new Date(mappedProfileData.updatedAt);
      }

      if (mappedProfileData.trainingProgram) {
        mappedProfileData.trainingDaysPerWeek =
          mappedProfileData.trainingProgram?.daysPerWeek;
        mappedProfileData.trainingTemplate =
          mappedProfileData.trainingProgram?.templateName;
      }

      const existingProfiles = await db.select().from(profiles).limit(1);
      let profileId: string;
      let savedProfile: any;

      if (existingProfiles.length > 0) {
        profileId = existingProfiles[0].id;
        const updated = await db
          .update(profiles)
          .set({
            ...mappedProfileData,
            updatedAt: new Date(),
          })
          .where(eq(profiles.id, profileId))
          .returning();
        savedProfile = updated[0];
      } else {
        // Ensure createdAt is set properly
        mappedProfileData.createdAt = mappedProfileData.createdAt || new Date();
        const created = await db
          .insert(profiles)
          .values(mappedProfileData)
          .returning();
        savedProfile = created[0];
        profileId = savedProfile.id;
      }

      // Save calculatedMacros to macroTargets table
      if (calculatedMacros) {
        const existingMacros = await db
          .select()
          .from(macroTargets)
          .where(eq(macroTargets.profileId, profileId))
          .limit(1);
        if (existingMacros.length > 0) {
          await db
            .update(macroTargets)
            .set({
              calories: calculatedMacros.calories,
              protein: calculatedMacros.protein,
              carbs: calculatedMacros.carbs,
              fat: calculatedMacros.fat,
              updatedAt: new Date(),
            })
            .where(eq(macroTargets.profileId, profileId));
        } else {
          await db.insert(macroTargets).values({
            profileId,
            calories: calculatedMacros.calories,
            protein: calculatedMacros.protein,
            carbs: calculatedMacros.carbs,
            fat: calculatedMacros.fat,
          });
        }
      }

      // Save cycle info if provided
      if (profileData.isOnCycle && cycleData) {
        const existingCycle = await db
          .select()
          .from(cycleInfo)
          .where(eq(cycleInfo.profileId, profileId))
          .limit(1);
        if (existingCycle.length > 0) {
          await db
            .update(cycleInfo)
            .set({
              isEnhanced: true,
              weeksIn: cycleData.weeksIn,
              totalWeeks: cycleData.totalWeeks,
              compounds: encryptPayload(cycleData.compounds),
              updatedAt: new Date(),
            })
            .where(eq(cycleInfo.profileId, profileId));
        } else {
          await db.insert(cycleInfo).values({
            profileId,
            isEnhanced: true,
            weeksIn: cycleData.weeksIn,
            totalWeeks: cycleData.totalWeeks,
            compounds: encryptPayload(cycleData.compounds),
          });
        }
      }

      // Save progress photos if provided
      if (photosData && typeof photosData === "object") {
        const photoEntries = [
          { type: "front", data: photosData.front },
          { type: "side", data: photosData.side },
          { type: "back", data: photosData.back },
          { type: "legs", data: photosData.legs },
        ].filter((entry) => entry.data);

        for (const entry of photoEntries) {
          await db.insert(progressPhotos).values({
            profileId,
            photoType: entry.type,
            photoData: encryptPayload(entry.data),
            dateTaken: photosData.dateTaken || new Date().toISOString(),
          });
        }
      }

      const decryptedProfile = {
        ...savedProfile,
        medications: decryptPayload(savedProfile.medications),
        medicationsWithDosage: decryptPayload(savedProfile.medicationsWithDosage),
        allergies: decryptPayload(savedProfile.allergies),
        healthConditions: decryptPayload(savedProfile.healthConditions),
      };
      res.json({ ...decryptedProfile, calculatedMacros });
    } catch (error) {
      console.error("Error saving profile:", error);
      res.status(500).json({ error: "Failed to save profile" });
    }
  });

  // Get profile
  app.get("/api/profile", async (req, res) => {
    try {
      const result = await db.select().from(profiles).limit(1);
      if (result.length > 0) {
        const profile = result[0];
        const cycle = await db
          .select()
          .from(cycleInfo)
          .where(eq(cycleInfo.profileId, profile.id))
          .limit(1);
        const macros = await db
          .select()
          .from(macroTargets)
          .where(eq(macroTargets.profileId, profile.id))
          .limit(1);
        const photos = await db
          .select()
          .from(progressPhotos)
          .where(eq(progressPhotos.profileId, profile.id))
          .orderBy(desc(progressPhotos.createdAt));

        // Map macros to calculatedMacros for frontend compatibility
        const calculatedMacros = macros[0]
          ? {
              calories: macros[0].calories,
              protein: macros[0].protein,
              carbs: macros[0].carbs,
              fat: macros[0].fat,
            }
          : null;

        const decryptedProfile = {
          ...profile,
          medications: decryptPayload(profile.medications),
          medicationsWithDosage: decryptPayload(profile.medicationsWithDosage),
          allergies: decryptPayload(profile.allergies),
          healthConditions: decryptPayload(profile.healthConditions),
        };
        const decryptedCycle = cycle[0]
          ? { ...cycle[0], compounds: decryptPayload(cycle[0].compounds) }
          : null;
        const decryptedPhotos = photos.map((photo) => ({
          ...photo,
          photoData: decryptPayload(photo.photoData),
        }));

        res.json({
          ...decryptedProfile,
          sex: decryptedProfile.gender ?? (decryptedProfile as any).sex,
          cycleInfo: decryptedCycle,
          macros: macros[0] || null,
          calculatedMacros,
          progressPhotos: decryptedPhotos,
        });
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Export user data (GDPR)
  app.get("/api/profile/:profileId/export", async (req, res) => {
    try {
      const { profileId } = req.params;
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, profileId))
        .limit(1);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const [cycle] = await db
        .select()
        .from(cycleInfo)
        .where(eq(cycleInfo.profileId, profileId))
        .limit(1);
      const macros = await db
        .select()
        .from(macroTargets)
        .where(eq(macroTargets.profileId, profileId));
      const checkIns = await db
        .select()
        .from(dailyCheckIns)
        .where(eq(dailyCheckIns.profileId, profileId));
      const photos = await db
        .select()
        .from(progressPhotos)
        .where(eq(progressPhotos.profileId, profileId));
      const programs = await db
        .select()
        .from(generatedPrograms)
        .where(eq(generatedPrograms.profileId, profileId));
      const workouts = await db
        .select()
        .from(workoutSessions)
        .where(eq(workoutSessions.profileId, profileId));
      const foods = await db
        .select()
        .from(foodEntries)
        .where(eq(foodEntries.profileId, profileId));

      const payload = {
        profile: {
          ...profile,
          medications: decryptPayload(profile.medications),
          medicationsWithDosage: decryptPayload(profile.medicationsWithDosage),
          allergies: decryptPayload(profile.allergies),
          healthConditions: decryptPayload(profile.healthConditions),
        },
        cycleInfo: cycle
          ? { ...cycle, compounds: decryptPayload(cycle.compounds) }
          : null,
        macroTargets: macros,
        dailyCheckIns: checkIns,
        progressPhotos: photos.map((photo) => ({
          ...photo,
          photoData: decryptPayload(photo.photoData),
        })),
        generatedPrograms: programs,
        workoutSessions: workouts,
        foodEntries: foods,
      };

      res.json(payload);
    } catch (error) {
      console.error("Error exporting profile:", error);
      res.status(500).json({ error: "Failed to export profile" });
    }
  });

  // Delete user data (GDPR)
  app.delete("/api/profile/:profileId", async (req, res) => {
    try {
      const { profileId } = req.params;
      await db.delete(cycleInfo).where(eq(cycleInfo.profileId, profileId));
      await db.delete(macroTargets).where(eq(macroTargets.profileId, profileId));
      await db.delete(dailyCheckIns).where(eq(dailyCheckIns.profileId, profileId));
      await db.delete(progressPhotos).where(eq(progressPhotos.profileId, profileId));
      await db.delete(generatedPrograms).where(eq(generatedPrograms.profileId, profileId));
      await db.delete(workoutSessions).where(eq(workoutSessions.profileId, profileId));
      await db.delete(foodEntries).where(eq(foodEntries.profileId, profileId));
      await db.delete(profiles).where(eq(profiles.id, profileId));

      res.json({ success: true, message: "Profile deleted" });
    } catch (error) {
      console.error("Error deleting profile:", error);
      res.status(500).json({ error: "Failed to delete profile" });
    }
  });

  // Delete/reset all user data
  app.delete("/api/profile", async (req, res) => {
    try {
      if (process.env.NODE_ENV !== "development") {
        return res.status(403).json({ error: "Bulk reset disabled" });
      }
      // Get all profiles
      const allProfiles = await db.select().from(profiles);

      for (const profile of allProfiles) {
        // Delete related data
        await db.delete(cycleInfo).where(eq(cycleInfo.profileId, profile.id));
        await db
          .delete(macroTargets)
          .where(eq(macroTargets.profileId, profile.id));
        await db
          .delete(dailyCheckIns)
          .where(eq(dailyCheckIns.profileId, profile.id));
        await db
          .delete(progressPhotos)
          .where(eq(progressPhotos.profileId, profile.id));
        await db
          .delete(generatedPrograms)
          .where(eq(generatedPrograms.profileId, profile.id));
        await db
          .delete(workoutSessions)
          .where(eq(workoutSessions.profileId, profile.id));
        await db
          .delete(foodEntries)
          .where(eq(foodEntries.profileId, profile.id));
      }

      // Delete all profiles
      await db.delete(profiles);

      res.json({ success: true, message: "All data reset successfully" });
    } catch (error) {
      console.error("Error resetting data:", error);
      res.status(500).json({ error: "Failed to reset data" });
    }
  });

  // Save cycle info
  app.post("/api/cycle-info", async (req, res) => {
    try {
      const { profileId, ...cycleData } = req.body;
      console.log("Saving cycle info:", JSON.stringify(cycleData, null, 2));
      const encryptedCycleData = {
        ...cycleData,
        compounds: encryptPayload(cycleData.compounds),
      };

      const existing = await db
        .select()
        .from(cycleInfo)
        .where(eq(cycleInfo.profileId, profileId))
        .limit(1);

      if (existing.length > 0) {
        const updated = await db
          .update(cycleInfo)
          .set({ ...encryptedCycleData, updatedAt: new Date() })
          .where(eq(cycleInfo.id, existing[0].id))
          .returning();
        res.json({
          ...updated[0],
          compounds: decryptPayload(updated[0].compounds),
        });
      } else {
        const created = await db
          .insert(cycleInfo)
          .values({ profileId, ...encryptedCycleData })
          .returning();
        res.json({
          ...created[0],
          compounds: decryptPayload(created[0].compounds),
        });
      }
    } catch (error) {
      console.error("Error saving cycle info:", error);
      res.status(500).json({ error: "Failed to save cycle info" });
    }
  });

  // Save macro targets
  app.post("/api/macros", async (req, res) => {
    try {
      const { profileId, ...macroData } = req.body;
      console.log("Saving macros:", JSON.stringify(macroData, null, 2));

      const existing = await db
        .select()
        .from(macroTargets)
        .where(eq(macroTargets.profileId, profileId))
        .limit(1);

      if (existing.length > 0) {
        const updated = await db
          .update(macroTargets)
          .set({ ...macroData, updatedAt: new Date() })
          .where(eq(macroTargets.id, existing[0].id))
          .returning();
        res.json(updated[0]);
      } else {
        const created = await db
          .insert(macroTargets)
          .values({ profileId, ...macroData })
          .returning();
        res.json(created[0]);
      }
    } catch (error) {
      console.error("Error saving macros:", error);
      res.status(500).json({ error: "Failed to save macros" });
    }
  });

  // Upload progress photo
  app.post("/api/photos", async (req, res) => {
    try {
      const { profileId, photoType, photoData, dateTaken, notes } = req.body;
      console.log(`Saving ${photoType} photo for profile ${profileId}`);

      const created = await db
        .insert(progressPhotos)
        .values({
          profileId,
          photoType,
          photoData: encryptPayload(photoData),
          dateTaken: dateTaken || new Date().toISOString(),
          notes,
        })
        .returning();

      res.json({
        ...created[0],
        photoData: decryptPayload(created[0].photoData),
      });
    } catch (error) {
      console.error("Error saving photo:", error);
      res.status(500).json({ error: "Failed to save photo" });
    }
  });

  // Get progress photos
  app.get("/api/photos/:profileId", async (req, res) => {
    try {
      const { profileId } = req.params;
      const photos = await db
        .select()
        .from(progressPhotos)
        .where(eq(progressPhotos.profileId, profileId))
        .orderBy(desc(progressPhotos.createdAt));
      res.json(
        photos.map((photo) => ({
          ...photo,
          photoData: decryptPayload(photo.photoData),
        })),
      );
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ error: "Failed to fetch photos" });
    }
  });

  // Save daily check-in
  app.post("/api/check-in", async (req, res) => {
    try {
      const checkInData = req.body;
      console.log("Saving check-in:", JSON.stringify(checkInData, null, 2));

      const existing = await db
        .select()
        .from(dailyCheckIns)
        .where(
          and(
            eq(dailyCheckIns.profileId, checkInData.profileId),
            eq(dailyCheckIns.date, checkInData.date),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        const updated = await db
          .update(dailyCheckIns)
          .set(checkInData)
          .where(eq(dailyCheckIns.id, existing[0].id))
          .returning();
        res.json(updated[0]);
      } else {
        const created = await db
          .insert(dailyCheckIns)
          .values(checkInData)
          .returning();
        res.json(created[0]);
      }
    } catch (error) {
      console.error("Error saving check-in:", error);
      res.status(500).json({ error: "Failed to save check-in" });
    }
  });

  // Get today's check-in
  app.get("/api/check-in/:profileId/:date", async (req, res) => {
    try {
      const { profileId, date } = req.params;
      const checkIn = await db
        .select()
        .from(dailyCheckIns)
        .where(
          and(
            eq(dailyCheckIns.profileId, profileId),
            eq(dailyCheckIns.date, date),
          ),
        )
        .limit(1);
      res.json(checkIn[0] || null);
    } catch (error) {
      console.error("Error fetching check-in:", error);
      res.status(500).json({ error: "Failed to fetch check-in" });
    }
  });

  // Save generated program
  app.post("/api/program", async (req, res) => {
    try {
      const programData = req.body;
      console.log("Saving generated program:", programData.programName);

      // Deactivate any existing programs
      if (programData.profileId) {
        await db
          .update(generatedPrograms)
          .set({ isActive: false })
          .where(eq(generatedPrograms.profileId, programData.profileId));
      }

      const created = await db
        .insert(generatedPrograms)
        .values({
          ...programData,
          isActive: true,
        })
        .returning();

      res.json(created[0]);
    } catch (error) {
      console.error("Error saving program:", error);
      res.status(500).json({ error: "Failed to save program" });
    }
  });

  // Get active program
  app.get("/api/program/:profileId", async (req, res) => {
    try {
      const { profileId } = req.params;
      const program = await db
        .select()
        .from(generatedPrograms)
        .where(
          and(
            eq(generatedPrograms.profileId, profileId),
            eq(generatedPrograms.isActive, true),
          ),
        )
        .limit(1);
      res.json(program[0] || null);
    } catch (error) {
      console.error("Error fetching program:", error);
      res.status(500).json({ error: "Failed to fetch program" });
    }
  });
}
