/*
  # Fix Admin User Final

  1. Clean up existing admin users
  2. Create correct admin user with proper credentials
  3. Ensure no conflicts with email uniqueness

  Admin Credentials:
  - Email: fk.designer1@gmail.com
  - Password: Aamirfkdesigner1 (hashed)
  - Role: admin
*/

-- Remove any existing admin users to prevent conflicts
DELETE FROM staff WHERE user_id IN (
  SELECT user_id FROM users WHERE role = 'admin' OR email ILIKE '%admin%' OR email = 'fk.designer1@gmail.com'
);

DELETE FROM customers WHERE user_id IN (
  SELECT user_id FROM users WHERE role = 'admin' OR email ILIKE '%admin%' OR email = 'fk.designer1@gmail.com'
);

DELETE FROM users WHERE role = 'admin' OR email ILIKE '%admin%' OR email = 'fk.designer1@gmail.com';

-- Insert the correct admin user
-- Password hash for 'Aamirfkdesigner1' using bcrypt with 12 salt rounds
INSERT INTO users (
  user_id, 
  first_name, 
  last_name, 
  email, 
  phone, 
  password_hash, 
  role, 
  is_active, 
  created_at, 
  updated_at
) VALUES (
  1, 
  'FK', 
  'Designer', 
  'fk.designer1@gmail.com', 
  '+91 79890 65114', 
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcQjyQ/Ka', 
  'admin', 
  TRUE, 
  NOW(), 
  NOW()
);

-- Insert admin staff record
INSERT INTO staff (user_id, position, department, start_date) 
VALUES (1, 'System Administrator', 'Management', '2025-01-01');

-- Reset auto increment to start from 2 for new users
SELECT setval('users_user_id_seq', 2, false);

-- Verify the admin user was created correctly
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE email = 'fk.designer1@gmail.com' AND role = 'admin') THEN
    RAISE NOTICE 'Admin user created successfully: fk.designer1@gmail.com';
  ELSE
    RAISE EXCEPTION 'Failed to create admin user';
  END IF;
END $$;