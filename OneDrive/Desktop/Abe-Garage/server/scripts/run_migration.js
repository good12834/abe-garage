import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { closeConnection } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, '../../database/create_payments_table.sql');
        console.log(`Reading SQL file from: ${sqlPath}`);

        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon to handle multiple statements
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        console.log(`Found ${statements.length} SQL statements to execute.`);

        for (const statement of statements) {
            // Skip USE statement as we are already connected to the DB or let it fail gently if not allowed
            if (statement.toUpperCase().startsWith('USE ')) {
                console.log('Skipping USE statement (handled by connection config)');
                continue;
            }

            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await pool.query(statement);
            console.log('✅ Success');
        }

        console.log('🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await closeConnection();
    }
};

runMigration();
