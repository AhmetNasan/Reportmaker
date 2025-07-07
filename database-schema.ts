// Database Schema - shared/schema.ts
import { pgTable, text, serial, timestamp, decimal, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  contractNumber: text("contract_number").notNull().unique(),
  clientName: text("client_name").notNull(),
  projectName: text("project_name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  contractValue: decimal("contract_value", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("planning"), // planning, active, completed, cancelled
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contractFiles = pgTable("contract_files", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => contracts.id),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => contracts.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("planning"), // planning, active, completed, cancelled
  progress: integer("progress").default(0), // 0-100
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  coordinates: jsonb("coordinates"), // Store GIS coordinates
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inspections = pgTable("inspections", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => contracts.id),
  projectId: integer("project_id").references(() => projects.id),
  imagePath: text("image_path").notNull(),
  analysisResults: jsonb("analysis_results"), // Store AI analysis results
  defectsFound: boolean("defects_found").default(false),
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0.00 to 1.00
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectContractSchema = createSelectSchema(contracts);

export const insertContractFileSchema = createInsertSchema(contractFiles).omit({
  id: true,
  createdAt: true,
});

export const selectContractFileSchema = createSelectSchema(contractFiles);

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectProjectSchema = createSelectSchema(projects);

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectInspectionSchema = createSelectSchema(inspections);

// TypeScript types
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type ContractFile = typeof contractFiles.$inferSelect;
export type InsertContractFile = z.infer<typeof insertContractFileSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Inspection = typeof inspections.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;