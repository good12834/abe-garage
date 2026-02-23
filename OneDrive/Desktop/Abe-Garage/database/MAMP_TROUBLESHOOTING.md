# MAMP Database Troubleshooting Guide

## Problem: No tables appearing in MAMP server

### Step-by-Step Debugging

#### 1. Check if MAMP is Running Properly

- Open MAMP application
- Make sure Apache Server and MySQL Server show **GREEN** status
- If red, try restarting both servers

#### 2. Check phpMyAdmin Access

- Go to: `http://localhost:8888/phpMyAdmin/`
- You should see phpMyAdmin interface
- If not working, try: `http://localhost/phpMyAdmin/`

#### 3. Create Database First

1. In phpMyAdmin, click **"New"** in left sidebar
2. Enter database name: `abe_garage`
3. Click **"Create"**
4. Select `abe_garage` from left sidebar

#### 4. Import the Basic SQL File

**Use `mamp_basic_setup.sql` first (it's simpler)**

1. Select `abe_garage` database in left sidebar
2. Click **"Import"** tab at top
3. Click **"Choose File"**
4. Select `database/mamp_basic_setup.sql`
5. Click **"Go"**
6. Look for green success message

#### 5. Check if Tables Were Created

After import, look in left sidebar - you should see:

- `appointments`
- `mechanics`
- `services`
- `users`

**If NO tables appear:**

- Check for error messages (red text)
- The import may have failed

#### 6. Alternative: Manual Table Creation

If import still fails, create tables manually:

1. Select `abe_garage` database
2. Click **"SQL"** tab
3. Copy and paste this simple code:

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, password_hash, first_name, last_name) VALUES
('admin@test.com', 'test123', 'Admin', 'User');
```

4. Click **"Go"**

#### 7. Check MySQL Port

- In MAMP, go to **Preferences → Ports**
- Note the MySQL port (usually 8889)
- Update your application `.env` file:
  ```
  DB_PORT=8889
  ```

#### 8. Test Database Connection

Create a test PHP file to check connection:

```php
<?php
$host = 'localhost';
$port = '8889';
$dbname = 'abe_garage';
$username = 'root';
$password = 'root';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    echo "Database connection successful!";

    // Test query
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables found: " . implode(", ", $tables);

} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
```

Save as `test_db.php` in MAMP's htdocs folder and visit `http://localhost:8888/test_db.php`

#### 9. Common Issues & Solutions

**Issue:** "Access denied for user 'root'@'localhost'"

- **Solution:** Try password: `root` or empty password

**Issue:** "Can't connect to MySQL server"

- **Solution:** Check if MySQL is running in MAMP (green status)

**Issue:** "Unknown database 'abe_garage'"

- **Solution:** Create the database first before importing

**Issue:** Import timeout

- **Solution:** Try the basic SQL file instead of the complete one

#### 10. Success Checklist

✅ MAMP servers running (green status)
✅ phpMyAdmin accessible
✅ Database `abe_garage` created
✅ Tables visible in left sidebar
✅ Test data present (admin user exists)
✅ Application can connect to database

### Quick Fix Commands

If nothing works, try these in phpMyAdmin SQL tab:

```sql
-- Create database
CREATE DATABASE abe_garage;

-- Use database
USE abe_garage;

-- Create single table
CREATE TABLE test_table (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100)
);

-- Insert test data
INSERT INTO test_table (name) VALUES ('Test Entry');

-- Verify
SELECT * FROM test_table;
```

If this works, then your MAMP setup is correct and we can troubleshoot the import process.
