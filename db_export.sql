-- Advanced Expense Tracker database export for Assignment 2
-- Demo login accounts:
-- Admin: username admin, password admin123
-- User:  username user,  password user123

DROP DATABASE IF EXISTS expense_tracker;
CREATE DATABASE expense_tracker;
USE expense_tracker;

DROP TABLE IF EXISTS user_activities;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'User') NOT NULL DEFAULT 'User',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_expenses_user_id (user_id),
  INDEX idx_expenses_category (category),
  CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_activities (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_activities_user_id (user_id),
  CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (id, username, email, password_hash, role) VALUES
(1, 'admin', 'admin@example.com', 'pbkdf2_sha256$100000$cab64e9c2f379a675554ad0254a5de74$75636ec4998a6682fe6e0e25a077468d6fd6f9ce01600afc15ba578b930c9231', 'Admin'),
(2, 'user', 'user@example.com', 'pbkdf2_sha256$100000$fee5d245db62f58a939405e0a2bf48cf$45ca539f08688364a132bfb8bdb334d6e2ab8f41e3daea767ab256065f220c96', 'User');

INSERT INTO categories (name) VALUES
('Food'),
('Transport'),
('Shopping'),
('Entertainment'),
('Bills'),
('Health'),
('Education'),
('Other');

INSERT INTO expenses (id, user_id, title, category, amount, expense_date, description, created_at, updated_at) VALUES
(1, 2, 'Lunch', 'Food', 18.50, '2026-04-01', 'Noodles and drink', '2026-04-05 05:03:37', '2026-04-05 05:03:37'),
(2, 2, 'Bus Card Top-up', 'Transport', 25.00, '2026-04-02', 'Weekly transport recharge', '2026-04-05 05:03:37', '2026-04-05 05:03:37'),
(3, 2, 'Movie Ticket', 'Entertainment', 21.90, '2026-01-16', 'Weekend movie', '2026-04-05 05:03:37', '2026-04-07 12:21:28'),
(4, 1, 'Diving', 'Entertainment', 1000.00, '2026-04-01', 'An experience of diving.', '2026-04-05 13:57:31', '2026-04-05 13:57:31'),
(5, 2, 'Bus transportation', 'Transport', 20.40, '2026-02-05', NULL, '2026-04-07 09:42:09', '2026-04-07 12:21:11'),
(6, 2, 'Grocery shopping', 'Shopping', 100.00, '2026-04-06', NULL, '2026-04-07 11:02:55', '2026-04-07 14:42:51'),
(7, 1, 'Travel', 'Other', 300.00, '2026-03-30', 'Fee of travelling', '2026-04-07 12:09:59', '2026-04-07 12:09:59'),
(8, 2, 'Dinner', 'Food', 30.00, '2026-03-28', NULL, '2026-04-07 12:14:05', '2026-04-07 12:14:05');

INSERT INTO user_activities (user_id, action, details) VALUES
(1, 'SEED_DATABASE', 'Initial admin account and demo data were created.'),
(2, 'SEED_DATABASE', 'Initial user account and demo expenses were created.');
