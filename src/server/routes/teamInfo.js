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
  // Always prefer an explicit public URL (no trailing slash)
  if (process.env.VITE_PUBLIC_BASE_URL) {
    return process.env.VITE_PUBLIC_BASE_URL.replace(/\/+$/, "");
  }

  // Respect proxies if present (useful in prod behind Nginx)
  const proto = (req.headers["x-forwarded-proto"] || req.protocol || "http");
  const host  = (req.headers["x-forwarded-host"]  || req.get("host") || "");

  // DEV fallback: if the request hit the API on :5000, serve the SPA on :5173
  if (/localhost:5000$/i.test(host)) {
    return `${proto}://localhost:5173`;
  }

  // Otherwise use whatever host handled the request
  return `${proto}://${host}`;
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
      // in POST /api/teamInfo (inside the for..of members loop)
      await pool.query(
        `INSERT INTO team_members
        (team_id, fullname, job_title, email, phone_number, company_name, company_address)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          teamId,
          clean(m.fullname),
          clean(m.jobTitle || m.job_title),
          cleanEmail(m.email),
          cleanPhone(m.phoneNumber || m.phone_number),
          company_name,
          clean(m.companyAddress || m.company_address),  // <-- NEW
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
      SELECT id, team_id, fullname, job_title, email, phone_number,
         company_name, company_address, qr
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

// GET /api/teamInfo/:teamId/members  -> members + team styling (template/colors/logo)
router.get("/:teamId/members", verifyToken, async (req, res) => {
  const { teamId } = req.params;
  const userId = req.user.id;

  try {
    const q = `
      SELECT
        m.id,
        m.team_id,
        m.fullname,
        m.job_title,
        m.email,
        m.phone_number,
        m.company_name,
        m.company_address,
        m.qr,

        tc.template_id,
        tc.primary_color,
        tc.secondary_color,
        tc.logo,
        tc.company_name     AS team_company_name,

        t.component_key
      FROM team_members m
      JOIN team_cards   tc ON tc.teamid = m.team_id AND tc.userid = $2
      LEFT JOIN template t ON t.id = tc.template_id
      WHERE m.team_id = $1
      ORDER BY m.id DESC
    `;
    const r = await pool.query(q, [teamId, userId]);

    const rows = r.rows.map(row => {
      if (row.logo) {
        row.logo = Buffer.from(row.logo).toString("base64"); // match personal /all behavior
      }
      return row;
    });

    res.json({ data: rows });
  } catch (e) {
    console.error("members-with-styling error:", e);
    res.status(500).json({ error: "Server error" });
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

// PUBLIC: GET /api/teamInfo/public/:teamId/member/:memberId
router.get("/public/:teamId/member/:memberId", async (req, res) => {
  try {
    // sanitize (keeps only digits)
    const teamId = parseInt(String(req.params.teamId).replace(/[^\d]/g, ""), 10);
    const memberId = parseInt(String(req.params.memberId).replace(/[^\d]/g, ""), 10);

    if (!Number.isFinite(teamId) || !Number.isFinite(memberId)) {
      return res.status(400).json({ error: "Invalid IDs" });
    }

    const q = `
      SELECT
        m.id, m.team_id, m.fullname, m.job_title, m.email, m.phone_number, m.company_name,  m.company_address, m.qr,
        tc.template_id, tc.primary_color, tc.secondary_color, tc.logo,
        t.component_key
      FROM team_members m
      JOIN team_cards   tc ON tc.teamid = m.team_id
      LEFT JOIN template t  ON t.id = tc.template_id
      WHERE m.team_id = $1 AND m.id = $2
      LIMIT 1
    `;
    const r = await pool.query(q, [teamId, memberId]);
    if (!r.rows.length) return res.status(404).json({ error: "Member not found" });

    const row = r.rows[0];
    if (row.logo) row.logo = Buffer.from(row.logo).toString("base64");
    return res.json({ data: row });
  } catch (e) {
    console.error("public member error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});


// GET /api/teamInfo/counts  -> [{ team_id, count }]
router.get("/counts", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const q = `
      SELECT m.team_id, COUNT(*)::int AS count
      FROM team_members m
      WHERE m.team_id IN (SELECT teamid FROM team_cards WHERE userid = $1)
      GROUP BY m.team_id
    `;
    const r = await pool.query(q, [userId]);
    res.json({ data: r.rows });
  } catch (e) {
    console.error("counts error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/teamInfo/member/:id  -> delete one member (must belong to a team owned by user)
router.delete("/member/:id", verifyToken, async (req, res) => {
  const { id } = req.params;           // member id (int)
  const userId = req.user.id;

  try {
    // verify that this member belongs to a team owned by the authed user
    const check = await pool.query(
      `SELECT m.id
         FROM team_members m
         JOIN team_cards tc ON tc.teamid = m.team_id
        WHERE m.id = $1 AND tc.userid = $2`,
      [id, userId]
    );
    if (!check.rowCount) {
      return res.status(404).json({ error: "Member not found or unauthorized" });
    }

    await pool.query(`DELETE FROM team_members WHERE id = $1`, [id]);
    return res.json({ message: "Member deleted" });
  } catch (e) {
    console.error("delete member error:", e);
    return res.status(500).json({ error: "Server error while deleting member" });
  }
});


export default router;
