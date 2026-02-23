-- Predictive Maintenance Feature Database Migration
-- Adds tables for AI-powered predictive maintenance system

USE abe_garage;

-- Prediction Feedback Table (for ML model improvement)
CREATE TABLE prediction_feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prediction_id INT NOT NULL,
    user_id INT NOT NULL,
    accuracy ENUM('accurate', 'inaccurate') NOT NULL,
    actual_failure_date DATE,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_prediction (prediction_id),
    INDEX idx_accuracy (accuracy),
    INDEX idx_created (created_at)
);

-- Vehicle AI Models Table (stores AI model predictions for each vehicle)
CREATE TABLE vehicle_ai_models (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    vehicle_info JSON, -- Store vehicle details (make, model, year, etc.)
    model_version VARCHAR(20) NOT NULL DEFAULT 'v2.1',
    overall_health_score INT NOT NULL CHECK (overall_health_score >= 0 AND overall_health_score <= 100),
    risk_factors JSON, -- Array of risk factors identified
    driving_pattern_analysis JSON, -- Analysis of driving patterns
    environmental_factors JSON, -- Climate, location-based factors
    prediction_data JSON, -- Store the raw prediction data
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_health_score (overall_health_score),
    INDEX idx_last_updated (last_updated)
);

-- Component Wear History Table (tracks component degradation over time)
CREATE TABLE component_wear_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    vehicle_info JSON, -- Store vehicle details (make, model, year, mileage)
    component_type ENUM('brake_pads', 'engine_oil', 'tires', 'transmission', 'spark_plugs', 'air_filter', 'fuel_filter', 'coolant', 'battery', 'alternator') NOT NULL,
    measurement_date DATE NOT NULL,
    mileage_at_measurement INT NOT NULL,
    wear_level DECIMAL(5,2) NOT NULL CHECK (wear_level >= 0 AND wear_level <= 100),
    measurement_method ENUM('manual', 'sensor', 'diagnostic', 'ai_prediction') NOT NULL,
    measurement_data JSON, -- Store detailed measurement data
    service_recommended BOOLEAN DEFAULT FALSE,
    next_check_date DATE,
    technician_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_component (component_type),
    INDEX idx_date (measurement_date),
    INDEX idx_wear_level (wear_level)
);

-- Predictive Maintenance Alerts Table
CREATE TABLE predictive_maintenance_alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    vehicle_info JSON, -- Store vehicle details (make, model, year)
    component_type VARCHAR(50) NOT NULL,
    alert_type ENUM('high_risk', 'maintenance_due', 'failure_predicted', 'monitoring_required') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    predicted_failure_date DATE,
    risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    estimated_cost DECIMAL(10, 2),
    recommended_action TEXT NOT NULL,
    alert_message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at TIMESTAMP NULL,
    dismissed_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    FOREIGN KEY (dismissed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),

    INDEX idx_alert_type (alert_type),
    INDEX idx_priority (priority),
    INDEX idx_active (is_active),
    INDEX idx_predicted_failure (predicted_failure_date),
    INDEX idx_risk_score (risk_score)
);

-- AI Model Performance Metrics Table
CREATE TABLE ai_model_performance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    model_version VARCHAR(20) NOT NULL,
    prediction_date DATE NOT NULL,
    total_predictions INT NOT NULL DEFAULT 0,
    accurate_predictions INT NOT NULL DEFAULT 0,
    accuracy_rate DECIMAL(5,4) NOT NULL,
    false_positives INT NOT NULL DEFAULT 0,
    false_negatives INT NOT NULL DEFAULT 0,
    precision_score DECIMAL(5,4),
    recall_score DECIMAL(5,4),
    f1_score DECIMAL(5,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_model_version (model_version),
    INDEX idx_prediction_date (prediction_date)
);

-- Insert default AI model performance data
INSERT INTO ai_model_performance (model_version, prediction_date, total_predictions, accurate_predictions, accuracy_rate, false_positives, false_negatives, precision_score, recall_score, f1_score) VALUES
('v2.1', '2025-12-08', 150, 135, 0.9000, 8, 7, 0.9412, 0.8852, 0.9123),
('v2.0', '2025-12-01', 142, 118, 0.8310, 12, 12, 0.9077, 0.8209, 0.8622),
('v1.9', '2025-11-24', 138, 110, 0.7971, 15, 13, 0.8800, 0.7957, 0.8359);

-- Customer Loyalty & Rewards Program Tables

-- Customer Loyalty Program Table
CREATE TABLE customer_loyalty_programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    program_name VARCHAR(100) NOT NULL DEFAULT 'Abe Garage Rewards',
    tier ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond') DEFAULT 'bronze',
    total_points INT NOT NULL DEFAULT 0,
    available_points INT NOT NULL DEFAULT 0,
    lifetime_points INT NOT NULL DEFAULT 0,
    total_spent DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    visit_count INT NOT NULL DEFAULT 0,
    member_since DATE NOT NULL,
    last_activity DATE,
    next_tier_threshold INT NOT NULL,
    tier_benefits JSON, -- Store tier-specific benefits
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_program (user_id, program_name),
    INDEX idx_user (user_id),
    INDEX idx_tier (tier),
    INDEX idx_total_points (total_points),
    INDEX idx_available_points (available_points)
);

-- Loyalty Points Transactions Table
CREATE TABLE loyalty_points_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    program_id INT NOT NULL,
    transaction_type ENUM('earned', 'redeemed', 'expired', 'adjusted', 'bonus') NOT NULL,
    points INT NOT NULL,
    description TEXT NOT NULL,
    reference_id INT, -- Can reference appointment_id, service_id, etc.
    reference_type VARCHAR(50), -- appointment, service, referral, etc.
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES customer_loyalty_programs(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_program (program_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_expiry (expiry_date),
    INDEX idx_active (is_active)
);

-- Rewards Catalog Table
CREATE TABLE rewards_catalog (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reward_name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('service_discount', 'free_service', 'merchandise', 'gift_card', 'priority_booking', 'extended_warranty') NOT NULL,
    points_cost INT NOT NULL,
    monetary_value DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    quantity_available INT DEFAULT -1 COMMENT '-1 for unlimited',
    max_redemptions_per_user INT DEFAULT 1,
    tier_requirement ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond') DEFAULT 'bronze',
    valid_from DATE,
    valid_until DATE,
    terms_conditions TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_points_cost (points_cost),
    INDEX idx_tier_requirement (tier_requirement),
    INDEX idx_active (is_active),
    INDEX idx_valid_period (valid_from, valid_until)
);

-- Loyalty Rewards Redemptions Table
CREATE TABLE loyalty_rewards_redemptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    program_id INT NOT NULL,
    reward_id INT NOT NULL,
    points_redeemed INT NOT NULL,
    redemption_code VARCHAR(50) UNIQUE NOT NULL,
    redemption_status ENUM('pending', 'approved', 'delivered', 'expired', 'cancelled') DEFAULT 'pending',
    redemption_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE,
    approval_date TIMESTAMP NULL,
    delivery_date TIMESTAMP NULL,
    approved_by INT NULL,
    delivery_method ENUM('email', 'sms', 'pickup', 'mail', 'instant') DEFAULT 'email',
    delivery_details JSON, -- Store delivery information
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES customer_loyalty_programs(id) ON DELETE CASCADE,
    FOREIGN KEY (reward_id) REFERENCES rewards_catalog(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_reward (reward_id),
    INDEX idx_redemption_status (redemption_status),
    INDEX idx_redemption_date (redemption_date),
    INDEX idx_expiry (expiry_date),
    INDEX idx_redemption_code (redemption_code)
);

-- Insert default rewards catalog
INSERT INTO rewards_catalog (reward_name, description, category, points_cost, monetary_value, tier_requirement, terms_conditions) VALUES
('10% Off Next Service', 'Get 10% discount on your next service appointment', 'service_discount', 500, 25.00, 'bronze', 'Valid for 6 months from redemption date'),
('Free Oil Change', 'Complimentary oil change service (up to 5 quarts)', 'free_service', 1000, 45.00, 'silver', 'Valid for 3 months from redemption date'),
('Priority Booking', 'Skip the queue - book appointments with priority scheduling', 'priority_booking', 750, 0.00, 'bronze', 'Valid for 1 year from redemption date'),
('Car Wash Package', 'Free exterior and interior car wash', 'service_discount', 300, 20.00, 'bronze', 'Valid for 2 months from redemption date'),
('50% Off Diagnostic Service', 'Half price comprehensive vehicle diagnostic', 'service_discount', 800, 60.00, 'gold', 'Valid for 1 month from redemption date'),
('Free Tire Rotation', 'Complimentary tire rotation and pressure check', 'free_service', 600, 35.00, 'silver', 'Valid for 2 months from redemption date'),
('$25 Gift Card', 'Digital gift card for local businesses', 'gift_card', 1500, 25.00, 'gold', 'No expiration date'),
('Extended Warranty', '6-month extended warranty on completed services', 'extended_warranty', 2000, 150.00, 'platinum', 'Valid for 6 months from service completion'),
('VIP Lounge Access', 'Access to customer lounge with complimentary beverages', 'priority_booking', 400, 15.00, 'bronze', 'Valid for 3 months from redemption date'),
('Free Brake Inspection', 'Comprehensive brake system inspection', 'free_service', 450, 40.00, 'bronze', 'Valid for 1 month from redemption date');

-- Insert sample loyalty program data for existing users
INSERT INTO customer_loyalty_programs (user_id, tier, total_points, available_points, lifetime_points, total_spent, visit_count, member_since, next_tier_threshold, tier_benefits) 
SELECT 
    u.id,
    CASE 
        WHEN SUM(COALESCE(a.final_cost, 0)) >= 5000 THEN 'platinum'
        WHEN SUM(COALESCE(a.final_cost, 0)) >= 2500 THEN 'gold'
        WHEN SUM(COALESCE(a.final_cost, 0)) >= 1000 THEN 'silver'
        ELSE 'bronze'
    END as tier,
    FLOOR(SUM(COALESCE(a.final_cost, 0)) / 10) as total_points, -- 1 point per $10 spent
    FLOOR(SUM(COALESCE(a.final_cost, 0)) / 10) as available_points,
    FLOOR(SUM(COALESCE(a.final_cost, 0)) / 10) as lifetime_points,
    SUM(COALESCE(a.final_cost, 0)) as total_spent,
    COUNT(a.id) as visit_count,
    MIN(a.appointment_date) as member_since,
    CASE 
        WHEN SUM(COALESCE(a.final_cost, 0)) >= 5000 THEN 10000
        WHEN SUM(COALESCE(a.final_cost, 0)) >= 2500 THEN 5000
        WHEN SUM(COALESCE(a.final_cost, 0)) >= 1000 THEN 2500
        ELSE 1000
    END as next_tier_threshold,
    JSON_ARRAY(
        'Priority booking',
        'Early appointment scheduling',
        'Complimentary vehicle inspection'
    ) as tier_benefits
FROM users u
LEFT JOIN appointments a ON u.id = a.user_id AND a.status = 'completed'
WHERE u.role = 'customer'
GROUP BY u.id
ON DUPLICATE KEY UPDATE
    tier = VALUES(tier),
    total_points = VALUES(total_points),
    available_points = VALUES(available_points),
    lifetime_points = VALUES(lifetime_points),
    total_spent = VALUES(total_spent),
    visit_count = VALUES(visit_count),
    updated_at = CURRENT_TIMESTAMP;

-- Create indexes for performance optimization
CREATE INDEX idx_prediction_feedback_user_prediction ON prediction_feedback(user_id, prediction_id);
CREATE INDEX idx_vehicle_ai_models_user ON vehicle_ai_models(user_id);
CREATE INDEX idx_component_wear_user_date ON component_wear_history(user_id, measurement_date);
CREATE INDEX idx_predictive_alerts_user_active ON predictive_maintenance_alerts(user_id, is_active);
CREATE INDEX idx_loyalty_transactions_user_date ON loyalty_points_transactions(user_id, transaction_date);
CREATE INDEX idx_loyalty_redemptions_user_status ON loyalty_rewards_redemptions(user_id, redemption_status);

-- Create views for common queries

-- Predictive Maintenance Summary View
CREATE VIEW predictive_maintenance_summary AS
SELECT 
    pma.user_id,
    JSON_UNQUOTE(JSON_EXTRACT(pma.vehicle_info, '$.make')) as vehicle_make,
    JSON_UNQUOTE(JSON_EXTRACT(pma.vehicle_info, '$.model')) as vehicle_model,
    JSON_UNQUOTE(JSON_EXTRACT(pma.vehicle_info, '$.year')) as vehicle_year,
    pma.component_type,
    pma.alert_type,
    pma.priority,
    pma.risk_score,
    pma.predicted_failure_date,
    pma.recommended_action,
    pma.is_active,
    CONCAT(u.first_name, ' ', u.last_name) as customer_name
FROM predictive_maintenance_alerts pma
JOIN users u ON pma.user_id = u.id
WHERE pma.is_active = TRUE
ORDER BY pma.priority DESC, pma.risk_score DESC;

-- Loyalty Program Overview View
CREATE VIEW loyalty_program_overview AS
SELECT 
    clp.user_id,
    clp.tier,
    clp.total_points,
    clp.available_points,
    clp.lifetime_points,
    clp.total_spent,
    clp.visit_count,
    clp.next_tier_threshold,
    CASE clp.tier
        WHEN 'bronze' THEN 1000
        WHEN 'silver' THEN 2500
        WHEN 'gold' THEN 5000
        WHEN 'platinum' THEN 10000
        WHEN 'diamond' THEN 20000
    END as current_tier_threshold,
    CONCAT(u.first_name, ' ', u.last_name) as customer_name,
    u.email
FROM customer_loyalty_programs clp
JOIN users u ON clp.user_id = u.id;

-- Create stored procedures for loyalty calculations

DELIMITER //
CREATE PROCEDURE CalculateLoyaltyPoints(
    IN p_user_id INT,
    IN p_service_amount DECIMAL(10, 2),
    IN p_appointment_id INT
)
BEGIN
    DECLARE v_current_points INT DEFAULT 0;
    DECLARE v_points_to_award INT DEFAULT 0;
    DECLARE v_program_id INT DEFAULT 0;
    
    -- Calculate points to award (1 point per dollar, with bonuses)
    SET v_points_to_award = FLOOR(p_service_amount);
    
    -- Bonus points for higher amounts
    IF p_service_amount >= 500 THEN
        SET v_points_to_award = v_points_to_award + 50; -- $50 bonus
    ELSEIF p_service_amount >= 200 THEN
        SET v_points_to_award = v_points_to_award + 20; -- $20 bonus
    END IF;
    
    -- Get user's program ID
    SELECT id INTO v_program_id 
    FROM customer_loyalty_programs 
    WHERE user_id = p_user_id 
    LIMIT 1;
    
    IF v_program_id > 0 THEN
        -- Insert points transaction
        INSERT INTO loyalty_points_transactions 
        (user_id, program_id, transaction_type, points, description, reference_id, reference_type, transaction_date)
        VALUES 
        (p_user_id, v_program_id, 'earned', v_points_to_award, 'Points earned from service', p_appointment_id, 'service', NOW());
        
        -- Update program totals
        UPDATE customer_loyalty_programs 
        SET 
            total_points = total_points + v_points_to_award,
            available_points = available_points + v_points_to_award,
            lifetime_points = lifetime_points + v_points_to_award,
            last_activity = CURDATE(),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_program_id;
        
        -- Check for tier upgrade
        CALL CheckTierUpgrade(p_user_id);
    END IF;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE CheckTierUpgrade(
    IN p_user_id INT
)
BEGIN
    DECLARE v_current_tier ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond');
    DECLARE v_new_tier ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond');
    DECLARE v_total_points INT;
    DECLARE v_tier_upgraded BOOLEAN DEFAULT FALSE;
    
    SELECT tier, total_points INTO v_current_tier, v_total_points
    FROM customer_loyalty_programs
    WHERE user_id = p_user_id
    LIMIT 1;
    
    -- Determine new tier based on total points
    IF v_total_points >= 20000 THEN
        SET v_new_tier = 'diamond';
    ELSEIF v_total_points >= 10000 THEN
        SET v_new_tier = 'platinum';
    ELSEIF v_total_points >= 5000 THEN
        SET v_new_tier = 'gold';
    ELSEIF v_total_points >= 2500 THEN
        SET v_new_tier = 'silver';
    ELSE
        SET v_new_tier = 'bronze';
    END IF;
    
    -- Update tier if upgraded
    IF v_new_tier != v_current_tier THEN
        UPDATE customer_loyalty_programs
        SET tier = v_new_tier,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id;
        
        SET v_tier_upgraded = TRUE;
        
        -- Award bonus points for tier upgrade
        IF v_tier_upgraded THEN
            INSERT INTO loyalty_points_transactions 
            (user_id, program_id, transaction_type, points, description, transaction_date)
            SELECT 
                p_user_id,
                id,
                'bonus',
                CASE v_new_tier
                    WHEN 'silver' THEN 100
                    WHEN 'gold' THEN 250
                    WHEN 'platinum' THEN 500
                    WHEN 'diamond' THEN 1000
                END,
                CONCAT('Tier upgrade bonus: ', UPPER(v_new_tier)),
                NOW()
            FROM customer_loyalty_programs
            WHERE user_id = p_user_id;
            
            -- Update available points with bonus
            UPDATE customer_loyalty_programs
            SET available_points = available_points + 
                CASE v_new_tier
                    WHEN 'silver' THEN 100
                    WHEN 'gold' THEN 250
                    WHEN 'platinum' THEN 500
                    WHEN 'diamond' THEN 1000
                END,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = p_user_id;
        END IF;
    END IF;
END //
DELIMITER ;

-- Add comments for documentation
ALTER TABLE prediction_feedback COMMENT = 'User feedback on AI predictions for model improvement';
ALTER TABLE vehicle_ai_models COMMENT = 'AI model data and predictions for each vehicle';
ALTER TABLE component_wear_history COMMENT = 'Historical wear data for vehicle components';
ALTER TABLE predictive_maintenance_alerts COMMENT = 'AI-generated maintenance alerts and recommendations';
ALTER TABLE ai_model_performance COMMENT = 'Performance metrics for AI prediction models';
ALTER TABLE customer_loyalty_programs COMMENT = 'Customer loyalty program enrollment and statistics';
ALTER TABLE loyalty_points_transactions COMMENT = 'All points earning, spending, and adjustment transactions';
ALTER TABLE rewards_catalog COMMENT = 'Available rewards that customers can redeem points for';
ALTER TABLE loyalty_rewards_redemptions COMMENT = 'Customer reward redemptions and their status';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON abe_garage.prediction_feedback TO 'abe_garage_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON abe_garage.vehicle_ai_models TO 'abe_garage_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON abe_garage.component_wear_history TO 'abe_garage_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON abe_garage.predictive_maintenance_alerts TO 'abe_garage_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON abe_garage.ai_model_performance TO 'abe_garage_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON abe_garage.customer_loyalty_programs TO 'abe_garage_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON abe_garage.loyalty_points_transactions TO 'abe_garage_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON abe_garage.rewards_catalog TO 'abe_garage_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON abe_garage.loyalty_rewards_redemptions TO 'abe_garage_user'@'localhost';

-- Execute stored procedures
GRANT EXECUTE ON PROCEDURE abe_garage.CalculateLoyaltyPoints TO 'abe_garage_user'@'localhost';
GRANT EXECUTE ON PROCEDURE abe_garage.CheckTierUpgrade TO 'abe_garage_user'@'localhost';

COMMIT;