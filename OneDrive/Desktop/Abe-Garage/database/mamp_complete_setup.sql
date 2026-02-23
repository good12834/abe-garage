-- ==================================================
-- ABE GARAGE DATABASE SETUP FOR MAMP
-- Complete database setup with all tables and fixes
-- ==================================================

-- Create and use the database
CREATE DATABASE IF NOT EXISTS abe_garage;
USE abe_garage;

-- ==================================================
-- MAIN DATABASE SCHEMA
-- ==================================================

-- Users Table (Customers, Admins, Mechanics)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'admin', 'mechanic') DEFAULT 'customer',
    loyalty_points INT DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0.00,
    last_service_date DATE NULL,
    car_mileage INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_loyalty_points (loyalty_points)
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    duration_minutes INT DEFAULT 60,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_active (is_active)
);

-- Mechanics Table
CREATE TABLE IF NOT EXISTS mechanics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    specialties TEXT,
    hourly_rate DECIMAL(8, 2),
    is_active BOOLEAN DEFAULT TRUE,
    hire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    mechanic_id INT,
    service_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    status ENUM('pending', 'approved', 'in_service', 'completed', 'cancelled') DEFAULT 'pending',
    car_brand VARCHAR(100),
    car_model VARCHAR(100),
    car_year INT,
    problem_description TEXT,
    estimated_cost DECIMAL(10, 2),
    final_cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mechanic_id) REFERENCES mechanics(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
    INDEX idx_customer (customer_id),
    INDEX idx_mechanic (mechanic_id),
    INDEX idx_service (service_id),
    INDEX idx_date (appointment_date),
    INDEX idx_status (status)
);

-- Service Updates Table (Progress tracking)
CREATE TABLE IF NOT EXISTS service_updates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    mechanic_id INT,
    update_type ENUM('status_change', 'progress_note', 'completion', 'issue_reported') NOT NULL,
    status ENUM('pending', 'approved', 'in_service', 'completed', 'cancelled'),
    message TEXT,
    updated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (mechanic_id) REFERENCES mechanics(id) ON DELETE SET NULL,
    INDEX idx_appointment (appointment_id),
    INDEX idx_type (update_type)
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_rate DECIMAL(5, 4) DEFAULT 0.0800, -- 8% tax rate
    tax_amount DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'partially_paid', 'refunded') DEFAULT 'pending',
    payment_method ENUM('cash', 'credit_card', 'debit_card', 'bank_transfer', 'insurance'),
    payment_date DATETIME,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    INDEX idx_appointment (appointment_id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_payment_status (payment_status)
);

-- Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    INDEX idx_invoice (invoice_id)
);

-- ==================================================
-- ADVANCED FEATURES TABLES
-- ==================================================

-- Parts Inventory Table
CREATE TABLE IF NOT EXISTS parts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    part_number VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    unit_price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 5,
    supplier VARCHAR(255),
    supplier_contact VARCHAR(255),
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_part_number (part_number),
    INDEX idx_category (category),
    INDEX idx_brand (brand),
    INDEX idx_active (is_active)
);

-- Service History & Recommendations
CREATE TABLE IF NOT EXISTS service_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    appointment_id INT,
    service_id INT NOT NULL,
    car_brand VARCHAR(100),
    car_model VARCHAR(100),
    car_year INT,
    service_date DATE NOT NULL,
    mileage_at_service INT,
    cost DECIMAL(10, 2),
    parts_used JSON,
    recommendations JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
    INDEX idx_user (user_id),
    INDEX idx_service_date (service_date)
);

-- Customer Service Recommendations
CREATE TABLE IF NOT EXISTS service_recommendations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    car_brand VARCHAR(100),
    car_model VARCHAR(100),
    car_year INT,
    recommendation_type ENUM('mileage_based', 'time_based', 'weather_based', 'seasonal') NOT NULL,
    reason TEXT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    expires_at DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
    INDEX idx_user (user_id),
    INDEX idx_type (recommendation_type),
    INDEX idx_read (is_read)
);

-- Chat Messages for Customer-Mechanic Communication
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_role ENUM('customer', 'admin', 'mechanic') NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file') DEFAULT 'text',
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    read_by JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_appointment (appointment_id),
    INDEX idx_sender (sender_id),
    INDEX idx_created (created_at)
);

-- Before/After Photos for Services
CREATE TABLE IF NOT EXISTS service_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    photo_type ENUM('before', 'during', 'after') NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    uploaded_by INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_appointment (appointment_id),
    INDEX idx_type (photo_type)
);

-- Loyalty Program Transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    transaction_type ENUM('earned', 'redeemed', 'expired', 'adjusted') NOT NULL,
    points INT NOT NULL,
    description VARCHAR(255),
    related_appointment_id INT,
    expires_at DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_type (transaction_type),
    INDEX idx_expires (expires_at)
);

-- ==================================================
-- INSERT DEFAULT DATA
-- ==================================================

-- Insert default services if services table is empty
INSERT IGNORE INTO services (name, description, base_price, duration_minutes, category) VALUES
('Oil Change', 'Complete oil and filter change service', 50.00, 30, 'Maintenance'),
('Brake Inspection', 'Comprehensive brake system inspection', 75.00, 45, 'Safety'),
('Engine Diagnostics', 'Computerized engine diagnostic check', 120.00, 60, 'Diagnostics'),
('Transmission Service', 'Transmission fluid and filter replacement', 200.00, 120, 'Maintenance'),
('Tire Installation', 'New tire mounting and balancing', 25.00, 30, 'Tires'),
('Air Conditioning Service', 'AC system inspection and recharge', 150.00, 90, 'Comfort'),
('Brake Pad Replacement', 'Front or rear brake pad replacement', 180.00, 90, 'Safety'),
('Battery Replacement', 'Battery testing and replacement service', 120.00, 45, 'Electrical'),
('Spark Plug Replacement', 'Spark plug replacement and engine tune-up', 80.00, 60, 'Engine'),
('Car Wash & Detail', 'Complete exterior and interior car wash', 40.00, 90, 'Detailing');

-- Insert default admin user if not exists (password: admin123 - should be changed in production)
INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@abegarage.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin');

-- Insert sample mechanics if mechanics table is empty
INSERT IGNORE INTO mechanics (first_name, last_name, email, phone, specialties, hourly_rate, hire_date) VALUES
('John', 'Smith', 'john.smith@abegarage.com', '555-0101', 'Engine Repair, Diagnostics', 45.00, '2020-01-15'),
('Sarah', 'Johnson', 'sarah.johnson@abegarage.com', '555-0102', 'Brake Systems, Suspension', 50.00, '2019-06-10'),
('Mike', 'Davis', 'mike.davis@abegarage.com', '555-0103', 'Transmission, Oil Changes', 42.00, '2021-03-22'),
('Lisa', 'Wilson', 'lisa.wilson@abegarage.com', '555-0104', 'Electrical Systems, AC Repair', 48.00, '2020-09-01');

-- Insert sample parts if parts table is empty
INSERT IGNORE INTO parts (name, description, part_number, category, brand, unit_price, stock_quantity, supplier) VALUES
('Oil Filter', 'Standard oil filter for most vehicles', 'OF-001', 'Filters', 'Bosch', 15.99, 50, 'AutoParts Co'),
('Brake Pads Front', 'Ceramic brake pads for front wheels', 'BP-F001', 'Brakes', 'Akebono', 89.99, 25, 'Brake Systems Ltd'),
('Spark Plugs Set', 'Set of 4 platinum spark plugs', 'SP-004', 'Engine', 'NGK', 45.99, 40, 'Performance Parts'),
('Air Filter', 'Engine air filter', 'AF-001', 'Filters', 'K&N', 32.99, 30, 'Filter World'),
('Transmission Fluid', 'Automatic transmission fluid (1L)', 'TF-001', 'Fluids', 'Mobil', 24.99, 60, 'Lubricants Inc');

-- ==================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==================================================

CREATE INDEX idx_users_email_role ON users(email, role);
CREATE INDEX idx_appointments_date_status ON appointments(appointment_date, status);
CREATE INDEX idx_service_updates_appointment_created ON service_updates(appointment_id, created_at);
CREATE INDEX idx_parts_category_stock ON parts(category, stock_quantity);
CREATE INDEX idx_service_history_user_date ON service_history(user_id, service_date);
CREATE INDEX idx_chat_appointment_created ON chat_messages(appointment_id, created_at);

-- ==================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- ==================================================

-- Appointment Details View
CREATE OR REPLACE VIEW appointment_details AS
SELECT 
    a.id,
    a.appointment_date,
    a.status,
    a.car_brand,
    a.car_model,
    a.car_year,
    a.problem_description,
    a.estimated_cost,
    a.final_cost,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone,
    s.name AS service_name,
    s.base_price AS service_price,
    s.duration_minutes,
    CONCAT(m.first_name, ' ', m.last_name) AS mechanic_name,
    m.phone AS mechanic_phone
FROM appointments a
JOIN users c ON a.customer_id = c.id
JOIN services s ON a.service_id = s.id
LEFT JOIN mechanics m ON a.mechanic_id = m.id;

-- Customer Service History View
CREATE OR REPLACE VIEW customer_service_history AS
SELECT 
    sh.id,
    sh.user_id,
    sh.appointment_id,
    sh.service_id,
    s.name as service_name,
    s.category as service_category,
    sh.car_brand,
    sh.car_model,
    sh.car_year,
    sh.service_date,
    sh.mileage_at_service,
    sh.cost,
    sh.parts_used,
    sh.recommendations,
    sh.notes,
    sh.created_at,
    CONCAT(u.first_name, ' ', u.last_name) as customer_name
FROM service_history sh
JOIN services s ON sh.service_id = s.id
JOIN users u ON sh.user_id = u.id;

-- ==================================================
-- CREATE STORED PROCEDURES
-- ==================================================

-- Procedure to generate invoice numbers
DELIMITER //

DROP PROCEDURE IF EXISTS GenerateInvoiceNumber //
CREATE PROCEDURE GenerateInvoiceNumber(OUT invoice_num VARCHAR(50))
BEGIN
    DECLARE date_part VARCHAR(8);
    DECLARE sequence_part VARCHAR(4);
    DECLARE current_seq INT;
    
    SET date_part = DATE_FORMAT(NOW(), '%Y%m%d');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number, 9, 4) AS UNSIGNED)), 0) + 1
    INTO current_seq
    FROM invoices
    WHERE invoice_number LIKE CONCAT(date_part, '%');
    
    SET sequence_part = LPAD(current_seq, 4, '0');
    SET invoice_num = CONCAT('INV-', date_part, '-', sequence_part);
END //

-- Procedure to update customer loyalty points
DROP PROCEDURE IF EXISTS UpdateCustomerLoyaltyPoints //
CREATE PROCEDURE UpdateCustomerLoyaltyPoints(
    IN p_user_id INT,
    IN p_points INT,
    IN p_description VARCHAR(255),
    IN p_appointment_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Add transaction record
    INSERT INTO loyalty_transactions (user_id, transaction_type, points, description, related_appointment_id)
    VALUES (p_user_id, 'earned', p_points, p_description, p_appointment_id);
    
    -- Update user points
    UPDATE users 
    SET loyalty_points = loyalty_points + p_points 
    WHERE id = p_user_id;
    
    COMMIT;
END //

DELIMITER ;

-- ==================================================
-- VERIFICATION QUERY
-- ==================================================

-- Show all created tables
SHOW TABLES;

-- Show structure of users table to verify loyalty_points column
DESCRIBE users;