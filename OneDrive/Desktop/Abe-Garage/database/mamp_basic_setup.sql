-- ==================================================
-- BASIC ABE GARAGE DATABASE SETUP FOR MAMP
-- Simple version to test database connection
-- ==================================================

-- Create database
CREATE DATABASE IF NOT EXISTS abe_garage;
USE abe_garage;

-- Create users table with loyalty_points
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'admin', 'mechanic') DEFAULT 'customer',
    loyalty_points INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    duration_minutes INT DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create mechanics table
CREATE TABLE IF NOT EXISTS mechanics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    specialties TEXT,
    hourly_rate DECIMAL(8, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create appointments table
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
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mechanic_id) REFERENCES mechanics(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
);

-- Insert test data
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@abegarage.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin'),
('john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', 'customer');

INSERT INTO services (name, description, base_price, duration_minutes) VALUES
('Oil Change', 'Complete oil and filter change service', 50.00, 30),
('Brake Inspection', 'Comprehensive brake system inspection', 75.00, 45),
('Engine Diagnostics', 'Computerized engine diagnostic check', 120.00, 60);

INSERT INTO mechanics (first_name, last_name, email, phone, specialties, hourly_rate) VALUES
('John', 'Smith', 'john.smith@abegarage.com', '555-0101', 'Engine Repair, Diagnostics', 45.00),
('Sarah', 'Johnson', 'sarah.johnson@abegarage.com', '555-0102', 'Brake Systems, Suspension', 50.00);

-- Show success message
SELECT 'Database setup completed successfully!' AS message;