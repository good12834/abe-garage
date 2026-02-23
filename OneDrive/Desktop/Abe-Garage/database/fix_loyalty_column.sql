-- Fix for loyalty_points column duplicate error
-- This script handles the case where the column might already exist

USE abe_garage;

-- Method 1: Check if column exists before adding it
-- This is the safest approach
SET @sql = CONCAT('ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_points INT DEFAULT 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the column was added/exists
DESCRIBE users;