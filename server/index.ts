import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import helmet from "helmet";
import { registerRoutes } from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(helmet());

// Application routes
registerRoutes(app);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
});