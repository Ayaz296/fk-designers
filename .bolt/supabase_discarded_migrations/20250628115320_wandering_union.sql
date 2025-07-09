-- FK Designers Database Schema
-- Run this script in your Hostinger MySQL database

-- Create database (if not already created in Hostinger panel)
-- CREATE DATABASE fk_designers_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE fk_designers_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'staff', 'admin') DEFAULT 'customer',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_active (is_active)
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  customer_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  date_of_birth DATE,
  address_1 TEXT,
  address_2 TEXT,
  
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
  staff_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  position VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  category ENUM('men', 'kids', 'fabric') NOT NULL,
  subcategory VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  composition VARCHAR(255) NOT NULL,
  fabric_pattern VARCHAR(50),
  images JSON NOT NULL,
  colors JSON NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  best_seller BOOLEAN DEFAULT FALSE,
  new_arrival BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_category (category),
  INDEX idx_subcategory (subcategory),
  INDEX idx_featured (featured),
  INDEX idx_best_seller (best_seller),
  INDEX idx_new_arrival (new_arrival),
  INDEX idx_price (price),
  FULLTEXT idx_search (name, description, composition)
);

-- Contact inquiries table
CREATE TABLE IF NOT EXISTS contact_inquiries (
  inquiry_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  ip_address VARCHAR(45),
  status ENUM('new', 'in_progress', 'resolved') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Customization requests table
CREATE TABLE IF NOT EXISTS customization_requests (
  request_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  service_type ENUM('custom-tailoring', 'fabric-selection', 'design-consultation', 'alterations') NOT NULL,
  description TEXT NOT NULL,
  budget VARCHAR(50),
  timeline VARCHAR(50),
  measurements TEXT,
  ip_address VARCHAR(45),
  status ENUM('new', 'in_progress', 'completed', 'cancelled') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_service_type (service_type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  details JSON,
  
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_timestamp (timestamp)
);

-- Insert default admin user
INSERT IGNORE INTO users (user_id, first_name, last_name, email, phone, password_hash, role, is_active) 
VALUES (1, 'Admin', 'User', 'admin@fkdesigners.com', '+91 98765 43210', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcQjyQ/Ka', 'admin', TRUE);

-- Insert admin staff record
INSERT IGNORE INTO staff (user_id, position, department, start_date) 
VALUES (1, 'System Administrator', 'IT', '2025-01-01');

-- Insert sample products
INSERT IGNORE INTO products (id, name, price, price_min, price_max, category, subcategory, description, composition, images, colors, featured, best_seller, new_arrival) VALUES
('FK001', 'Royal Maharaja Sherwani', 24999, 24999, 35999, 'men', 'ethnic', 'Exquisite hand-embroidered sherwani with intricate gold thread work. Perfect for weddings and special occasions. Comes with matching accessories.', '70% Silk, 30% Cotton', '["https://images.pexels.com/photos/2531734/pexels-photo-2531734.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", "https://images.pexels.com/photos/2705511/pexels-photo-2705511.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]', '["Gold", "Maroon", "Navy Blue"]', TRUE, TRUE, FALSE),

('FK002', 'Kids Festive Kurta Set', 5999, 5999, 8999, 'kids', 'ethnic', 'Luxurious festive kurta set for kids with embroidered details. Perfect for special occasions and festivals.', '100% Cotton', '["https://images.pexels.com/photos/8352391/pexels-photo-8352391.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]', '["Blue", "Beige", "Green"]', FALSE, FALSE, TRUE),

('FK003', 'Formal Nehru Jacket', 7999, 7999, 12999, 'men', 'jackets', 'Sophisticated Nehru jacket with subtle embroidery. Perfect for formal occasions, pairing with kurtas or shirts.', '80% Wool, 20% Polyester', '["https://images.pexels.com/photos/2767036/pexels-photo-2767036.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]', '["Black", "Maroon", "Navy Blue"]', FALSE, TRUE, FALSE),

('FK004', 'Premium Silk Fabric - Solid', 2999, 2999, 8999, 'fabric', 'silk', 'Premium quality silk fabric perfect for custom tailoring. Available in various colors and patterns.', '100% Pure Silk', '["https://images.pexels.com/photos/6292842/pexels-photo-6292842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"]', '["Red", "Gold", "Blue", "Green", "Purple"]', TRUE, FALSE, FALSE);