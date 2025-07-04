-- Create database (if not already created)
CREATE DATABASE IF NOT EXISTS eeelab46_snapboothdb DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eeelab46_snapboothdb;

-- Table for analytics events
CREATE TABLE IF NOT EXISTS analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_key VARCHAR(64) NOT NULL,
    event_type VARCHAR(32) NOT NULL,
    event_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for branding settings
CREATE TABLE IF NOT EXISTS branding (
    device_key VARCHAR(64) PRIMARY KEY,
    logo_url VARCHAR(255),
    primary_color VARCHAR(16),
    welcome_message TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for device configs (for remote update/config)
CREATE TABLE IF NOT EXISTS device_config (
    device_key VARCHAR(64) PRIMARY KEY,
    config_json TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for support logs
CREATE TABLE IF NOT EXISTS support_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_key VARCHAR(64) NOT NULL,
    log_message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

