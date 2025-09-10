import express, { type Request, type Response, type NextFunction } from "express";
import helmet from "helmet";
import session from "express-session";
import serverless from "serverless-http";
import { registerRoutes } from "../server/routes";

// Vercel serverless handler wrapping our Express app
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Behind Vercel proxy, trust X-Forwarded-* to set secure cookies correctly
app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://www.youtube.com"],
      imgSrc: ["'self'", "data:", "https://*.supabase.co", "https://images.unsplash.com", "https://images.pexels.com"],
      frameSrc: ["'self'", "https://www.youtube.com"],
      connectSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  }
}));

// ATTENTION: en serverless, la mémoire n'est pas persistée entre invocations.
// Pour l'admin, on garde une session simple basée cookie pour rester compatible.
app.use(session({
  secret: process.env.SESSION_SECRET || "Guthier2024!_SESSION_SECRET_@2024",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 2,
  },
}));

// Enregistre les routes API existantes
registerRoutes(app).catch((e) => {
  console.error("Failed to register routes:", e);
});

// Gestion d'erreurs générique
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

export default serverless(app);



