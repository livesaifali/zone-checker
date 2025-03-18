
-- Create the database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS zone_checker_db;

USE zone_checker_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- Will store hashed passwords eventually
  email VARCHAR(100),
  role ENUM('superadmin', 'admin', 'user') NOT NULL DEFAULT 'user',
  concern_id VARCHAR(20) NOT NULL,
  password_is_hashed BOOLEAN DEFAULT 0,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cities/Zones table
CREATE TABLE IF NOT EXISTS cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  concern_id VARCHAR(20) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Status updates table
CREATE TABLE IF NOT EXISTS status_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  comment TEXT,
  updated_by INT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Status history table
CREATE TABLE IF NOT EXISTS status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  comment TEXT,
  updated_by INT NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATETIME,
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'updated') NOT NULL DEFAULT 'pending',
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Task assignments table (which zones are assigned to a task)
CREATE TABLE IF NOT EXISTS task_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  concern_id VARCHAR(20) NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Task comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert initial admin user 
-- Note: In a production environment, use hashed passwords
INSERT INTO users (username, password, role, concern_id, email) 
VALUES ('admin', 'admin123', 'superadmin', 'ADMIN', 'admin@example.com')
ON DUPLICATE KEY UPDATE role='superadmin';

-- Insert an additional normal admin user
INSERT INTO users (username, password, role, concern_id, email) 
VALUES ('manager', 'manager123', 'admin', 'MANAGER', 'manager@example.com')
ON DUPLICATE KEY UPDATE role='admin';

-- Insert initial cities
INSERT INTO cities (name, concern_id) 
VALUES 
  ('Karachi', 'KHI001'),
  ('Lahore', 'LHR001'),
  ('Islamabad', 'ISB001'),
  ('Hyderabad', 'HYD001'),
  ('Sukkur', 'SUK001'),
  ('Larkana', 'LRK001'),
  ('Rawalpindi', 'RWP001'),
  ('Head Office', 'HQ001'),
  ('Peshawar', 'PSH001'),
  ('Quetta', 'QTA001'),
  ('Multan', 'MUL001'),
  ('Faisalabad', 'FSD001')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert city users
INSERT INTO users (username, password, role, concern_id, email)
VALUES 
  ('karachi', 'user123', 'user', 'KHI001', 'karachi@example.com'),
  ('lahore', 'user123', 'user', 'LHR001', 'lahore@example.com'),
  ('islamabad', 'user123', 'user', 'ISB001', 'islamabad@example.com'),
  ('hyderabad', 'user123', 'user', 'HYD001', 'hyderabad@example.com'),
  ('sukkur', 'user123', 'user', 'SUK001', 'sukkur@example.com'),
  ('peshawar', 'user123', 'user', 'PSH001', 'peshawar@example.com')
ON DUPLICATE KEY UPDATE role='user';
