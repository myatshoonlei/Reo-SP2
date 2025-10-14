import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ✅ Create a new team card
router.post("/", verifyToken, async (req, res) => {
  // 🆕 Extra log to see what the server receives
  console.log('Received POST request to /api/teamcard with body:', req.body);
  
  // 🆕 Only destructure companyName from the request body
  const { companyName } = req.body;
  const userId = req.user.id;

  try {
    // ✅ Updated SQL to match database schema (userid and company_name)
    const result = await pool.query(
      `INSERT INTO team_cards
       (userid, company_name)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, companyName]
    );

    res.json({ message: "Team card created successfully!", data: result.rows[0] });
  } catch (err) {
    console.error("❌ Insert team card error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Update an existing team card
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  console.log(`PUT /api/teamcard/${id} by user ${userId}`);
  console.log("Body keys:", Object.keys(req.body || {}));

  let {
    companyName,
    template_id,
    primaryColor,
    secondaryColor,
    logo,
    font_family
  } = req.body || {};

  const sets = [];
  const vals = [];
  let i = 1;

  if (companyName != null) { sets.push(`company_name = $${i++}`); vals.push(companyName); }
  if (template_id != null) { sets.push(`template_id = $${i++}::int`); vals.push(Number(template_id)); }
  if (primaryColor != null) { sets.push(`primary_color = $${i++}`); vals.push(primaryColor); }
  if (secondaryColor != null) { sets.push(`secondary_color = $${i++}`); vals.push(secondaryColor); }
  if (font_family != null) { sets.push(`font_family = $${i++}`); vals.push(font_family); }

  if (logo === null) {
    sets.push(`logo = NULL`);
  } else if (typeof logo === "string" && logo.startsWith("data:")) {
    const base64 = logo.split(",")[1];
    try {
      const buf = Buffer.from(base64, "base64");
      sets.push(`logo = $${i++}`);
      vals.push(buf);
    } catch {
      return res.status(400).json({ error: "Invalid logo data URL" });
    }
  }

  sets.push(`updated_at = NOW()`);

  if (!sets.length) return res.status(400).json({ error: "No updatable fields supplied" });

  const teamIdParam = i++;
  const userIdParam = i++;
  vals.push(id, userId);

  const q = `
    UPDATE team_cards
       SET ${sets.join(", ")}
     WHERE teamid = $${teamIdParam}::int AND userid = $${userIdParam}
     RETURNING *`;

  console.log("Executing query:", q);
  console.log("With values:", vals);

  try {
    const r = await pool.query(q, vals);
    console.log("Rows updated:", r.rowCount);
    if (!r.rows.length) return res.status(404).json({ error: "Team card not found or unauthorized" });
    return res.json({ message: "Team card updated successfully", data: r.rows[0] });
  } catch (err) {
    console.error("update team card error:", err.code, err.message, err.detail || "");
    return res.status(500).json({ error: "Server error" });
  }
});

// teamcard.js
router.get("/:id/details", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const q = `
      SELECT teamid, userid, company_name, primary_color, secondary_color, font_family, logo, template_id
      FROM team_cards
      WHERE teamid = $1 AND userid = $2
      LIMIT 1`;
    const r = await pool.query(q, [id, userId]);
    if (!r.rows.length) return res.status(404).json({ error: "Team card not found or unauthorized" });

    const row = r.rows[0];

    // 👇 make it match personal: Buffer -> base64 string (no JSON)
    if (row.logo) {
      row.logo = Buffer.from(row.logo).toString("base64");
    }

    res.json({ data: row });
  } catch (e) {
    console.error("teamcard details error:", e);
    res.status(500).json({ error: "Server error" });
  }
});



// ✅ Get a single team card (prefill Step 1)
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT teamid, userid, company_name
         FROM team_cards
        WHERE teamid = $1 AND userid = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Team card not found or unauthorized" });
    }

    // Keep the same response shape you already use
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error("❌ Get team card error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/teamcard  -> include created_at for FE sorting
router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const q = `
      SELECT teamid, company_name, primary_color, secondary_color, logo, created_at
      FROM team_cards
      WHERE userid = $1
      ORDER BY created_at DESC, teamid DESC
    `;
    const r = await pool.query(q, [userId]);

    // Convert Buffer -> base64 so FE can put it in an <img>
    const rows = r.rows.map(row => ({
      ...row,
      logo: row.logo ? Buffer.from(row.logo).toString("base64") : null,
    }));

    res.json({ data: rows });
  } catch (err) {
    console.error("❌ List team cards error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/teamcard/:id  -> delete team + all its members (INT ids)
router.delete("/:id", verifyToken, async (req, res) => {
  const userId = req.user.id;                // whatever type it is in your table
  const teamId = Number(req.params.id);      // <- ensure it's numeric

  if (!Number.isInteger(teamId)) {
    return res.status(400).json({ error: "Invalid team id" });
  }

  try {
    await pool.query("BEGIN");

    // 1) delete members for this team
    const delMembers = await pool.query(
      "DELETE FROM team_members WHERE team_id = $1::int",
      [teamId]
    );

    // 2) delete the team row scoped to this user
    const delTeam = await pool.query(
      "DELETE FROM team_cards WHERE teamid = $1::int AND userid = $2 RETURNING teamid",
      [teamId, userId]
    );

    if (!delTeam.rowCount) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ error: "Team not found or unauthorized" });
    }

    await pool.query("COMMIT");
    res.json({
      ok: true,
      teamid: teamId,
      removedMembers: delMembers.rowCount,
      message: "Team deleted successfully",
    });
  } catch (e) {
    await pool.query("ROLLBACK");
    console.error("❌ Delete team error:", e);
    res.status(500).json({ error: "Server error while deleting team" });
  }
});

export default router;
