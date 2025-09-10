import express, { type Request, type Response } from "express";
import { registerRoutes } from "../server/routes";

// Minimal Express app for Vercel serverless (API only)
const app = express();
app.disable("x-powered-by");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register all /api routes (no server.listen here)
registerRoutes(app as any);

export default function handler(req: Request, res: Response) {
  (app as any)(req, res);
}




