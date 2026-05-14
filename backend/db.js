const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

let db;

async function getDb() {
  if (db) return db;

  db = await open({
    filename: path.join(__dirname, 'sacca.db'),
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA journal_mode = WAL;');
  await db.exec('PRAGMA foreign_keys = ON;');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      discount_percent REAL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      category_id INTEGER,
      featured INTEGER DEFAULT 0,
      best_seller INTEGER DEFAULT 0,
      new_launch INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Default settings
  const defaults = [
    ['whatsapp_number', '+1234567890'],
    ['shop_name', 'Sacca Car Beauty'],
    ['shop_tagline', 'Premium Car Accessories'],
    ['shop_description', 'Your one-stop shop for premium car accessories and detailing products.'],
    ['currency', 'USD'],
    ['currency_symbol', '$'],
  ];
  for (const [key, value] of defaults) {
    await db.run('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  }

  // Default categories
  const catCount = await db.get('SELECT COUNT(*) as count FROM categories');
  if (catCount.count === 0) {
    const cats = [
      ['Car Care', 'Cleaning and detailing products'],
      ['Interior', 'Interior accessories and upgrades'],
      ['Exterior', 'Exterior accessories and styling'],
      ['Electronics', 'Car electronics and gadgets'],
      ['Performance', 'Performance parts and upgrades'],
    ];
    for (const [name, desc] of cats) {
      await db.run('INSERT INTO categories (name, description) VALUES (?, ?)', [name, desc]);
    }
  }

  // Default admin user (admin / admin123) — change password after first login
  const adminCount = await db.get('SELECT COUNT(*) as count FROM admin_users');
  if (adminCount.count === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await db.run('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', ['admin', hash]);
    console.log('Default admin created — username: admin, password: admin123');
  }

  return db;
}

module.exports = { getDb };
