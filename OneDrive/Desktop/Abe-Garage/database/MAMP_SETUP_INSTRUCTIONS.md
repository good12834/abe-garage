# MAMP Database Setup Instructions

## How to Import the Complete Database to MAMP

### Step 1: Start MAMP

1. Open MAMP application
2. Start the Apache Server and MySQL Server
3. Make sure both servers show green status

### Step 2: Access phpMyAdmin

1. Open your web browser
2. Go to: `http://localhost:8888/phpMyAdmin/`
3. You should see the phpMyAdmin interface

### Step 3: Create New Database

1. Click on "New" in the left sidebar
2. Enter database name: `abe_garage`
3. Click "Create"

### Step 4: Import the SQL File

1. Select the `abe_garage` database in the left sidebar
2. Click on the "Import" tab at the top
3. Click "Choose File" and select `mamp_complete_setup.sql` from your project
4. Click "Go" to import

### Step 5: Verify Installation

After import, you should see these tables created:

- `users` (with loyalty_points column included)
- `services`
- `mechanics`
- `appointments`
- `service_updates`
- `invoices`
- `invoice_items`
- `parts`
- `service_history`
- `service_recommendations`
- `chat_messages`
- `service_photos`
- `loyalty_transactions`

### Step 6: Test Default Data

The file includes default data:

- Default admin user: `admin@abegarage.com` (password: admin123)
- Sample mechanics
- Default services
- Sample parts inventory

### Connection Settings for Your Application

Update your server `.env` file with these MAMP settings:

```
DB_HOST=localhost
DB_PORT=8889
DB_NAME=abe_garage
DB_USER=root
DB_PASS=root
```

**Note:** MAMP MySQL default port is 8889, not 3306

### Troubleshooting

- If you get "Access denied" errors, try using user: `root` with password: `root`
- If port 8889 doesn't work, try port 3306
- Make sure MAMP MySQL server is running (green status)

### What's Included

✅ All main tables (users, services, mechanics, appointments)
✅ Advanced features (chat, service history, parts inventory)
✅ Loyalty points system (no duplicate column errors)
✅ Default data and sample records
✅ Performance indexes
✅ Useful database views
✅ Stored procedures for common operations
✅ Foreign key relationships

This complete setup eliminates the duplicate column error and provides a fully functional database for your Abe Garage application.
