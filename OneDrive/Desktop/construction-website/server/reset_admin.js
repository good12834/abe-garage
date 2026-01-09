const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetAdmin = async () => {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'construction_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log("Connected to database...");

        // 1. Delete existing admin
        await pool.query('DELETE FROM users WHERE username = ?', ['admin']);
        console.log("Existing admin user cleared.");

        // 2. Create hash for 'password123'
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insert new admin
        await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', hashedPassword]);

        console.log("✅ Admin user reset successfully!");
        console.log("Username: admin");
        console.log("Password: password123");

        await pool.end();
    } catch (err) {
        console.error("❌ Error resetting admin:", err.message);
    }
};

resetAdmin();
