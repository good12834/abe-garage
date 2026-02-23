import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 8889,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "abe_garage",
};

const resetPassword = async () => {
    let connection;
    try {
        console.log("Connecting to database...", dbConfig.database);
        connection = await mysql.createConnection(dbConfig);
        console.log("Connected.");

        const email = "admin@abegarage.com";
        const password = "admin123";
        const hashedPassword = await bcrypt.hash(password, 12);

        console.log(`Updating password for ${email}...`);
        const [result] = await connection.execute(
            "UPDATE users SET password_hash = ? WHERE email = ?",
            [hashedPassword, email]
        );

        if (result.affectedRows > 0) {
            console.log("✅ Password successfully updated to 'admin123'.");
        } else {
            console.log("❌ Failed to update password. User not found?");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (connection) await connection.end();
    }
};

resetPassword();
