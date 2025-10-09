import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* -------------------- GET: all saved contacts (personal + team) -------------------- */
router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      `
      -- personal cards saved by user
      SELECT 
        pc.id::text          AS contact_id,
        pc.fullname          AS name,
        pc.email,
        pc.phone_number      AS phone,
        pc.company_name      AS company,
        pc.profile_photo     AS photo_bytes,
        c.created_at
      FROM contacts c
      JOIN personal_cards pc ON c.saved_card_id = pc.id
      WHERE c.user_id = $1

      UNION ALL

      -- team members saved by user
      SELECT 
        tm.id::text          AS contact_id,
        tm.fullname          AS name,
        tm.email,
        tm.phone_number      AS phone,
        tm.company_name      AS company,
        NULL::bytea          AS photo_bytes,
        c.created_at
      FROM contacts c
      JOIN team_members tm ON c.saved_member_card_id = tm.id
      WHERE c.user_id = $1

      ORDER BY created_at DESC
      `,
      [userId]
    );

    const data = rows.map((r) => ({
      id: r.contact_id,
      name: r.name || "",
      email: r.email || "",
      phone: r.phone || "",
      company: r.company || "",
      profilePhoto: r.photo_bytes ? Buffer.from(r.photo_bytes).toString("base64") : null,
    }));

    res.json(data);
  } catch (err) {
    console.error("Error fetching contacts:", err.stack || err);
    res.status(500).json({ error: "Server error while fetching contacts." });
  }
});

/* -------------------- POST: add a saved contact -------------------- */
/* Works for BOTH:
   - personal:  { contactCardId }
   - team:      { memberCardId }
*/
router.post("/add", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { contactCardId, memberCardId } = req.body;

  if (!contactCardId && !memberCardId) {
    return res.status(400).json({ error: "Card ID is required." });
  }

  try {
    // PERSONAL CARD PATH (original behavior)
    if (contactCardId) {
      // block saving your own personal card
      const owner = await pool.query(
        "SELECT user_id FROM personal_cards WHERE id = $1",
        [contactCardId]
      );
      if (owner.rows.length && owner.rows[0].user_id === userId) {
        return res.status(400).json({ error: "You cannot save your own card." });
      }

      const r = await pool.query(
        `INSERT INTO contacts (user_id, saved_card_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, saved_card_id) DO NOTHING
         RETURNING id`,
        [userId, contactCardId]
      );

      if (!r.rows.length) {
        return res.status(409).json({ message: "Contact already saved." });
      }
      return res.status(201).json({ message: "Contact saved successfully!", data: r.rows[0] });
    }

    // TEAM MEMBER PATH
    if (memberCardId) {
      // (optional symmetry) block saving your own team member
      const owner = await pool.query(
        `SELECT tc.userid
           FROM team_members tm
           JOIN team_cards tc ON tc.teamid = tm.team_id
          WHERE tm.id = $1`,
        [memberCardId]
      );
      if (owner.rows.length && owner.rows[0].userid === userId) {
        return res.status(400).json({ error: "You cannot save your own card." });
      }

      const r = await pool.query(
        `INSERT INTO contacts (user_id, saved_member_card_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, saved_member_card_id) DO NOTHING
         RETURNING id`,
        [userId, memberCardId]
      );

      if (!r.rows.length) {
        return res.status(409).json({ message: "Contact already saved." });
      }
      return res.status(201).json({ message: "Team member saved successfully!", data: r.rows[0] });
    }

    return res.status(400).json({ error: "Invalid payload." });
  } catch (err) {
    console.error("Error adding contact:", err.stack || err);
    res.status(500).json({ error: "Server error while adding contact." });
  }
});

/* -------------------- DELETE: remove a saved contact by card id -------------------- */
/* Works for both kinds: deletes if the id matches either column */
router.delete("/:cardId", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.cardId);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid card id" });

  try {
    await pool.query(
      `DELETE FROM contacts
       WHERE user_id = $1
         AND (saved_card_id = $2 OR saved_member_card_id = $2)`,
      [userId, id]
    );
    return res.status(204).end();
  } catch (err) {
    console.error("Error removing contact:", err.stack || err);
    res.status(500).json({ error: "Server error while removing contact." });
  }
});

/* -------------------- GET: one contact’s phone/email by cardId -------------------- */
/* Tries personal first, then team member; same response shape */
router.get("/:cardId", verifyToken, async (req, res) => {
  const id = Number(req.params.cardId);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid card id" });

  try {
    let r = await pool.query(
      `SELECT email, phone_number AS phone FROM personal_cards WHERE id = $1`,
      [id]
    );

    if (!r.rows.length) {
      r = await pool.query(
        `SELECT email, phone_number AS phone FROM team_members WHERE id = $1`,
        [id]
      );
    }

    if (!r.rows.length) return res.status(404).json({ message: "Contact not found" });
    res.json({ data: r.rows[0] });
  } catch (err) {
    console.error("Error fetching contact:", err.stack || err);
    res.status(500).json({ error: "Server error while fetching contact." });
  }
});

/* -------------------- PUT: update phone/email by cardId -------------------- */
/* Updates personal if it exists; otherwise team member */
router.put("/:cardId", verifyToken, async (req, res) => {
  const id = Number(req.params.cardId);
  const { phone, email } = req.body;

  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid card id" });

  try {
    let r = await pool.query(
      `UPDATE personal_cards 
         SET phone_number = $1, email = $2 
       WHERE id = $3
       RETURNING id, email, phone_number AS phone`,
      [phone, email, id]
    );

    if (!r.rows.length) {
      r = await pool.query(
        `UPDATE team_members
           SET phone_number = $1, email = $2
         WHERE id = $3
         RETURNING id, email, phone_number AS phone`,
        [phone, email, id]
      );
    }

    if (!r.rows.length) return res.status(404).json({ message: "Contact not found" });
    res.json({ data: r.rows[0] });
  } catch (err) {
    console.error("Error updating contact:", err.stack || err);
    res.status(500).json({ error: "Server error while updating contact." });
  }
});

export default router;
