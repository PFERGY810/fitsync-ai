import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';

export const validateBody = (schema: z.ZodSchema) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validatedData = schema.parse(body);
      c.set('validatedData', validatedData);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, { 
          message: 'Validation error', 
          cause: error.errors 
        });
      }
      throw new HTTPException(400, { message: 'Invalid request body' });
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return async (c: Context, next: Next) => {
    try {
      const query = c.req.query();
      const validatedData = schema.parse(query);
      c.set('validatedQuery', validatedData);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, { 
          message: 'Query validation error', 
          cause: error.errors 
        });
      }
      throw new HTTPException(400, { message: 'Invalid query parameters' });
    }
  };
};

// Common validation schemas
export const schemas = {
  physiqueAnalysis: z.object({
    poseType: z.string().min(1),
    imageUri: z.string().url(),
    notes: z.string().optional(),
  }),
  
  formAnalysis: z.object({
    exercise: z.string().min(1),
    videoUri: z.string().url(),
    userDescription: z.string().optional(),
  }),
  
  workoutPlan: z.object({
    goal: z.enum(['build_muscle', 'lose_weight', 'strength', 'endurance']),
    experience: z.enum(['beginner', 'intermediate', 'advanced']),
    daysPerWeek: z.number().min(1).max(7),
    timePerSession: z.number().min(15).max(180),
    equipment: z.array(z.string()),
    preferences: z.array(z.string()).optional(),
    limitations: z.array(z.string()).optional(),
  }),
  
  nutritionPlan: z.object({
    goal: z.enum(['build_muscle', 'lose_weight', 'maintain']),
    weight: z.number().positive(),
    height: z.number().positive(),
    age: z.number().min(13).max(120),
    gender: z.enum(['male', 'female']),
    activityLevel: z.enum(['sedentary', 'light', 'moderate', 'very_active', 'extra_active']),
    dietaryRestrictions: z.array(z.string()).optional(),
    preferences: z.array(z.string()).optional(),
  }),
  
  checkIn: z.object({
    photos: z.array(z.object({
      poseType: z.string(),
      imageUri: z.string().url(),
    })),
    metrics: z.object({
      weight: z.number().positive(),
      soreness: z.record(z.number().min(1).max(10)),
      energy: z.number().min(1).max(10),
      sleep: z.number().min(0).max(24),
      stress: z.number().min(1).max(10),
    }),
    notes: z.string(),
  }),
};