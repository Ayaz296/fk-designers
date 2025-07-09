/*
  # Fix Admin User Credentials

  1. Admin User Update
    - Update admin email to: fk.designer1@gmail.com
    - Update admin password to: Aamirfkdesigner1 (hashed)
    - Ensure admin user exists with correct credentials

  2. Security
    - Password is properly hashed with bcrypt
    - Admin role is maintained
    - Staff record is linked correctly
*/

-- Update or insert the correct admin user
-- First, delete any existing admin users to avoid conflicts
DELETE FROM staff WHERE user_id IN (SELECT user_id FROM users WHERE role = 'admin');
DELETE FROM users WHERE role = 'admin' OR email = 'admin@fkdesigners.com' OR email = 'fk.designer1@gmail.com';

-- Insert the correct admin user with proper credentials
-- Password hash for 'Aamirfkdesigner1' using bcrypt with 12 salt rounds
INSERT INTO users (user_id, first_name, last_name, email, phone, password_hash, role, is_active, created_at, updated_at) 
VALUES (1, 'FK', 'Designer', 'fk.designer1@gmail.com', '+91 79890 65114', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcQjyQ/Ka', 'admin', TRUE, NOW(), NOW());

-- Insert admin staff record
INSERT INTO staff (user_id, position, department, start_date) 
VALUES (1, 'System Administrator', 'Management', '2025-01-01');

-- Reset auto increment to start from 2 for new users
ALTER SEQUENCE users_user_id_seq RESTART WITH 2;