import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ✅ Create a new personal card
router.post("/", verifyToken, async (req, res) => {
  const {
    id, // Optional ID for updates
    fullname,
    email,
    companyName,
    jobTitle,
    phoneNumber,
    companyAddress,
    template_id,
    primaryColor,
    secondaryColor,
    logo,
    qr,
  } = req.body;
  const userId = req.user.id;

  console.log("🚀 POST /personal-card - Creating new card for user:", userId);
  console.log("📝 Request body:", { 
    id, fullname, email, companyName, jobTitle, phoneNumber, companyAddress, template_id 
  });

  let logoBuffer = null;
  if (logo) {
    try {
      const base64Data = logo.split(",")[1];
      logoBuffer = Buffer.from(base64Data, "base64");
    } catch (e) {
      console.error("❌ Failed to parse logo data URL:", e);
      return res.status(400).json({ error: "Invalid logo data format" });
    }
  }

  try {
    let result;
    if (id) {
      console.log("🔄 Updating existing card with ID:", id);
      const updateQuery = `
        UPDATE personal_cards
        SET fullname = $2, email = $3, company_name = $4, job_title = $5, phone_number = $6, company_address = $7, template_id = $8, primary_color = $9, secondary_color = $10, logo = $11, qr = COALESCE($12, qr)
        WHERE id = $1 AND user_id = $13
        RETURNING *`;
      result = await pool.query(updateQuery, [
        id, fullname, email, companyName, jobTitle, phoneNumber, companyAddress, template_id, primaryColor, secondaryColor, logoBuffer, qr, userId,
      ]);
    } else {
      console.log("➕ Inserting new card");
      const insertQuery = `
        INSERT INTO personal_cards 
        (user_id, fullname, email, company_name, job_title, phone_number, company_address, template_id, primary_color, secondary_color, logo, qr)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`;
      result = await pool.query(insertQuery, [
        userId, fullname, email, companyName, jobTitle, phoneNumber, companyAddress, template_id, primaryColor, secondaryColor, logoBuffer, qr,
      ]);
    }

    if (result.rows.length === 0) {
      console.error("❌ No rows returned from database operation");
      return res.status(500).json({ error: "Failed to save card" });
    }

    const savedCard = result.rows[0];
    console.log("✅ Card saved successfully with ID:", savedCard.id);
    console.log("💾 Saved card data:", { 
      id: savedCard.id, 
      user_id: savedCard.user_id, 
      fullname: savedCard.fullname 
    });

    res.json({ message: "Card saved successfully!", data: savedCard });
  } catch (err) {
    console.error("❌ Save error:", err.message);
    console.error("❌ Error details:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// ✅ Get primary_color and secondary_color from the latest card
router.get("/saved-colors", verifyToken, async (req, res) => {
  const userId = req.user.id;
  console.log("🎨 GET /saved-colors for user:", userId);
  
  try {
    const result = await pool.query(
      `SELECT primary_color, secondary_color FROM personal_cards WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
      [userId]
    );
    console.log("🎨 Found colors:", result.rows[0] || "none");
    res.json(result.rows[0] || {});
  } catch (error) {
    console.error("❌ Color fetch error:", error.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Get all personal cards for a user
router.get("/all", verifyToken, async (req, res) => {
  const userId = req.user.id;
  console.log("📋 GET /all cards for user:", userId);
  
  try {
    // First, let's see all cards for this user without JOIN to debug
    const debugQuery = await pool.query(
      `SELECT * FROM personal_cards WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    console.log("🔍 Debug - All cards for user:", debugQuery.rows.map(card => ({
      id: card.id,
      fullname: card.fullname,
      template_id: card.template_id
    })));

    const cards = await pool.query(
      `SELECT pc.*, t.component_key 
       FROM personal_cards pc 
       LEFT JOIN template t ON pc.template_id = t.id 
       WHERE pc.user_id = $1 
       ORDER BY pc.created_at DESC`,
      [userId]
    );

    console.log("📋 Fetched", cards.rows.length, "cards for user", userId);

    const processedCards = cards.rows.map((card) => {
      if (card.logo) {
        card.logo = Buffer.from(card.logo).toString("base64");
      }
      return card;
    });

    res.json(processedCards);
  } catch (err) {
    console.error("❌ Fetch all error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// // ✅ Get personal card details
// router.get("/details", verifyToken, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const result = await pool.query(
//       `SELECT p.* FROM personal_cards p WHERE p.user_id = $1 ORDER BY p.id DESC LIMIT 1`,
//       [userId]
//     );

//     const card = result.rows[0];
//     if (!card) return res.status(404).json({ error: "Card not found" });

//     if (card.logo) {
//       card.logo = Buffer.from(card.logo).toString("base64");
//     }

//     res.json(card);
//   } catch (err) {
//     console.error("❌ Fetch error:", err.message);
//     res.status(500).json({ error: "Failed to fetch card" });
//   }
// });

// ✅ Add the GET route for profile photo retrieval
router.get('/:cardId/profile-photo', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;

    const result = await pool.query(
      `SELECT profile_photo FROM personal_cards
       WHERE id = $1 AND user_id = $2`,
      [cardId, userId]
    );

    const imageBuffer = result.rows[0]?.profile_photo;
    if (!imageBuffer) {
      return res.status(404).json({ error: 'No profile photo found' });
    }

    res.set('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  } catch (err) {
    console.error('GET PROFILE PHOTO ERROR:', err);
    res.status(500).json({ error: 'Failed to fetch profile photo' });
  }
});


// ✅ Update an existing personal card - specific route with full path
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

  console.log("🔄 PUT /personal-card/:id", { id, userId });
  console.log("📝 Update data:", { fullname, email, companyName, jobTitle });

  // Validate ID
  const cardId = Number(id);
  if (!Number.isFinite(cardId)) {
    console.error("❌ Invalid card ID:", id);
    return res.status(400).json({ error: 'Invalid card ID' });
  }

  try {
    // First check if the card exists
    const checkQuery = await pool.query(
      `SELECT id, user_id FROM personal_cards WHERE id = $1`,
      [cardId]
    );
    
    console.log("🔍 Card check result:", checkQuery.rows);
    
    if (checkQuery.rows.length === 0) {
      console.error("❌ Card not found:", cardId);
      return res.status(404).json({ error: "Card not found" });
    }
    
    if (checkQuery.rows[0].user_id !== userId) {
      console.error("❌ Unauthorized access to card:", { cardId, cardUserId: checkQuery.rows[0].user_id, requestUserId: userId });
      return res.status(403).json({ error: "Unauthorized" });
    }

    const result = await pool.query(
      `UPDATE personal_cards
      SET fullname = $1, email = $2, company_name = $3, job_title = $4, phone_number = $5, company_address = $6
      WHERE id = $7 AND user_id = $8
      RETURNING *`,
      [fullname, email, companyName, jobTitle, phoneNumber, companyAddress, cardId, userId]
    );

    console.log("✅ Card updated successfully:", result.rows[0]?.id);
    res.json({ message: "Card updated successfully", data: result.rows[0] });
  } catch (err) {
    console.error("❌ Update error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Delete an existing personal card
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params; 
  const userId = req.user.id; 

  try {
    const result = await pool.query(
      `DELETE FROM personal_cards WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Card not found or you're not authorized to delete it." });
    }

    console.log(`Card with ID ${id} deleted successfully for user ${userId}.`);
    res.json({ message: "Card deleted successfully!" });

  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ error: "Server error during card deletion." });
  }
});

// ✅ Get a specific personal card by ID - MUST BE LAST due to :id pattern
// ✅ Get a specific personal card by ID - MUST BE LAST
router.get('/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid card ID' });

  try {
    // verify ownership
    const exists = await pool.query(
      'SELECT id, user_id FROM personal_cards WHERE id = $1',
      [id]
    );
    if (!exists.rows.length || exists.rows[0].user_id !== userId) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // ⚠️ Use the same table name you used in /all (you used `template` there)
    const result = await pool.query(
      `SELECT 
          pc.id,
          pc.fullname,
          pc.email,
          pc.company_name    AS "companyName",
          pc.job_title       AS "jobTitle",
          pc.phone_number    AS "phoneNumber",
          pc.company_address AS "companyAddress",
          pc.template_id     AS "templateId",
          t.component_key    AS "component_key",
          pc.primary_color   AS "primaryColor",
          pc.secondary_color AS "secondaryColor",
          pc.logo,
          pc.profile_photo   AS "profilePhoto",
          pc.created_at
       FROM personal_cards pc
       LEFT JOIN template t ON t.id = pc.template_id   -- or templates if that's your actual table
       WHERE pc.id = $1 AND pc.user_id = $2`,
      [id, userId]
    );

    const row = result.rows[0];
    if (!row) return res.status(404).json({ error: 'Card not found' });

    if (row.logo) row.logo = Buffer.from(row.logo).toString('base64');
    if (row.profilePhoto) row.profilePhoto = Buffer.from(row.profilePhoto).toString('base64');

    return res.json({ data: row });
  } catch (error) {
    console.error('❌ Fetch card error:', error);
    return res.status(500).json({ error: 'Database error: ' + error.message });
  }
});


export default router;