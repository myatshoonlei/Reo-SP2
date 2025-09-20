import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import pool from '../db.js';

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { cardType, cardId, teamId, primaryColor, secondaryColor } = req.body;

  // 🆕 Debugging log: What is the server receiving?
  console.log('Received request body:', req.body);

  if (!cardType) {
    return res.status(400).json({ error: 'Card type is missing.' });
  }

  // Determine the correct table and ID to use for the update
  let tableName;
  let updateId;
  let ownerCheck; // for security

  if (cardType === "Myself") {
    tableName = 'personal_cards';
    updateId = cardId;
    ownerCheck = 'AND user_id = $3'; // Add security check
  } else if (cardType === "Team") {
    tableName = 'team_cards';
    updateId = teamId;
    ownerCheck = ''; // No owner check here, as per our previous simplified query
    // You should add an owner check if your table supports it for better security:
    // ownerCheck = 'AND owner_id = $3';
  } else {
    return res.status(400).json({ error: 'Invalid card type' });
  }
  
  if (!updateId) {
    return res.status(400).json({ error: 'Card or team ID is missing from request body.' });
  }

  const queries = [];
  const queryValues = [];

  // Check and prepare query for primary color
  if (primaryColor) {
    let query = `UPDATE ${tableName} SET primary_color = $1 WHERE ${cardType === 'Team' ? 'teamid' : 'id'} = $2 ${ownerCheck}`;
    let values = [primaryColor, updateId];
    if (cardType === "Myself") {
      values.push(userId); // Add userId for the security check
    }
    queries.push(pool.query(query, values));
    queryValues.push({ query, values }); // for logging
  }

  // Check and prepare query for secondary color
  if (secondaryColor) {
    let query = `UPDATE ${tableName} SET secondary_color = $1 WHERE ${cardType === 'Team' ? 'teamid' : 'id'} = $2 ${ownerCheck}`;
    let values = [secondaryColor, updateId];
    if (cardType === "Myself") {
      values.push(userId); // Add userId for the security check
    }
    queries.push(pool.query(query, values));
    queryValues.push({ query, values }); // for logging
  }

  if (queries.length === 0) {
    return res.status(400).json({ error: 'No color data provided.' });
  }

  try {
    // 🆕 Debugging log: What queries are about to be executed?
    console.log('Executing queries:', queryValues);
    
    // Execute all prepared queries concurrently
    await Promise.all(queries);

    res.json({ message: 'Color(s) saved successfully!' });

  } catch (err) {
    console.error('Save color error:', err);
    res.status(500).json({ error: 'Failed to save color' });
  }
});

export default router;