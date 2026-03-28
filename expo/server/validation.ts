import { z } from "zod";

export const profileSchema = z
  .object({
    age: z.number().min(16).max(80),
    height: z.number().positive(),
    weight: z.number().positive(),
    sex: z.enum(["male", "female"]).optional(),
    goal: z.enum(["cut", "bulk", "recomp", "maintain"]).optional(),
    experienceLevel: z
      .enum(["beginner", "intermediate", "advanced", "elite"])
      .optional(),
  })
  .partial();

export function validateProfilePayload(profile: unknown) {
  return profileSchema.safeParse(profile);
}
