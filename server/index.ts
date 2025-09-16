import express, { type Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { fileURLToPath } from 'url';
import session from "express-session";
import helmet from "helmet";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const isProd = process.env.NODE_ENV === "production";
const imagesPath = isProd
  ? path.join(__dirname, "../dist/public/images")
  : path.join(__dirname, "../public/images");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: "Guthier2024!_SESSION_SECRET_@2024", // à changer pour production
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // mettre true si HTTPS
    maxAge: 1000 * 60 * 60 * 2 // 2h
  }
}));

// Sécurité: CSP désactivée en développement (Vite/HMR), stricte en production
if (app.get("env") === "development") {
  app.use(helmet({ contentSecurityPolicy: false }));
} else {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://www.youtube.com", "https://replit.com"],
        // Autoriser les images hébergées sur Supabase, toutes origines HTTPS et data: (icônes inline)
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "https://*.supabase.co"
        ],
        frameSrc: ["'self'", "https://www.youtube.com"],
        connectSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      }
    }
  }));
}

// Images locales: toujours bloquées (même en dev). Supabase-only.
app.use("/images", (_req, res) => {
  return res.status(404).send("Not found");
});
app.use("/assets", (req, res, next) => {
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.setHeader("Vary", "Accept-Encoding");
  next();
});

// Headers de performance pour toutes les réponses
app.use((req, res, next) => {
  // Compression
  res.setHeader("Vary", "Accept-Encoding");
  
  // Preload hints pour les ressources critiques
  if (req.path === "/") {
    res.setHeader("Link", '</generated-icon.png>; rel=preload; as=image, </assets/index.css>; rel=preload; as=style, </assets/index.js>; rel=preload; as=script');
  }
  
  // Headers de sécurité supplémentaires
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  
  next();
});

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
  const httpServer = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT ? Number(process.env.PORT) : 5000;
  httpServer.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
