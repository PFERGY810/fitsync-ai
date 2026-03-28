import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

// Photo validation schemas
export const photoSchema = z.string().url().or(z.string().startsWith("data:image"));

export const photosSchema = z.object({
  front: photoSchema.optional(),
  side: photoSchema.optional(),
  back: photoSchema.optional(),
  legs: photoSchema.optional(),
}).refine(
  (data) => data.front || data.side || data.back || data.legs,
  { message: "At least one photo is required" }
);

// Profile validation schema
export const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  age: z.number().int().min(13).max(120).optional(),
  height: z.number().positive().max(300).optional(),
  weight: z.number().positive().max(500).optional(),
  sex: z.enum(["male", "female", "other"]).optional(),
  goal: z.enum(["bulk", "cut", "recomp", "maintain"]).optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
});

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(
  windowMs: number = 60000, // 1 minute
  maxRequests: number = 10,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        error: "Too many requests",
        message: `Rate limit exceeded. Please try again in ${Math.ceil((record.resetTime - now) / 1000)} seconds.`,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    record.count++;
    next();
  };
}

// Photo validation middleware
export function validatePhotos(req: Request, res: Response, next: NextFunction) {
  try {
    const { photos } = req.body;

    if (!photos) {
      return res.status(400).json({
        error: "Missing photos",
        message: "Photos are required for analysis",
      });
    }

    // Validate photo URLs/data URIs
    const validationResult = photosSchema.safeParse(photos);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Invalid photo format",
        details: validationResult.error.errors,
      });
    }

    // Validate photo size and format (for base64 data URIs)
    const photoEntries = Object.entries(photos).filter(([_, value]) => value);
    const allowedFormats = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const [type, photo] of photoEntries) {
      if (typeof photo === "string" && photo.startsWith("data:image")) {
        // Extract format from data URI
        const formatMatch = photo.match(/data:image\/([^;]+)/);
        const format = formatMatch ? formatMatch[1].toLowerCase() : null;
        
        // Validate format
        if (!format || !allowedFormats.some(f => f.includes(format))) {
          return res.status(400).json({
            error: "Invalid photo format",
            message: `${type} photo must be JPEG or PNG format`,
            allowedFormats: ["JPEG", "PNG"],
          });
        }

        // Base64 data URI - check size (max 10MB)
        const base64Data = photo.split(",")[1];
        if (base64Data) {
          const sizeInBytes = (base64Data.length * 3) / 4;
          if (sizeInBytes > maxSize) {
            return res.status(400).json({
              error: "Photo too large",
              message: `${type} photo exceeds 10MB limit (${(sizeInBytes / 1024 / 1024).toFixed(2)}MB)`,
              maxSize: "10MB",
            });
          }
        }
      } else if (typeof photo === "string" && photo.startsWith("http")) {
        // URL validation - basic check
        try {
          new URL(photo);
        } catch {
          return res.status(400).json({
            error: "Invalid photo URL",
            message: `${type} photo URL is invalid`,
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error("Photo validation error:", error);
    res.status(500).json({ error: "Photo validation failed" });
  }
}

// Profile validation middleware
export function validateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const validationResult = profileSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Invalid profile data",
        details: validationResult.error.errors,
      });
    }
    next();
  } catch (error) {
    console.error("Profile validation error:", error);
    res.status(500).json({ error: "Profile validation failed" });
  }
}

// Sanitize AI response to prevent XSS
export function sanitizeAiResponse(response: any): any {
  if (typeof response === "string") {
    // Remove potentially dangerous HTML/script tags
    return response
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "");
  }

  if (Array.isArray(response)) {
    return response.map(sanitizeAiResponse);
  }

  if (response && typeof response === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(response)) {
      sanitized[key] = sanitizeAiResponse(value);
    }
    return sanitized;
  }

  return response;
}
