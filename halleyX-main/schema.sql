CREATE DATABASE IF NOT EXISTS halleyx;
USE halleyx;

DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
  id CHAR(36) NOT NULL PRIMARY KEY,
  customerId VARCHAR(64) NOT NULL,
  customerName VARCHAR(128) NOT NULL,
  firstName VARCHAR(64) NOT NULL,
  lastName VARCHAR(64) NOT NULL,
  email VARCHAR(128) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  streetAddress VARCHAR(255) NOT NULL,
  city VARCHAR(128) NOT NULL,
  state VARCHAR(128) NOT NULL,
  postalCode VARCHAR(32) NOT NULL,
  country VARCHAR(64) NOT NULL,
  product VARCHAR(128) NOT NULL,
  quantity INT NOT NULL CHECK (quantity >= 0),
  unitPrice DECIMAL(12, 2) NOT NULL CHECK (unitPrice >= 0),
  totalAmount DECIMAL(14, 2) NOT NULL CHECK (totalAmount >= 0),
  status ENUM('Pending', 'In progress', 'Completed') NOT NULL DEFAULT 'Pending',
  createdBy VARCHAR(64) NOT NULL,
  orderDate DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE orders
  ADD INDEX idx_customerId (customerId),
  ADD INDEX idx_status (status),
  ADD INDEX idx_orderDate (orderDate);
