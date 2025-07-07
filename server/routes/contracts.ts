import { Router } from "express";
import { db } from "@server/storage/db";
import { contracts } from "@shared/schema";

const router = Router();

// GET /api/contracts
router.get("/", async (_req, res) => {
  try {
    const allContracts = await db.select().from(contracts);
    res.json(allContracts);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: "Failed to fetch contracts" });
  }
});

export default router;