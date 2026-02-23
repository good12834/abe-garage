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

const debugUser = async () => {
    let connection;
    try {
        console.log("Connecting to database...", dbConfig.database);
        connection = await mysql.createConnection(dbConfig);
        console.log("Connected.");

        const email = "admin@abegarage.com";
        const password = "admin123";

        console.log(`Checking for user: ${email}`);
        const [users] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            console.log("❌ User NOT FOUND.");

            console.log("Listing all users:");
            const [allUsers] = await connection.execute("SELECT id, email, role FROM users LIMIT 10");
            console.table(allUsers);
        } else {
            const user = users[0];
            console.log("✅ User FOUND:", { id: user.id, email: user.email, role: user.role, active: user.is_active });

            console.log("Checking password...");
            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (isMatch) {
                console.log("✅ Password MATCHES 'admin123'.");
            } else {
                console.log("❌ Password DOES NOT MATCH 'admin123'.");
                console.log("Hash in DB:", user.password_hash);

                // Generate new hash
                const newHash = await bcrypt.hash(password, 12);
                console.log("New hash for 'admin123':", newHash);
                console.log("To update, run: UPDATE users SET password_hash = '" + newHash + "' WHERE email = '" + email + "';");
            }
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (connection) await connection.end();
    }
};

debugUser();
