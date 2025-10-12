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
    template_id,
    primaryColor,
    secondaryColor,
    logo,
    qr,
  } = req.body;
  const userId = req.user.id;



  let logoBuffer = null;
  if (logo) {
    try {
      const base64Data = logo.split(",")[1];
      logoBuffer = Buffer.from(base64Data, "base64");
    } catch (e) {

      return res.status(400).json({ error: "Invalid logo data format" });
    }
  }

  try {
    const insertQuery = `
      INSERT INTO personal_cards 
        (user_id, fullname, email, company_name, job_title, phone_number,
         company_address, template_id, primary_color, secondary_color, logo, qr)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`;
    const result = await pool.query(insertQuery, [
      userId,
      fullname,
      email,
      companyName,
      jobTitle,
      phoneNumber,
      companyAddress,
      template_id,
      primaryColor,
      secondaryColor,
      logoBuffer,
      qr,
    ]);

    res.json({ message: "Card created successfully!", data: result.rows[0] });
  } catch (err) {
    console.error("❌ Save error:", err.message);

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

// ✅ Get personal card details
router.get("/details", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT p.* FROM personal_cards p WHERE p.user_id = $1 ORDER BY p.id DESC LIMIT 1`,
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

  const userId = req.user.id;



  const cardId = Number(id);
  if (!Number.isFinite(cardId)) return res.status(400).json({ error: "Invalid card ID" });

  // normalize names coming from client (camel OR snake)
  const b = req.body || {};
  const vals = {
    fullname: b.fullname,
    email: b.email,
    company_name: b.company_name ?? b.companyName,
    job_title: b.job_title ?? b.jobTitle,
    phone_number: b.phone_number ?? b.phoneNumber,
    company_address: b.company_address ?? b.companyAddress,
    template_id: b.template_id ?? b.templateId,
    primary_color: b.primary_color ?? b.primaryColor,
    secondary_color: b.secondary_color ?? b.secondaryColor,
    font_family: b.font_family ?? b.fontFamily,     // present in your pgAdmin
    website: b.website,
    linkedin: b.linkedin,
    github: b.github,
    clearProfile: b.clearProfile === true,
    clearLogo: b.clearLogo === true,
  };

  try {
    // ownership
    const own = await pool.query(`SELECT id FROM personal_cards WHERE id=$1 AND user_id=$2`, [cardId, userId]);
    if (!own.rowCount) return res.status(404).json({ error: "Card not found or Unauthorized" });

    // validate/normalize template_id to a UUID or null
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const safeTemplateId =
      typeof vals.template_id === "string" && uuidRe.test(vals.template_id)
        ? vals.template_id
        : null;

    // use NULLIF to avoid empty-string overwrites
    const sql = `
      UPDATE personal_cards
         SET fullname        = COALESCE(NULLIF($1 ,''), fullname),
             email           = COALESCE(NULLIF($2 ,''), email),
             company_name    = COALESCE(NULLIF($3 ,''), company_name),
             job_title       = COALESCE(NULLIF($4 ,''), job_title),
             phone_number    = COALESCE(NULLIF($5 ,''), phone_number),
             company_address = COALESCE(NULLIF($6 ,''), company_address),
             template_id     = COALESCE($7::uuid, template_id),
             primary_color   = COALESCE(NULLIF($8 ,''), primary_color),
             secondary_color = COALESCE(NULLIF($9 ,''), secondary_color),
             font_family     = COALESCE(NULLIF($10,''), font_family),
             website         = COALESCE(NULLIF($11,''), website),
             linkedin        = COALESCE(NULLIF($12,''), linkedin),
             github          = COALESCE(NULLIF($13,''), github),
             profile_photo   = CASE WHEN $14 THEN NULL ELSE profile_photo END,
             logo            = CASE WHEN $15 THEN NULL ELSE logo END,
             updated_at      = NOW()
       WHERE id = $16 AND user_id = $17
       RETURNING *`;

    const params = [
      vals.fullname,
      vals.email,
      vals.company_name,
      vals.job_title,
      vals.phone_number,
      vals.company_address,
      safeTemplateId,
      vals.primary_color,
      vals.secondary_color,
      vals.font_family,
      vals.website,
      vals.linkedin,
      vals.github,
      vals.clearProfile,
      vals.clearLogo,
      cardId,
      userId,
    ];

    const result = await pool.query(sql, params);
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
          pc.created_at,
          pc.font_family     AS "fontFamily",
          pc.website,
          pc.linkedin,
          pc.github,
          pc.qr
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