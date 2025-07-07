// Main Server File - server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

(async () => {
  const server = await registerRoutes(app);
  
  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    log(`Error ${status}: ${message}`);
    res.status(status).json({ message });
  });

  // Setup Vite or serve static files
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running on port ${PORT}`);
  });
})();

// API Routes - server/routes.ts
import { Express } from "express";
import multer from "multer";
import { createServer } from "http";
import { storage } from "./storage";
import { insertContractSchema, insertProjectSchema, insertInspectionSchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

export async function registerRoutes(app: Express) {
  const server = createServer(app);

  // Contract routes
  app.get("/api/contracts", async (req, res) => {
    try {
      const contracts = await storage.getContracts();
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.get("/api/contracts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contract = await storage.getContract(id);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      res.json(contract);
    } catch (error) {
      console.error("Error fetching contract:", error);
      res.status(500).json({ message: "Failed to fetch contract" });
    }
  });

  app.post("/api/contracts", async (req, res) => {
    try {
      const contractData = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(contractData);
      res.status(201).json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contract data", errors: error.errors });
      }
      console.error("Error creating contract:", error);
      res.status(500).json({ message: "Failed to create contract" });
    }
  });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // File upload routes
  app.post("/api/files/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const contractId = req.body.contractId ? parseInt(req.body.contractId) : null;
      
      if (contractId) {
        const fileData = {
          contractId,
          fileName: req.file.originalname,
          filePath: req.file.path,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
        };
        
        const contractFile = await storage.createContractFile(fileData);
        res.status(201).json(contractFile);
      } else {
        // Return file info for general file uploads
        res.status(201).json({
          fileName: req.file.originalname,
          filePath: req.file.path,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Inspection routes
  app.get("/api/inspections", async (req, res) => {
    try {
      const inspections = await storage.getInspections();
      res.json(inspections);
    } catch (error) {
      console.error("Error fetching inspections:", error);
      res.status(500).json({ message: "Failed to fetch inspections" });
    }
  });

  app.post("/api/inspections", async (req, res) => {
    try {
      const inspectionData = insertInspectionSchema.parse(req.body);
      const inspection = await storage.createInspection(inspectionData);
      res.status(201).json(inspection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inspection data", errors: error.errors });
      }
      console.error("Error creating inspection:", error);
      res.status(500).json({ message: "Failed to create inspection" });
    }
  });

  return server;
}