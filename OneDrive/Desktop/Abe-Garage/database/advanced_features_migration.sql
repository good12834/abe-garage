-- Abe Garage Advanced Features Database Migration
-- This file adds all the tables and structures needed for the advanced features

USE abe_garage;

-- Add mechanic role to existing users (update the enum)
ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'admin', 'mechanic') DEFAULT 'customer';

-- Add loyalty points column
ALTER TABLE users ADD COLUMN loyalty_points INT DEFAULT 0;
ALTER TABLE users ADD COLUMN total_spent DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN last_service_date DATE NULL;
ALTER TABLE users ADD COLUMN car_mileage INT NULL;

-- Parts Inventory Table
CREATE TABLE parts (
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
CREATE TABLE service_history (
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
    parts_used JSON, -- Store parts used in JSON format
    recommendations JSON, -- Store recommended next services
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
    INDEX idx_user (user_id),
    INDEX idx_service_date (service_date)
);

-- Customer Service Recommendations
CREATE TABLE service_recommendations (
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
CREATE TABLE chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_role ENUM('customer', 'admin', 'mechanic') NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file') DEFAULT 'text',
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    read_by JSON, -- Array of user IDs who have read this message
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_appointment (appointment_id),
    INDEX idx_sender (sender_id),
    INDEX idx_created (created_at)
);

-- Before/After Photos for Services
CREATE TABLE service_photos (
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

-- Mechanic Workload Tracking
CREATE TABLE mechanic_workload (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mechanic_id INT NOT NULL,
    appointment_id INT NOT NULL,
    assigned_date DATE NOT NULL,
    estimated_hours DECIMAL(4, 2),
    actual_hours DECIMAL(4, 2),
    status ENUM('assigned', 'in_progress', 'completed', 'delayed') DEFAULT 'assigned',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mechanic_id) REFERENCES mechanics(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    INDEX idx_mechanic (mechanic_id),
    INDEX idx_date (assigned_date),
    INDEX idx_status (status)
);

-- Appointment Time Estimates
CREATE TABLE appointment_estimates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    service_id INT NOT NULL,
    estimated_duration INT NOT NULL, -- in minutes
    estimated_cost DECIMAL(10, 2),
    available_slots JSON, -- Available time slots
    mechanic_availability JSON, -- Mechanic availability data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
    INDEX idx_appointment (appointment_id),
    INDEX idx_service (service_id)
);

-- Cost Estimates (pre-booking estimates)
CREATE TABLE cost_estimates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    service_id INT NOT NULL,
    car_brand VARCHAR(100),
    car_model VARCHAR(100),
    car_year INT,
    estimate_type ENUM('quick', 'detailed') DEFAULT 'quick',
    estimated_cost DECIMAL(10, 2),
    cost_breakdown JSON,
    valid_until DATE,
    is_converted_to_appointment BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
    INDEX idx_user (user_id),
    INDEX idx_service (service_id),
    INDEX idx_created (created_at)
);

-- Loyalty Program
CREATE TABLE loyalty_transactions (
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

-- Product Catalog for Shop (Optional Feature)
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    brand VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 3,
    sku VARCHAR(100) UNIQUE,
    image_url VARCHAR(500),
    weight DECIMAL(8, 3), -- in kg
    dimensions VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_sku (sku),
    INDEX idx_active (is_active)
);

-- Shopping Cart (for optional shop feature)
CREATE TABLE shopping_cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id),
    INDEX idx_user (user_id)
);

-- Weather Data Cache (for weather-based recommendations)
CREATE TABLE weather_cache (
    id INT PRIMARY KEY AUTO_INCREMENT,
    city VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    weather_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_city_date (city, date),
    INDEX idx_city (city),
    INDEX idx_date (date)
);

-- Notifications & SMS
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    appointment_id INT,
    notification_type ENUM('sms', 'email', 'push', 'in_app') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    metadata JSON, -- Additional data like phone number, email, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (notification_type),
    INDEX idx_status (status)
);

-- QR Codes for Service Tracking
CREATE TABLE service_qr_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    qr_code_data VARCHAR(500) NOT NULL,
    public_url VARCHAR(500) NOT NULL,
    expires_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    INDEX idx_appointment (appointment_id),
    INDEX idx_active (is_active)
);

-- Service Progress Tracking
CREATE TABLE service_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    step_order INT NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'skipped') DEFAULT 'pending',
    mechanic_id INT,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (mechanic_id) REFERENCES mechanics(id) ON DELETE SET NULL,
    INDEX idx_appointment (appointment_id),
    INDEX idx_step_order (step_order)
);

-- Insert default service progress steps
INSERT INTO service_progress (appointment_id, step_name, step_order) VALUES
(0, 'Diagnosis Started', 1),
(0, 'Parts Ordered', 2),
(0, 'Repair Ongoing', 3),
(0, 'Quality Check', 4),
(0, 'Ready for Pickup', 5);

-- Create views for better data access

-- Customer Service History View
CREATE VIEW customer_service_history AS
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

-- Mechanic Workload View
CREATE VIEW mechanic_workload_summary AS
SELECT 
    m.id as mechanic_id,
    CONCAT(m.first_name, ' ', m.last_name) as mechanic_name,
    COUNT(mw.id) as total_assignments,
    SUM(CASE WHEN mw.status = 'assigned' THEN 1 ELSE 0 END) as pending_assignments,
    SUM(CASE WHEN mw.status = 'in_progress' THEN 1 ELSE 0 END) as active_jobs,
    SUM(CASE WHEN mw.status = 'completed' THEN 1 ELSE 0 END) as completed_jobs,
    COALESCE(SUM(mw.estimated_hours), 0) as total_estimated_hours,
    COALESCE(SUM(mw.actual_hours), 0) as total_actual_hours
FROM mechanics m
LEFT JOIN mechanic_workload mw ON m.id = mw.mechanic_id
WHERE m.is_active = TRUE
GROUP BY m.id, m.first_name, m.last_name;

-- Inventory Alert View
CREATE VIEW inventory_alerts AS
SELECT 
    p.id,
    p.name,
    p.part_number,
    p.category,
    p.stock_quantity,
    p.min_stock_level,
    (p.min_stock_level - p.stock_quantity) as shortage_amount,
    p.unit_price,
    (p.min_stock_level - p.stock_quantity) * p.unit_price as shortage_value,
    p.supplier,
    p.location
FROM parts p
WHERE p.stock_quantity <= p.min_stock_level
AND p.is_active = TRUE
ORDER BY shortage_amount DESC;

-- Create indexes for better performance
CREATE INDEX idx_parts_category_stock ON parts(category, stock_quantity);
CREATE INDEX idx_service_history_user_date ON service_history(user_id, service_date);
CREATE INDEX idx_chat_appointment_created ON chat_messages(appointment_id, created_at);
CREATE INDEX idx_workload_mechanic_date ON mechanic_workload(mechanic_id, assigned_date);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_progress_appointment_order ON service_progress(appointment_id, step_order);

-- Create stored procedures for common operations

-- Procedure to update customer loyalty points
DELIMITER //
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

-- Procedure to generate QR code for appointment tracking
DELIMITER //
CREATE PROCEDURE GenerateAppointmentQRCode(
    IN p_appointment_id INT,
    OUT p_qr_code_data VARCHAR(500),
    OUT p_public_url VARCHAR(500)
)
BEGIN
    DECLARE v_token VARCHAR(64);
    DECLARE v_url VARCHAR(500);
    
    -- Generate secure token
    SET v_token = UPPER(SHA2(CONCAT(p_appointment_id, UNIX_TIMESTAMP(), RAND()), 256));
    SET v_qr_code_data = CONCAT('ABE-GARAGE:', v_token);
    SET v_public_url = CONCAT('https://abegarage.com/track/', v_token);
    
    -- Store QR code record
    INSERT INTO service_qr_codes (appointment_id, qr_code_data, public_url, expires_at)
    VALUES (p_appointment_id, v_qr_code_data, v_public_url, DATE_ADD(NOW(), INTERVAL 30 DAY));
END //
DELIMITER ;

-- Insert sample parts data
INSERT INTO parts (name, description, part_number, category, brand, unit_price, stock_quantity, supplier) VALUES
('Oil Filter', 'Standard oil filter for most vehicles', 'OF-001', 'Filters', 'Bosch', 15.99, 50, 'AutoParts Co'),
('Brake Pads Front', 'Ceramic brake pads for front wheels', 'BP-F001', 'Brakes', 'Akebono', 89.99, 25, 'Brake Systems Ltd'),
('Spark Plugs Set', 'Set of 4 platinum spark plugs', 'SP-004', 'Engine', 'NGK', 45.99, 40, 'Performance Parts'),
('Air Filter', 'Engine air filter', 'AF-001', 'Filters', 'K&N', 32.99, 30, 'Filter World'),
('Transmission Fluid', 'Automatic transmission fluid (1L)', 'TF-001', 'Fluids', 'Mobil', 24.99, 60, 'Lubricants Inc');

-- Insert sample products for optional shop
INSERT INTO products (name, description, category, brand, price, cost_price, stock_quantity, sku) VALUES
('Car Wash Kit', 'Complete car washing kit with soap, wax, and microfiber cloths', 'Cleaning', 'Chemical Guys', 39.99, 22.00, 25, 'CW-001'),
('Floor Mats', 'All-weather rubber floor mats set', 'Accessories', 'WeatherTech', 89.99, 45.00, 15, 'FM-001'),
('Dash Cam', '1080p dashboard camera with GPS', 'Electronics', 'Garmin', 199.99, 120.00, 10, 'DC-001'),
('Portable Jump Starter', 'Compact jump starter with USB charging', 'Tools', 'NOCO', 79.99, 42.00, 20, 'JS-001');

-- Add comments for documentation
ALTER TABLE parts COMMENT = 'Parts inventory management table';
ALTER TABLE service_recommendations COMMENT = 'AI-like service recommendations based on various factors';
ALTER TABLE chat_messages COMMENT = 'Real-time chat between customers, mechanics, and admins';
ALTER TABLE service_progress COMMENT = 'Detailed progress tracking for appointment steps';
ALTER TABLE mechanic_workload COMMENT = 'Mechanic workload and availability tracking';
ALTER TABLE loyalty_transactions COMMENT = 'Customer loyalty program transaction history';

-- Create audit trigger for parts inventory changes
DELIMITER //
CREATE TRIGGER parts_inventory_alert
AFTER UPDATE ON parts
FOR EACH ROW
BEGIN
    IF NEW.stock_quantity <= NEW.min_stock_level AND OLD.stock_quantity > OLD.min_stock_level THEN
        INSERT INTO notifications (user_id, notification_type, title, message, metadata)
        SELECT id, 'in_app', 'Low Stock Alert', 
               CONCAT('Part "', NEW.name, '" is running low. Current stock: ', NEW.stock_quantity, ', Minimum level: ', NEW.min_stock_level),
               JSON_OBJECT('part_id', NEW.id, 'part_name', NEW.name, 'current_stock', NEW.stock_quantity, 'alert_type', 'low_stock')
        FROM users 
        WHERE role = 'admin' AND is_active = TRUE;
    END IF;
END //
DELIMITER ;