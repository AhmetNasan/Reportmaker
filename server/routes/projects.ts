import { Router } from "express";
import { db } from "@server/storage/db";
import { projects } from "@shared/schema";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const allProjects = await db.select().from(projects);
    res.json(allProjects);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

export default router;