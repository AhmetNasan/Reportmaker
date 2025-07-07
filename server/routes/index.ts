import { Express } from "express";
import contractsRouter from "./contracts";
import projectsRouter from "./projects";
import inspectionsRouter from "./inspections";

export const registerRoutes = (app: Express) => {
  app.use("/api/contracts", contractsRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/inspections", inspectionsRouter);
};