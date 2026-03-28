import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { registerAuthRoutes } from "./auth";
import { registerCoachRoutes } from "./coach";
import { registerFoodRoutes } from "./food";
import { registerLooksmaxxRoutes } from "./looksmaxx";
import { registerMedicalRoutes } from "./medical";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register all route modules
  registerAuthRoutes(app);
  registerCoachRoutes(app);
  registerFoodRoutes(app);
  registerLooksmaxxRoutes(app);
  registerMedicalRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
