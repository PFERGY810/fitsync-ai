import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { startAnalysisJobWorker } from "./jobs/analysis-jobs";
import * as fs from "fs";
import * as path from "path";

const app = express();
const log = console.log;

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function setupCors(app: express.Application) {
  app.use((req, res, next) => {
    const origin = req.header("origin");
    const isDev = process.env.NODE_ENV === "development";

    // Allow localhost and local network origins for development
    const isLocalNetwork = origin && (
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      origin.startsWith("http://192.168.") ||
      origin.startsWith("http://10.") ||
      origin.startsWith("http://172.")
    );

    // Allow configured domains from environment
    const allowedDomains = process.env.ALLOWED_ORIGINS?.split(",") || [];
    const isAllowedDomain = origin && allowedDomains.some((d: string) => origin.includes(d.trim()));

    // Mobile apps (React Native/Expo) often don't send Origin header
    // In development, allow requests without origin (mobile app direct calls)
    const allowNoOrigin = isDev && !origin;

    if (allowNoOrigin || isLocalNetwork || isAllowedDomain) {
      // Set origin to * for mobile apps without origin, or echo the origin
      res.header("Access-Control-Allow-Origin", origin || "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, bypass-tunnel-reminder");
      res.header("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });
}

function setupBodyParsing(app: express.Application) {
  app.use(
    express.json({
      limit: "50mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false, limit: "50mb" }));
}

function setupRequestLogging(app: express.Application) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      if (!path.startsWith("/api")) return;

      const duration = Date.now() - start;

      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    });

    next();
  });
}

function getAppName(): string {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveExpoManifest(platform: string, res: Response) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json",
  );

  if (!fs.existsSync(manifestPath)) {
    return res
      .status(404)
      .json({ error: `Manifest not found for platform: ${platform}` });
  }

  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}

function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName,
}: {
  req: Request;
  res: Response;
  landingPageTemplate: string;
  appName: string;
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;

  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function configureExpoAndLanding(app: express.Application) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html",
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();

  log("Serving static Expo files with dynamic manifest routing");

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }

    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }

    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName,
      });
    }

    next();
  });

  app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app.use(express.static(path.resolve(process.cwd(), "static-build")));

  log("Expo routing: Checking expo-platform header on / and /manifest");
}

function setupErrorHandler(app: express.Application) {
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const error = err as {
      status?: number;
      statusCode?: number;
      message?: string;
    };

    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });
}

interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Critical: OpenAI API key (required for core functionality)
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey || openaiKey === "missing" || openaiKey.trim() === "") {
    errors.push("OPENAI_API_KEY is not set. AI features will not work.");
  } else if (!openaiKey.startsWith("sk-")) {
    warnings.push("OPENAI_API_KEY format looks incorrect. Should start with 'sk-'.");
  } else {
    log("OpenAI API key configured.");
  }
  
  // Critical: Database URL (required for data persistence)
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.trim() === "") {
    errors.push("DATABASE_URL is not set. Database operations will fail.");
  } else {
    log("Database URL configured.");
  }
  
  // Optional: SerpAPI key (for gym equipment search)
  const serpApiKey = process.env.SERP_API_KEY;
  if (!serpApiKey || serpApiKey.trim() === "") {
    warnings.push("SERP_API_KEY is not set. Gym equipment search will use AI inference only.");
  }
  
  // Port configuration
  const port = process.env.PORT;
  if (!port) {
    log("PORT not set, defaulting to 5000.");
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

async function tryListenOnPort(server: ReturnType<typeof import("http").createServer>, port: number, maxAttempts = 3): Promise<number> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const currentPort = port + attempt;
    try {
      await new Promise<void>((resolve, reject) => {
        server.once("error", (err: NodeJS.ErrnoException) => {
          if (err.code === "EADDRINUSE") {
            log(`Port ${currentPort} is in use, trying ${currentPort + 1}...`);
            server.removeAllListeners("listening");
            reject(err);
          } else {
            reject(err);
          }
        });
        server.once("listening", () => {
          server.removeAllListeners("error");
          resolve();
        });
        server.listen(currentPort, "0.0.0.0");
      });
      return currentPort;
    } catch (err) {
      if (attempt === maxAttempts - 1) {
        throw new Error(`Could not find an available port after ${maxAttempts} attempts starting from ${port}`);
      }
    }
  }
  throw new Error("Failed to start server");
}

(async () => {
  log("\n========== FITSYNC AI SERVER STARTUP ==========\n");
  
  // Validate environment on startup
  const { valid, errors, warnings } = validateEnvironment();
  
  if (errors.length > 0) {
    log("========== CRITICAL ERRORS ==========");
    errors.forEach((e) => log(`  ERROR: ${e}`));
    log("=====================================\n");
  }
  
  if (warnings.length > 0) {
    log("========== WARNINGS ==========");
    warnings.forEach((w) => log(`  WARNING: ${w}`));
    log("==============================\n");
  }
  
  if (valid) {
    log("Environment validation passed.\n");
  } else {
    log("Server starting with configuration issues. Some features may not work.\n");
  }
  
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);

  configureExpoAndLanding(app);

  const server = await registerRoutes(app);
  startAnalysisJobWorker();

  setupErrorHandler(app);

  const preferredPort = parseInt(process.env.PORT || "5000", 10);
  
  try {
    const actualPort = await tryListenOnPort(server, preferredPort);
    log(`\n========== SERVER READY ==========`);
    log(`Express server running on port ${actualPort}`);
    log(`API available at http://localhost:${actualPort}/api`);
    log(`==================================\n`);
  } catch (err) {
    log(`\nFailed to start server: ${(err as Error).message}`);
    log("Try running: npm run kill-ports\n");
    process.exit(1);
  }
})();
