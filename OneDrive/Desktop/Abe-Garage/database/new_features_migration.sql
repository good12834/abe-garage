-- Abe Garage New Features Database Migration
-- Adds tables for certifications, service bays, vehicle health scores, and enhanced timeline features

USE abe_garage;

-- Mechanic Certifications Table
CREATE TABLE mechanic_certifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mechanic_id INT NOT NULL,
    certification_name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255),
    certification_type ENUM('technical', 'safety', 'manufacturer', 'industry', 'specialty') NOT NULL,
    certificate_number VARCHAR(100),
    issue_date DATE NOT NULL,
    expiry_date DATE,
    credential_url VARCHAR(500),
    image_url VARCHAR(500),
    description TEXT,
    skills_covered JSON, -- Array of skills covered by this certification
    verification_status ENUM('verified', 'pending', 'expired', 'revoked') DEFAULT 'verified',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mechanic_id) REFERENCES mechanics(id) ON DELETE CASCADE,
    INDEX idx_mechanic (mechanic_id),
    INDEX idx_type (certification_type),
    INDEX idx_expiry (expiry_date),
    INDEX idx_verification (verification_status)
);

-- Service Bays Table (for Live Queue Status)
CREATE TABLE service_bays (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bay_number VARCHAR(20) UNIQUE NOT NULL,
    bay_name VARCHAR(100),
    bay_type ENUM('standard', 'heavy_duty', 'diagnostic', 'quick_service', 'specialty') DEFAULT 'standard',
    capacity_vehicle_size ENUM('small', 'medium', 'large', 'extra_large') DEFAULT 'medium',
    equipment JSON, -- Array of specialized equipment available
    is_active BOOLEAN DEFAULT TRUE,
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (bay_type),
    INDEX idx_active (is_active)
);

-- Service Bay Status Table (for real-time availability)
CREATE TABLE service_bay_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bay_id INT NOT NULL,
    status ENUM('available', 'occupied', 'maintenance', 'out_of_service') DEFAULT 'available',
    current_appointment_id INT,
    estimated_completion_time DATETIME,
    mechanic_id INT,
    service_type VARCHAR(100),
    vehicle_info JSON, -- Store vehicle details
    started_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bay_id) REFERENCES service_bays(id) ON DELETE CASCADE,
    FOREIGN KEY (current_appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (mechanic_id) REFERENCES mechanics(id) ON DELETE SET NULL,
    INDEX idx_bay (bay_id),
    INDEX idx_status (status),
    INDEX idx_appointment (current_appointment_id)
);

-- Vehicle Health Scores Table
CREATE TABLE vehicle_health_scores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    appointment_id INT,
    vehicle_brand VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_year INT,
    vehicle_vin VARCHAR(17),
    current_mileage INT,
    overall_score INT NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    score_breakdown JSON, -- Detailed breakdown by system
    critical_issues JSON, -- Array of critical issues
    recommendations JSON, -- Array of recommended services
    assessment_date DATE NOT NULL,
    assessor_name VARCHAR(255), -- Mechanic or system name
    assessment_type ENUM('routine', 'diagnostic', 'pre_purchase', 'service_based') DEFAULT 'routine',
    notes TEXT,
    next_assessment_due DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_assessment_date (assessment_date),
    INDEX idx_score (overall_score),
    INDEX idx_assessment_type (assessment_type)
);

-- Enhanced Service History Timeline Events
CREATE TABLE service_timeline_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_history_id INT NOT NULL,
    event_type ENUM('service_completed', 'issue_found', 'part_replaced', 'recommendation_made', 'follow_up_scheduled', 'warranty_expires') NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    event_title VARCHAR(255) NOT NULL,
    event_description TEXT,
    severity ENUM('info', 'warning', 'critical', 'success') DEFAULT 'info',
    cost DECIMAL(10, 2),
    mechanic_id INT,
    related_parts JSON, -- Array of parts involved
    before_photos JSON, -- Array of before photo URLs
    after_photos JSON, -- Array of after photo URLs
    warranty_info JSON, -- Warranty details if applicable
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_history_id) REFERENCES service_history(id) ON DELETE CASCADE,
    FOREIGN KEY (mechanic_id) REFERENCES mechanics(id) ON DELETE SET NULL,
    INDEX idx_service_history (service_history_id),
    INDEX idx_event_type (event_type),
    INDEX idx_event_date (event_date),
    INDEX idx_severity (severity)
);

-- Service Queue Management
CREATE TABLE service_queue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    bay_id INT,
    queue_position INT NOT NULL,
    estimated_wait_time INT, -- in minutes
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    queue_status ENUM('waiting', 'called', 'in_bay', 'completed', 'cancelled') DEFAULT 'waiting',
    customer_notified BOOLEAN DEFAULT FALSE,
    called_at TIMESTAMP NULL,
    in_bay_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (bay_id) REFERENCES service_bays(id) ON DELETE SET NULL,
    INDEX idx_appointment (appointment_id),
    INDEX idx_queue_position (queue_position),
    INDEX idx_status (queue_status),
    INDEX idx_priority (priority)
);
-- Insert default service bays
INSERT INTO service_bays (bay_number, bay_name, bay_type, equipment) VALUES
('B001', 'Express Service Bay 1', 'quick_service', '["oil_change_equipment", "fluid_check_station", "battery_tester"]'),
('B002', 'Express Service Bay 2', 'quick_service', '["oil_change_equipment", "tire_pressure_system", "air_filter_station"]'),
('B003', 'Diagnostic Bay 1', 'diagnostic', '["computer_diagnostic", "engine_analyzer", "electrical_tester", "smoke_machine"]'),
('B004', 'Standard Bay 1', 'standard', '["hydraulic_lift", "basic_tools", "brake_equipment"]'),
('B005', 'Standard Bay 2', 'standard', '["hydraulic_lift", "basic_tools", "tire_machine"]'),
('B006', 'Heavy Duty Bay 1', 'heavy_duty', '["heavy_duty_lift", "truck_equipment", "large_tool_set"]'),
('B007', 'Specialty Bay 1', 'specialty', '["transmission_jack", "ac_service_station", "cooling_system_tester"]');

-- Insert default service bay status
INSERT INTO service_bay_status (bay_id, status) VALUES
(1, 'available'), (2, 'available'), (3, 'available'), 
(4, 'available'), (5, 'available'), (6, 'available'), (7, 'available');

-- Create indexes for performance
CREATE INDEX idx_certifications_mechanic_type ON mechanic_certifications(mechanic_id, certification_type);
CREATE INDEX idx_bay_status_bay_time ON service_bay_status(bay_id, updated_at);
CREATE INDEX idx_health_scores_user_date ON vehicle_health_scores(user_id, assessment_date);
CREATE INDEX idx_timeline_events_date_type ON service_timeline_events(event_date, event_type);
CREATE INDEX idx_queue_position_status ON service_queue(queue_position, queue_status);

-- Create views for common queries

-- Mechanic Certifications View
CREATE VIEW mechanic_certifications_view AS
SELECT 
    mc.*,
    CONCAT(m.first_name, ' ', m.last_name) as mechanic_name,
    m.specialties as mechanic_specialties
FROM mechanic_certifications mc
JOIN mechanics m ON mc.mechanic_id = m.id
WHERE mc.verification_status = 'verified';

-- Service Bay Availability View
CREATE VIEW service_bay_availability AS
SELECT 
    sb.id,
    sb.bay_number,
    sb.bay_name,
    sb.bay_type,
    sb.capacity_vehicle_size,
    sb.equipment,
    sbs.status,
    sbs.estimated_completion_time,
    sbs.service_type,
    CONCAT(m.first_name, ' ', m.last_name) as assigned_mechanic,
    CASE 
        WHEN sbs.status = 'available' THEN 'Available Now'
        WHEN sbs.status = 'occupied' THEN CONCAT('Occupied - ETA: ', TIME_FORMAT(sbs.estimated_completion_time, '%H:%i'))
        WHEN sbs.status = 'maintenance' THEN 'Under Maintenance'
        ELSE 'Out of Service'
    END as status_display
FROM service_bays sb
LEFT JOIN service_bay_status sbs ON sb.id = sbs.bay_id
LEFT JOIN mechanics m ON sbs.mechanic_id = m.id
WHERE sb.is_active = TRUE
ORDER BY 
    CASE sbs.status 
        WHEN 'available' THEN 1 
        WHEN 'occupied' THEN 2 
        WHEN 'maintenance' THEN 3 
        WHEN 'out_of_service' THEN 4 
    END,
    sb.bay_number;
-- Vehicle Health Score Trends View
CREATE VIEW vehicle_health_trends AS
SELECT 
    vhs.user_id,
    vhs.vehicle_brand,
    vhs.vehicle_model,
    vhs.vehicle_year,
    vhs.overall_score,
    vhs.assessment_date,
    vhs.score_breakdown,
    vhs.critical_issues,
    vhs.recommendations,
    LAG(vhs.overall_score) OVER (PARTITION BY vhs.user_id, vhs.vehicle_brand, vhs.vehicle_model, vhs.vehicle_year ORDER BY vhs.assessment_date) as previous_score,
    vhs.overall_score - LAG(vhs.overall_score) OVER (PARTITION BY vhs.user_id, vhs.vehicle_brand, vhs.vehicle_model, vhs.vehicle_year ORDER BY vhs.assessment_date) as score_change
FROM vehicle_health_scores vhs
ORDER BY vhs.user_id, vhs.vehicle_brand, vhs.vehicle_model, vhs.vehicle_year, vhs.assessment_date DESC;

-- Service Timeline Summary View
CREATE VIEW service_timeline_summary AS
SELECT 
    sh.id as service_history_id,
    sh.user_id,
    sh.service_date,
    sh.car_brand,
    sh.car_model,
    sh.car_year,
    s.name as service_name,
    sh.cost,
    COUNT(ste.id) as total_events,
    GROUP_CONCAT(ste.event_type ORDER BY ste.event_date, ste.event_time) as event_types,
    MAX(CASE WHEN ste.severity = 'critical' THEN ste.event_title END) as critical_issues,
    COUNT(CASE WHEN ste.severity = 'critical' THEN 1 END) as critical_issues_count
FROM service_history sh
JOIN services s ON sh.service_id = s.id
LEFT JOIN service_timeline_events ste ON sh.id = ste.service_history_id
GROUP BY sh.id;

-- Create stored procedures

-- Procedure to update service bay status
DELIMITER //
CREATE PROCEDURE UpdateServiceBayStatus(
    IN p_bay_id INT,
    IN p_status ENUM('available', 'occupied', 'maintenance', 'out_of_service'),
    IN p_appointment_id INT,
    IN p_mechanic_id INT,
    IN p_estimated_completion DATETIME,
    IN p_service_type VARCHAR(100),
    IN p_vehicle_info JSON
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Update bay status
    INSERT INTO service_bay_status (bay_id, status, current_appointment_id, mechanic_id, estimated_completion_time, service_type, vehicle_info, started_at)
    VALUES (p_bay_id, p_status, p_appointment_id, p_mechanic_id, p_estimated_completion, p_service_type, p_vehicle_info, 
            CASE WHEN p_status = 'occupied' THEN NOW() ELSE NULL END)
    ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        current_appointment_id = VALUES(current_appointment_id),
        mechanic_id = VALUES(mechanic_id),
        estimated_completion_time = VALUES(estimated_completion_time),
        service_type = VALUES(service_type),
        vehicle_info = VALUES(vehicle_info),
        started_at = VALUES(started_at),
        updated_at = CURRENT_TIMESTAMP;
    
    COMMIT;
END //
DELIMITER ;

-- Procedure to calculate vehicle health score
DELIMITER //
CREATE PROCEDURE CalculateVehicleHealthScore(
    IN p_user_id INT,
    IN p_vehicle_brand VARCHAR(100),
    IN p_vehicle_model VARCHAR(100),
    IN p_vehicle_year INT,
    IN p_mileage INT,
    IN p_service_history JSON,
    OUT p_score INT
)
BEGIN
    DECLARE base_score INT DEFAULT 85;
    DECLARE mileage_penalty INT DEFAULT 0;
    DECLARE service_penalty INT DEFAULT 0;
    DECLARE age_penalty INT DEFAULT 0;
    DECLARE calculated_score INT;
    DECLARE vehicle_age INT;
    DECLARE last_service_days INT;
    DECLARE services_overdue INT DEFAULT 0;
    
    -- Calculate vehicle age
    SET vehicle_age = YEAR(NOW()) - p_vehicle_year;
    
    -- Calculate mileage penalty (every 15k miles over 50k = -1 point, max -20)
    IF p_mileage > 50000 THEN
        SET mileage_penalty = LEAST(20, FLOOR((p_mileage - 50000) / 15000));
    END IF;
    
    -- Calculate age penalty (every year over 5 = -1 point, max -15)
    IF vehicle_age > 5 THEN
        SET age_penalty = LEAST(15, vehicle_age - 5);
    END IF;
    
    -- Parse service history and calculate overdue services
    -- This is a simplified calculation - in practice, you'd analyze service patterns
    
    -- Calculate final score
    SET calculated_score = base_score - mileage_penalty - age_penalty - service_penalty;
    
    -- Ensure score is within bounds
    SET p_score = GREATEST(0, LEAST(100, calculated_score));
END //
DELIMITER ;

-- Insert sample mechanic certifications
INSERT INTO mechanic_certifications (mechanic_id, certification_name, issuing_organization, certification_type, certificate_number, issue_date, expiry_date, skills_covered, verification_status) VALUES
(1, 'ASE Master Technician', 'National Institute for Automotive Service Excellence', 'technical', 'ASE-MT-001-2020', '2020-06-15', '2026-06-15', '["engine_repair", "electrical_systems", "brakes", "heating_ac", "engine_performance"]', 'verified'),
(1, 'Honda Certified Technician', 'American Honda Motor Co.', 'manufacturer', 'HON-CT-001-2021', '2021-03-20', '2024-03-20', '["honda_engines", "honda_electrical", "honda_brakes"]', 'verified'),
(2, 'ASE Brakes Specialist', 'National Institute for Automotive Service Excellence', 'specialty', 'ASE-BS-002-2019', '2019-08-10', '2025-08-10', '["brake_systems", "abs_systems", "brake_fluids"]', 'verified'),
(2, 'Bosch Diagnostics Certification', 'Bosch Automotive Service Solutions', 'technical', 'BOS-DIAG-002-2022', '2022-01-15', '2025-01-15', '["bosch_diagnostic_tools", "engine_analysis", "electrical_diagnostics"]', 'verified'),
(3, 'ASE Transmission Specialist', 'National Institute for Automotive Service Excellence', 'specialty', 'ASE-TS-003-2020', '2020-11-05', '2026-11-05', '["transmission_repair", "transmission_diagnostics", "fluid_services"]', 'verified'),
(4, 'EPA 609 Refrigerant Certification', 'Environmental Protection Agency', 'safety', 'EPA-609-004-2021', '2021-05-12', '2024-05-12', '["refrigerant_handling", "ac_systems", "environmental_safety"]', 'verified'),
(4, 'AC Delco Electrical Certification', 'AC Delco Technical Training', 'technical', 'ACD-EL-004-2022', '2022-09-08', '2025-09-08', '["electrical_systems", "battery_testing", "charging_systems"]', 'verified');

-- Add comments for documentation
ALTER TABLE mechanic_certifications COMMENT = 'Digital certification badges for mechanics with verification status';
ALTER TABLE service_bays COMMENT = 'Physical service bay information and specifications';
ALTER TABLE service_bay_status COMMENT = 'Real-time status of each service bay for queue management';
ALTER TABLE vehicle_health_scores COMMENT = 'Vehicle condition assessment scores and breakdown';
ALTER TABLE service_timeline_events COMMENT = 'Detailed timeline events for service history visualization';
ALTER TABLE service_queue COMMENT = 'Queue management system for service appointments';