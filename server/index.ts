import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { ensureConversationTables, ensureProfessionalPasswordColumn, storage } from "./storage";
import { ensureReviewTables } from "./create-reviews-tables";
import { startCampaignScheduler } from "./campaign-scheduler";
import { ensureSmtpColumns } from "./ensure-smtp-columns";
import { ensureResetColumns } from "./ensure-reset-columns";
import { ensureCustomHtmlColumn } from "./ensure-custom-html-column";
import { ensureCustomDomainColumn } from "./ensure-custom-domain-column";
import { ensureSystemUrlColumn } from "./ensure-system-url-column";
import { ensureAddressColumns } from "./ensure-address-columns";
import { ensureStripeColumns } from "./ensure-stripe-columns";
import { ensureAdminAlertsTables } from "./ensure-admin-alerts-tables";
import { ensureSupportTables } from "./ensure-support-tables";
import { ensureTourTables } from "./ensure-tour-tables";
import { ensureTourEnabledColumn } from "./ensure-tour-enabled-column";
import { db } from "./db";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize conversation tables at startup
  await ensureConversationTables();
  
  // Initialize review tables
  await ensureReviewTables();
  
  // Ensure SMTP columns exist
  await ensureSmtpColumns();
  
  // Ensure reset token columns exist
  await ensureResetColumns();
  
  // Ensure custom HTML column exists
  await ensureCustomHtmlColumn();
  
  // Ensure custom domain URL column exists
  await ensureCustomDomainColumn();
  
  // Ensure system URL column exists
  await ensureSystemUrlColumn();
  
  // Ensure address columns exist
  await ensureAddressColumns();
  
  // Ensure Stripe columns exist
  await ensureStripeColumns();
  
  // Ensure admin alerts tables exist
  await ensureAdminAlertsTables();
  
  // Ensure support tables exist
  await ensureSupportTables();
  
  // Ensure tour tables exist
  await ensureTourTables();
  
  // Ensure tour_enabled column exists
  await ensureTourEnabledColumn();
  
  // Ensure professional password column exists
  await ensureProfessionalPasswordColumn();
  
  // Start campaign scheduler
  startCampaignScheduler();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
