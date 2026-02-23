import express from "express";
import { v4 as uuidv4 } from "uuid";
import { authenticateToken } from "../middleware/auth.js";
import { executeQuery as query } from "../config/database.js";

const router = express.Router();

// Generate referral code for user
router.post("/generate-code", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = req.user;

    // Create unique referral code based on user name
    const baseCode = (user.first_name || user.email)
      .substring(0, 3)
      .toUpperCase();
    const uniqueCode = `${baseCode}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Check if user already has a referral code
    const existing = await query(
      "SELECT * FROM referrals WHERE referrer_id = ?",
      [userId],
    );

    if (existing.length > 0) {
      return res.json({
        message: "Referral code already exists",
        referral_code: existing[0].referral_code,
        referral_id: existing[0].id,
      });
    }

    const result = await query(
      `
      INSERT INTO referrals (referrer_id, referral_code, status)
      VALUES (?, ?, 'active')
    `,
      [userId, uniqueCode],
    );

    res.status(201).json({
      message: "Referral code generated successfully",
      referral_code: uniqueCode,
      referral_id: result.insertId,
    });
  } catch (error) {
    console.error("Error generating referral code:", error);
    res.status(500).json({ error: "Failed to generate referral code" });
  }
});

// Get user's referral info
router.get("/my-referrals", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get referrer info (who referred this user)
    const referredBy = await query(
      `
      SELECT r.*, u.first_name, u.last_name, rr.reward_value, rr.reward_type
      FROM referrals r
      LEFT JOIN users u ON r.referrer_id = u.id
      LEFT JOIN referral_rewards rr ON r.id = rr.referral_id
      WHERE r.referred_user_id = ?
    `,
      [userId],
    );

    // Get people this user referred
    const referredOthers = await query(
      `
      SELECT r.*, u.email, u.first_name, u.last_name
      FROM referrals r
      LEFT JOIN users u ON r.referred_user_id = u.id
      WHERE r.referrer_id = ?
      ORDER BY r.created_at DESC
    `,
      [userId],
    );

    // Get referral rewards
    const rewards = await query(
      `
      SELECT * FROM referral_rewards 
      WHERE user_id = ? AND is_used = FALSE
      ORDER BY created_at DESC
    `,
      [userId],
    );

    // Get referral stats
    const stats = await query(
      `
      SELECT 
        COUNT(*) as total_referrals,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_referrals,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_referrals,
        SUM(CASE WHEN reward_given = TRUE THEN reward_amount ELSE 0 END) as total_rewards_given
      FROM referrals 
      WHERE referrer_id = ?
    `,
      [userId],
    );

    res.json({
      referred_by: referredBy[0] || null,
      referred_others: referredOthers,
      rewards: rewards,
      stats: stats[0] || {
        total_referrals: 0,
        successful_referrals: 0,
        pending_referrals: 0,
        total_rewards_given: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching referrals:", error);
    res.status(500).json({ error: "Failed to fetch referrals" });
  }
});

// Use referral code during registration
router.post("/use-code", async (req, res) => {
  try {
    const { referral_code, referred_email } = req.body;

    // Find the referral
    const referrals = await query(
      `
      SELECT r.*, u.id as referrer_id, u.email as referrer_email
      FROM referrals r
      JOIN users u ON r.referrer_id = u.id
      WHERE r.referral_code = ? AND r.status = 'pending'
    `,
      [referral_code.toUpperCase()],
    );

    if (referrals.length === 0) {
      return res.status(404).json({ error: "Invalid referral code" });
    }

    const referral = referrals[0];

    // Check if already used
    if (referral.referred_user_id) {
      return res
        .status(400)
        .json({ error: "This referral code has already been used" });
    }

    // Get referred user by email
    const newUser = await query("SELECT id, email FROM users WHERE email = ?", [
      referred_email,
    ]);

    if (newUser.length === 0) {
      return res.status(404).json({ error: "User with this email not found" });
    }

    // Update referral
    await query(
      `
      UPDATE referrals 
      SET referred_user_id = ?, status = 'completed', completed_at = NOW()
      WHERE id = ?
    `,
      [newUser[0].id, referral.id],
    );

    // Create reward for referrer (default: 10% discount or 500 points)
    const rewardValue = 500; // loyalty points
    await query(
      `
      INSERT INTO referral_rewards (user_id, referral_id, reward_type, reward_value, description, expires_at)
      VALUES (?, ?, 'points', ?, 'Referral bonus', DATE_ADD(NOW(), INTERVAL 30 DAY))
    `,
      [referral.referrer_id, referral.id, rewardValue],
    );

    // Update referral status
    await query(
      "UPDATE referrals SET reward_given = TRUE, reward_amount = ? WHERE id = ?",
      [rewardValue, referral.id],
    );

    res.json({
      message: "Referral code applied successfully",
      reward_given: rewardValue,
    });
  } catch (error) {
    console.error("Error using referral code:", error);
    res.status(500).json({ error: "Failed to use referral code" });
  }
});

// Get referral rewards
router.get("/rewards", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const rewards = await query(
      `
      SELECT * FROM referral_rewards 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
      [userId],
    );

    res.json(rewards);
  } catch (error) {
    console.error("Error fetching rewards:", error);
    res.status(500).json({ error: "Failed to fetch rewards" });
  }
});

// Use reward
router.post("/rewards/:id/use", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const rewards = await query(
      `
      SELECT * FROM referral_rewards 
      WHERE id = ? AND user_id = ? AND is_used = FALSE
    `,
      [id, userId],
    );

    if (rewards.length === 0) {
      return res
        .status(404)
        .json({ error: "Reward not found or already used" });
    }

    const reward = rewards[0];

    // Check expiration
    if (reward.expires_at && new Date(reward.expires_at) < new Date()) {
      return res.status(400).json({ error: "Reward has expired" });
    }

    // Mark as used
    await query(
      `
      UPDATE referral_rewards SET is_used = TRUE, used_at = NOW() WHERE id = ?
    `,
      [id],
    );

    res.json({
      message: "Reward used successfully",
      reward: {
        type: reward.reward_type,
        value: reward.reward_value,
      },
    });
  } catch (error) {
    console.error("Error using reward:", error);
    res.status(500).json({ error: "Failed to use reward" });
  }
});

// Admin: Get all referrals (admin)
router.get("/admin/all", authenticateToken, async (req, res) => {
  try {
    const referrals = await query(`
      SELECT r.*, 
        referrer.email as referrer_email, referrer.first_name as referrer_first_name,
        referred.email as referred_email, referred.first_name as referred_first_name
      FROM referrals r
      JOIN users referrer ON r.referrer_id = referrer.id
      LEFT JOIN users referred ON r.referred_user_id = referred.id
      ORDER BY r.created_at DESC
      LIMIT 100
    `);

    res.json(referrals);
  } catch (error) {
    console.error("Error fetching all referrals:", error);
    res.status(500).json({ error: "Failed to fetch referrals" });
  }
});

// Admin: Create manual referral (admin)
router.post("/admin/create", authenticateToken, async (req, res) => {
  try {
    const { referrer_id, referred_email, reward_type, reward_value } = req.body;

    // Generate unique code
    const uniqueCode = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const result = await query(
      `
      INSERT INTO referrals (referrer_id, referred_email, referral_code, status)
      VALUES (?, ?, ?, 'pending')
    `,
      [referrer_id, referred_email, uniqueCode],
    );

    res.status(201).json({
      message: "Referral created successfully",
      referral_id: result.insertId,
      referral_code: uniqueCode,
    });
  } catch (error) {
    console.error("Error creating referral:", error);
    res.status(500).json({ error: "Failed to create referral" });
  }
});

export default router;
