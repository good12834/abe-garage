-- Abe Garage Database Schema
-- Auto Service Management System

CREATE DATABASE IF NOT EXISTS abe_garage;
USE abe_garage;

-- Users Table (Customers and Admins)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'admin') DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Services Table
CREATE TABLE services (
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
CREATE TABLE mechanics (
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
CREATE TABLE appointments (
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
CREATE TABLE service_updates (
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
CREATE TABLE invoices (
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

-- Invoice Items Table (For detailed line items)
CREATE TABLE invoice_items (
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

-- Insert default services
INSERT INTO services (name, description, base_price, duration_minutes, category) VALUES
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

-- Insert default admin user (password: admin123 - should be changed in production)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@abegarage.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin');

-- Insert sample mechanics
INSERT INTO mechanics (first_name, last_name, email, phone, specialties, hourly_rate, hire_date) VALUES
('John', 'Smith', 'john.smith@abegarage.com', '555-0101', 'Engine Repair, Diagnostics', 45.00, '2020-01-15'),
('Sarah', 'Johnson', 'sarah.johnson@abegarage.com', '555-0102', 'Brake Systems, Suspension', 50.00, '2019-06-10'),
('Mike', 'Davis', 'mike.davis@abegarage.com', '555-0103', 'Transmission, Oil Changes', 42.00, '2021-03-22'),
('Lisa', 'Wilson', 'lisa.wilson@abegarage.com', '555-0104', 'Electrical Systems, AC Repair', 48.00, '2020-09-01');

-- Create indexes for better performance
CREATE INDEX idx_users_email_role ON users(email, role);
CREATE INDEX idx_appointments_date_status ON appointments(appointment_date, status);
CREATE INDEX idx_service_updates_appointment_created ON service_updates(appointment_id, created_at);

-- Create views for common queries
CREATE VIEW appointment_details AS
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

-- Create a stored procedure for generating invoice numbers
DELIMITER //
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
DELIMITER ;