import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ✅ Create a new personal card
router.post("/", verifyToken, async (req, res) => {
  const {
    fullname,
    email,
    companyName,
    jobTitle,
    phoneNumber,
    companyAddress,
  } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
  `INSERT INTO personal_cards 
    (user_id, fullname, email, company_name, job_title, phone_number, company_address)
   VALUES ($1, $2, $3, $4, $5, $6, $7)
   RETURNING *`,
  [
    userId,
    fullname,
    email,
    companyName,
    jobTitle,
    phoneNumber,
    companyAddress,
  ]
);

    res.json({ message: "Card created successfully!", data: result.rows[0] });
  } catch (err) {
    console.error("❌ Insert error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get personal card details
router.get("/details", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT p.*
       FROM personal_cards p
       WHERE p.user_id = $1
       ORDER BY p.id DESC
       LIMIT 1`,
      [userId]
    );

    const card = result.rows[0];
    if (!card) return res.status(404).json({ error: "Card not found" });

    if (card.logo) {
      card.logo = Buffer.from(card.logo).toString("base64");
    }

    res.json(card);
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch card" });
  }
});

// ✅ Get saved colors
router.get("/saved-colors", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT primary_color, secondary_color FROM personal_cards WHERE user_id = $1 ORDER BY id DESC LIMIT 1",
      [userId]
    );
    res.json(result.rows[0] || {});
  } catch (error) {
    console.error("❌ Color fetch error:", error.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Update an existing personal card
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    fullname,
    email,
    companyName,
    jobTitle,
    phoneNumber,
    companyAddress,
  } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `UPDATE personal_cards
       SET fullname = $1,
           email = $2,
           company_name = $3,
           job_title = $4,
           phone_number = $5,
           company_address = $6
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [
        fullname,
        email,
        companyName,
        jobTitle,
        phoneNumber,
        companyAddress,
        id,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Card not found or unauthorized" });
    }

    res.json({ message: "Card updated successfully", data: result.rows[0] });
  } catch (err) {
    console.error("❌ Update error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;