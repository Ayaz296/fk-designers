/*
  # Remove Sample Products

  1. Data Cleanup
    - Remove all sample products (FK001, FK002, FK003, FK004)
    - Keep only the admin user and essential system data
    - Clean database for production use

  2. Notes
    - This migration removes example/demo products
    - Admin user remains for system access
    - Database structure remains intact
*/

-- Remove sample products
DELETE FROM products WHERE id IN ('FK001', 'FK002', 'FK003', 'FK004');

-- Reset auto-increment for any tables if needed (MySQL specific)
-- Note: This is optional and depends on your preference
-- ALTER TABLE products AUTO_INCREMENT = 1;