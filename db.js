const Database = require("better-sqlite3");

const db = new Database("restaurant.db");
db.pragma("foreign_keys = ON");

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Customer (
      customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      phone_number VARCHAR(20),
      email VARCHAR(150)
    );

    CREATE TABLE IF NOT EXISTS DiningTable (
      table_id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number INTEGER,
      capacity INTEGER
    );

    CREATE TABLE IF NOT EXISTS MenuItem (
      menu_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(150),
      description VARCHAR(500),
      price DECIMAL(10,2),
      is_available BOOLEAN
    );

    CREATE TABLE IF NOT EXISTS Reservation (
      reservation_id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_time TIMESTAMP,
      party_size INTEGER,
      special_request VARCHAR(500),
      status VARCHAR(50),
      customer_id INTEGER NOT NULL REFERENCES Customer(customer_id),
      table_id INTEGER NOT NULL REFERENCES DiningTable(table_id)
    );

    CREATE TABLE IF NOT EXISTS Orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_time TIMESTAMP,
      order_type VARCHAR(50),
      order_complete BOOLEAN,
      customer_id INTEGER NOT NULL REFERENCES Customer(customer_id)
    );

    CREATE TABLE IF NOT EXISTS OrderItem (
      order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      quantity INTEGER,
      item_price DECIMAL(10,2),
      order_id INTEGER NOT NULL REFERENCES Orders(order_id),
      menu_item_id INTEGER NOT NULL REFERENCES MenuItem(menu_item_id)
    );

    CREATE TABLE IF NOT EXISTS Payment (
      payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount DECIMAL(10,2),
      method VARCHAR(50),
      status VARCHAR(50),
      paid_time TIMESTAMP,
      order_id INTEGER NOT NULL REFERENCES Orders(order_id)
    );
  `);

  const customerCount = db.prepare("SELECT COUNT(*) AS count FROM Customer").get().count;
  if (customerCount === 0) {
    db.prepare(`
      INSERT INTO Customer (first_name, last_name, phone_number, email)
      VALUES
      ('Maria', 'Lopez', '520-456-2234', 'marialovessushi@gmail.com'),
      ('Aarav', 'Patel', '520-111-2211', 'aarav@example.com')
    `).run();
  }

  const tableCount = db.prepare("SELECT COUNT(*) AS count FROM DiningTable").get().count;
  if (tableCount === 0) {
    db.prepare(`
      INSERT INTO DiningTable (table_number, capacity)
      VALUES (1, 2), (2, 4), (3, 6), (4, 8)
    `).run();
  }

  const menuCount = db.prepare("SELECT COUNT(*) AS count FROM MenuItem").get().count;
  if (menuCount === 0) {
    db.prepare(`
      INSERT INTO MenuItem (name, description, price, is_available)
      VALUES
      ('Grilled Sushi', 'Chef special grilled sushi rolls', 14.99, 1),
      ('Pizza with Vodka Sauce', 'Signature pizza with creamy vodka sauce', 21.99, 1),
      ('Miso Soup', 'Classic miso broth with tofu', 5.99, 1)
    `).run();
  }
}

module.exports = { db, initializeDatabase };
