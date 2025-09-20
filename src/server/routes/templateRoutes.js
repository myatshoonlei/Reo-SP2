import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM template ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Template fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

export default router;