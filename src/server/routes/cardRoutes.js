import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        m.id,
        -- prefer per-card values, fallback to user
        COALESCE(m.fullname, u.fullname)          AS fullname,
        COALESCE(m.email, u.email)                AS email,
        m.company_name,
        m.job_title,
        m.phone_number,
        m.company_address,
        m.primary_color,
        m.secondary_color,
        m.template_id,
        m.logo                                     -- bytea
      FROM personal_cards m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Card not found" });
    }

    const row = result.rows[0];

    // convert logo (bytea) to data URL if present
    if (row.logo) {
      const base64 = Buffer.from(row.logo).toString("base64");
      row.logo = `data:image/jpeg;base64,${base64}`;
    } else {
      row.logo = null;
    }

    // optional: keep consistent keys for frontend
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
    return res.json(row);
  } catch (err) {
    console.error("🔥 SQL Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;