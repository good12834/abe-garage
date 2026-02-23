import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { executeQuery as query } from "../config/database.js";

const router = express.Router();

// Dashboard stats (overview)
router.get("/dashboard", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Today's stats
    const today = await query(`
      SELECT 
        COUNT(*) as today_appointments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_today,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_today,
        SUM(discounted_price) as today_revenue
      FROM appointments 
      WHERE DATE(created_at) = CURDATE()
    `);

    // This week's stats
    const thisWeek = await query(`
      SELECT 
        COUNT(*) as week_appointments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_week,
        SUM(discounted_price) as week_revenue
      FROM appointments 
      WHERE YEARWEEK(created_at) = YEARWEEK(NOW())
    `);

    // This month's stats
    const thisMonth = await query(`
      SELECT 
        COUNT(*) as month_appointments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_month,
        SUM(discounted_price) as month_revenue
      FROM appointments 
      WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())
    `);

    // Active users
    const activeUsers = await query(`
      SELECT COUNT(*) as total_users FROM users WHERE role = 'customer'
    `);

    // Vehicles count
    const vehiclesCount = await query(
      `SELECT COUNT(*) as total_vehicles FROM vehicles`,
    );

    res.json({
      today: today[0],
      this_week: thisWeek[0],
      this_month: thisMonth[0],
      total_users: activeUsers[0]?.total_users || 0,
      total_vehicles: vehiclesCount[0]?.total_vehicles || 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// Revenue analytics
router.get("/revenue", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = "month" } = req.query;

    let groupBy;
    let dateFilter;

    if (period === "week") {
      groupBy = "DATE(created_at)";
      dateFilter = "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } else if (period === "month") {
      groupBy = "DATE(created_at)";
      dateFilter = "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    } else if (period === "year") {
      groupBy = "MONTH(created_at)";
      dateFilter = "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
    } else {
      groupBy = "DATE(created_at)";
      dateFilter = "";
    }

    const revenue = await query(`
      SELECT ${groupBy} as period,
        SUM(discounted_price) as revenue,
        COUNT(*) as appointments,
        AVG(discounted_price) as avg_order
      FROM appointments
      ${dateFilter}
      GROUP BY ${groupBy}
      ORDER BY created_at ASC
    `);

    // Total stats
    const totals = await query(`
      SELECT 
        SUM(discounted_price) as total_revenue,
        COUNT(*) as total_appointments,
        AVG(discounted_price) as avg_order_value
      FROM appointments
      ${dateFilter.replace("created_at", "created_at").replace("WHERE", 'WHERE status = "completed" AND')}
    `);

    res.json({
      period,
      chart_data: revenue,
      totals: totals[0],
    });
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    res.status(500).json({ error: "Failed to fetch revenue analytics" });
  }
});

// Services analytics
router.get("/services", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Most popular services
    const popularServices = await query(`
      SELECT s.id, s.name, COUNT(*) as usage_count, SUM(a.discounted_price) as total_revenue
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      GROUP BY s.id
      ORDER BY usage_count DESC
      LIMIT 10
    `);

    // Services by revenue
    const revenueByService = await query(`
      SELECT s.id, s.name, SUM(a.discounted_price) as revenue
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.status = 'completed'
      GROUP BY s.id
      ORDER BY revenue DESC
    `);

    res.json({
      popular_services: popularServices,
      revenue_by_service: revenueByService,
    });
  } catch (error) {
    console.error("Error fetching service analytics:", error);
    res.status(500).json({ error: "Failed to fetch service analytics" });
  }
});

// Customer analytics
router.get("/customers", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // New customers this month
    const newCustomers = await query(`
      SELECT COUNT(*) as count FROM users 
      WHERE role = 'customer' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    // Customers by activity
    const activeCustomers = await query(`
      SELECT COUNT(DISTINCT user_id) as active_customers
      FROM appointments
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    `);

    // Top customers by spending
    const topCustomers = await query(`
      SELECT u.id, u.first_name, u.last_name, u.email, 
        COUNT(*) as total_appointments,
        SUM(a.discounted_price) as total_spent
      FROM users u
      JOIN appointments a ON u.id = a.user_id
      WHERE a.status = 'completed'
      GROUP BY u.id
      ORDER BY total_spent DESC
      LIMIT 10
    `);

    // Customer retention
    const retention = await query(`
      SELECT 
        COUNT(*) as total_customers,
        SUM(CASE WHEN last_appointment >= DATE_SUB(NOW(), INTERVAL 6 MONTH) THEN 1 ELSE 0 END) as retained,
        SUM(CASE WHEN last_appointment < DATE_SUB(NOW(), INTERVAL 6 MONTH) THEN 1 ELSE 0 END) as churned
      FROM (
        SELECT user_id, MAX(created_at) as last_appointment
        FROM appointments
        GROUP BY user_id
      ) t
    `);

    res.json({
      new_customers: newCustomers[0]?.count || 0,
      active_customers: activeCustomers[0]?.active_customers || 0,
      top_customers: topCustomers,
      retention: retention[0] || {
        total_customers: 0,
        retained: 0,
        churned: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching customer analytics:", error);
    res.status(500).json({ error: "Failed to fetch customer analytics" });
  }
});

// Appointment analytics
router.get(
  "/appointments",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      // Appointments by status
      const byStatus = await query(`
      SELECT status, COUNT(*) as count
      FROM appointments
      GROUP BY status
    `);

      // Appointments by day of week
      const byDay = await query(`
      SELECT DAYNAME(created_at) as day, COUNT(*) as count
      FROM appointments
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DAYNAME(created_at)
      ORDER BY FIELD(DAYNAME(created_at), 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
    `);

      // Average wait time (from booking to completion)
      const avgWaitTime = await query(`
      SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, completed_at)) as avg_hours
      FROM appointments
      WHERE status = 'completed' AND completed_at IS NOT NULL
    `);

      // Completion rate
      const completionRate = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM appointments
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

      res.json({
        by_status: byStatus,
        by_day_of_week: byDay,
        avg_completion_hours: avgWaitTime[0]?.avg_hours || 0,
        completion_rate: completionRate[0],
      });
    } catch (error) {
      console.error("Error fetching appointment analytics:", error);
      res.status(500).json({ error: "Failed to fetch appointment analytics" });
    }
  },
);

// Mechanic performance
router.get("/mechanics", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const performance = await query(`
      SELECT m.id, m.name, m.specialization,
        COUNT(a.id) as total_jobs,
        SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed_jobs,
        AVG(a.rating) as avg_rating,
        SUM(a.discounted_price) as revenue_generated
      FROM mechanics m
      LEFT JOIN appointments a ON m.id = a.assigned_mechanic_id
      GROUP BY m.id
      ORDER BY completed_jobs DESC
    `);

    res.json(performance);
  } catch (error) {
    console.error("Error fetching mechanic performance:", error);
    res.status(500).json({ error: "Failed to fetch mechanic performance" });
  }
});

// Track event
router.post("/track", async (req, res) => {
  try {
    const { event_type, event_data } = req.body;

    await query(
      `
      INSERT INTO analytics_events (event_type, user_id, event_data, ip_address)
      VALUES (?, ?, ?, ?)
    `,
      [
        event_type,
        req.user?.id || null,
        JSON.stringify(event_data || {}),
        req.ip,
      ],
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error tracking event:", error);
    res.status(500).json({ error: "Failed to track event" });
  }
});

// Get tracked events
router.get("/events", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { event_type, limit = 100 } = req.query;

    let sql = `
      SELECT * FROM analytics_events
    `;

    if (event_type) {
      sql += ` WHERE event_type = '${event_type}'`;
    }

    sql += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)}`;

    const events = await query(sql);

    // Parse JSON event_data
    const parsed = events.map((e) => ({
      ...e,
      event_data:
        typeof e.event_data === "string"
          ? JSON.parse(e.event_data)
          : e.event_data,
    }));

    res.json(parsed);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

export default router;
