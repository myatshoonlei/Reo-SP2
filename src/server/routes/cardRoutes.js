import express from "express";
import pool from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Optional verify: sets req.viewer if valid; never throws
const verifyTokenOptional = (req, _res, next) => {
  const auth = req.headers['authorization'];
  if (!auth) return next();

  const token = auth.split(' ')[1];
  if (!token) return next();

  const JWT_SECRET = process.env.JWT_SECRET; // <-- no fallback!
  if (!JWT_SECRET) {
    console.warn("JWT_SECRET is not set; cannot verify viewer token.");
    return next();
  }

  try {
    req.viewer = jwt.verify(token, JWT_SECRET); // same algo/secret as login
  } catch (e) {
    // leave req.viewer undefined if invalid/expired
  }
  next();
};

router.get("/:id", verifyTokenOptional, async (req, res) => {
  const cardId = Number(req.params.id);
  if (!Number.isFinite(cardId)) return res.status(400).json({ error: "Invalid Card ID." });

  const viewerId = req.viewer ? Number(req.viewer.id) : null;

  try {
    const cardResult = await pool.query(
      `SELECT 
         pc.*, 
         t.component_key AS template,
         COALESCE(pc.fullname, u.fullname) AS fullname,
         COALESCE(pc.email, u.email)       AS email
       FROM personal_cards pc
       LEFT JOIN template t ON pc.template_id = t.id
       LEFT JOIN users u     ON pc.user_id    = u.id
       WHERE pc.id = $1`,
      [cardId]
    );
    if (cardResult.rowCount === 0) return res.status(404).json({ error: "Card not found" });

    const card = cardResult.rows[0];

    if (card.logo) {
      card.logo = `data:image/jpeg;base64,${Buffer.from(card.logo).toString("base64")}`;
    }
    if (card.profile_photo) {
      card.profile_photo = `data:image/jpeg;base64,${Buffer.from(card.profile_photo).toString("base64")}`;
    }

    const isOwner = viewerId != null && card.user_id === viewerId;

    let isAlreadySaved = false;
    if (viewerId && !isOwner) {
      const chk = await pool.query(
        "SELECT 1 FROM contacts WHERE user_id = $1 AND saved_card_id = $2 LIMIT 1",
        [viewerId, card.id]
      );
      isAlreadySaved = chk.rowCount > 0;
    }

    res.json({ card, isOwner, isAlreadySaved });
  } catch (err) {
    console.error("Failed to fetch card:", err);
    res.status(500).json({ error: "Server error while fetching card data." });
  }
});

export default router;
