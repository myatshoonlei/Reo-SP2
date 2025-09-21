import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/auth.js"; // Your authentication middleware

const router = express.Router();

// --- GET ALL CONTACTS FOR THE LOGGED-IN USER ---
// This route will be used by your new Contacts Page.
router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        pc.id,
        pc.fullname       AS name,
        pc.email,
        pc.phone_number   AS phone,
        pc.company_name   AS company,
        pc.profile_photo
      FROM contacts c
      JOIN personal_cards pc ON c.saved_card_id = pc.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
      `,
      [userId]
    );

    const data = rows.map((r) => ({
      id: r.id,
      name: r.name || "",
      email: r.email || "",
      phone: r.phone || "",
      company: r.company || "",
      profilePhoto: r.profile_photo 
        ? Buffer.from(r.profile_photo).toString("base64")
        : null,
    }));

    res.json(data);
  } catch (err) {
    console.error("Error fetching contacts:", err.message);
    res.status(500).json({ error: "Server error while fetching contacts." });
  }
});


// --- POST TO ADD A NEW CONTACT ---
// This is the route that fixes the "404 Not Found" error.
router.post("/add", verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { contactCardId } = req.body; // The ID of the card being saved

    if (!contactCardId) {
        return res.status(400).json({ error: "Contact card ID is required." });
    }

    try {
        // Prevent users from saving their own card
        const cardOwnerResult = await pool.query("SELECT user_id FROM personal_cards WHERE id = $1", [contactCardId]);
        if (cardOwnerResult.rows.length > 0 && cardOwnerResult.rows[0].user_id === userId) {
            return res.status(400).json({ error: "You cannot save your own card." });
        }
        
        // Add the new contact to the database.
        // "ON CONFLICT" prevents errors if the user tries to save the same contact twice.
        const result = await pool.query(
            `INSERT INTO contacts (user_id, saved_card_id) 
             VALUES ($1, $2) 
             ON CONFLICT (user_id, saved_card_id) DO NOTHING 
             RETURNING id`,
            [userId, contactCardId]
        );

        if (result.rows.length === 0) {
            // This happens if the contact was already saved.
            return res.status(409).json({ message: "Contact already saved." });
        }

        res.status(201).json({ message: "Contact saved successfully!", data: result.rows[0] });
    } catch (err) {
        console.error("Error adding contact:", err.message);
        res.status(500).json({ error: "Server error while adding contact." });
    }
});

// DELETE /api/contacts/:cardId  (remove saved contact by the card id)
router.delete("/:cardId", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const cardId = Number(req.params.cardId);
  if (!Number.isFinite(cardId)) {
    return res.status(400).json({ error: "Invalid card id" });
  }

  try {
    const result = await pool.query(
      `DELETE FROM contacts
       WHERE user_id = $1 AND saved_card_id = $2`,
      [userId, cardId]
    );
    // 204 even if it wasn't there anymore, keeps UX simple
    return res.status(204).end();
  } catch (err) {
    console.error("Error removing contact:", err);
    res.status(500).json({ error: "Server error while removing contact." });
  }
});


export default router;