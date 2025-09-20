// teamInfo.js
import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/auth.js";
import QRCode from "qrcode";

const router = express.Router();

/* ---------- small helpers ---------- */
const clean = (v) => (v == null ? "" : String(v).replace(/^\s*'+/, "").trim());
const cleanEmail = (v) => clean(v).toLowerCase();
const cleanPhone = (v) =>
  clean(v).replace(/[^\d+()\-.\s]/g, "").replace(/\s+/g, " ").trim();

/* ---------- utility to build the public URL ---------- */
function getBasePublicUrl(req) {
  // Prefer an env var; fall back to the request's origin/host.
  // e.g. PUBLIC_BASE_URL=https://myapp.com
  return (
    process.env.PUBLIC_BASE_URL ||
    `${req.protocol}://${req.get("host")}` // http(s)://localhost:5000
  );
}

/* ---------- batch generator (for internal reuse) ---------- */
async function generateQrsForTeam(req, teamId) {
  // fetch all member ids for the team
  const { rows } = await pool.query(
    `SELECT id FROM team_members WHERE team_id = $1 ORDER BY id ASC`,
    [teamId]
  );
  if (!rows.length) return { count: 0 };

  const base = getBasePublicUrl(req);
  let updated = 0;

  for (const { id: memberId } of rows) {
    const url = `${base}/team/${teamId}/member/${memberId}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 160, margin: 0 });
    const r = await pool.query(
      `UPDATE team_members SET qr = $1 WHERE id = $2`,
      [dataUrl, memberId]
    );
    updated += r.rowCount;
  }

  return { count: updated };
}

/* ---------- POST /api/teamInfo  (upload members) ---------- */
/* Replaces existing members for teamId (transaction) */
router.post("/", verifyToken, async (req, res) => {
  const { teamId, members } = req.body;
  if (!teamId || !Array.isArray(members) || !members.length) {
    return res.status(400).json({ error: "Invalid team ID or member data provided." });
  }

  try {
    const teamCardResult = await pool.query(
      "SELECT company_name FROM team_cards WHERE teamid = $1",
      [teamId]
    );
    if (!teamCardResult.rows.length) {
      return res.status(404).json({ error: "Team card not found." });
    }
    const { company_name } = teamCardResult.rows[0];

    await pool.query("BEGIN");
    await pool.query("DELETE FROM team_members WHERE team_id = $1", [teamId]);

    for (const m of members) {
      await pool.query(
        `INSERT INTO team_members
         (team_id, fullname, job_title, email, phone_number, company_name)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          teamId,
          clean(m.fullname),
          clean(m.jobTitle || m.job_title),
          cleanEmail(m.email),
          cleanPhone(m.phoneNumber || m.phone_number),
          company_name,
        ]
      );
    }

    await pool.query("COMMIT");

    // ⬇️ generate QR codes for every member right after upload
    const { count } = await generateQrsForTeam(req, teamId);

    return res.status(201).json({
      message: "Team members uploaded successfully!",
      count: members.length,
      qrsGenerated: count,
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Failed to upload team members:", error);
    return res.status(500).json({ error: "Server error while uploading team members" });
  }
});

/* ---------- PUT /api/teamInfo/:teamId/qrs  (manual batch regenerate) ---------- */
router.put("/:teamId/qrs", verifyToken, async (req, res) => {
  const { teamId } = req.params;
  try {
    const { count } = await generateQrsForTeam(req, teamId);
    return res.json({ ok: true, updated: count });
  } catch (e) {
    console.error("batch generate qrs error:", e);
    return res.status(500).json({ error: "Server error while generating QRs" });
  }
});

/* ---------- GET /api/teamInfo/first?teamId=... ---------- */
router.get("/first", verifyToken, async (req, res) => {
  const { teamId } = req.query;
  if (!teamId) return res.status(400).json({ error: "teamId is required" });
  try {
    const q = `
      SELECT id, team_id, fullname, job_title, email, phone_number, company_name, qr
      FROM team_members
      WHERE team_id = $1
      ORDER BY id ASC
      LIMIT 1`;
    const r = await pool.query(q, [teamId]);
    if (!r.rows.length) return res.status(404).json({ error: "No members for this team" });
    return res.json({ data: r.rows[0] });
  } catch (e) {
    console.error("first member error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ---------- PUT /api/teamInfo/:memberId/qr (keep your single-member route) ---------- */
router.put("/:memberId/qr", verifyToken, async (req, res) => {
  const { memberId } = req.params;
  const { qr } = req.body;
  try {
    const r = await pool.query(
      `UPDATE team_members SET qr = $1 WHERE id = $2 RETURNING id`,
      [qr, memberId]
    );
    if (!r.rowCount) return res.status(404).json({ error: "Member not found" });
    res.json({ ok: true });
  } catch (e) {
    console.error("save member qr error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
