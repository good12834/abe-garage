-- Vehicles Table Migration
-- Adds a dedicated vehicles table for customer vehicles

CREATE TABLE IF NOT EXISTS vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vin VARCHAR(17) UNIQUE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    color VARCHAR(50),
    vehicle_type ENUM('sedan', 'suv', 'truck', 'van', 'coupe', 'hatchback', 'wagon', 'convertible', 'motorcycle', 'other') DEFAULT 'sedan',
    engine_type ENUM('gasoline', 'diesel', 'electric', 'hybrid', 'other') DEFAULT 'gasoline',
    transmission ENUM('automatic', 'manual', 'cvt') DEFAULT 'automatic',
    mileage INT DEFAULT 0,
    last_service_date DATE,
    next_service_due DATE,
    registration_expiry DATE,
    insurance_expiry DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_customer (customer_id),
    INDEX idx_license_plate (license_plate),
    INDEX idx_vin (vin),
    INDEX idx_make_model (make, model),
    INDEX idx_active (is_active)
);

-- Create a view for customer vehicles with customer details
CREATE OR REPLACE VIEW customer_vehicles AS
SELECT 
    v.id,
    v.customer_id,
    v.license_plate,
    v.vin,
    v.make,
    v.model,
    v.year,
    v.color,
    v.vehicle_type,
    v.engine_type,
    v.transmission,
    v.mileage,
    v.last_service_date,
    v.next_service_due,
    v.registration_expiry,
    v.insurance_expiry,
    v.notes,
    v.is_active,
    v.created_at,
    v.updated_at,
    CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
    u.email AS customer_email,
    u.phone AS customer_phone
FROM vehicles v
JOIN users u ON v.customer_id = u.id;
