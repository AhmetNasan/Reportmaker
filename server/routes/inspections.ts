import { Router } from "express";
import { db } from "@server/storage/db";
import { inspections } from "@shared/schema";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const allInspections = await db.select().from(inspections);
    res.json(allInspections);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: "Failed to fetch inspections" });
  }
});

export default router;