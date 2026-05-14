const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../db');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// GET all products
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { category, featured, search, active = '1', page = 1, limit = 20 } = req.query;

    let where = 'WHERE 1=1';
    const params = [];

    if (active !== 'all') { where += ' AND p.active = ?'; params.push(parseInt(active)); }
    if (category) { where += ' AND p.category_id = ?'; params.push(parseInt(category)); }
    if (featured) { where += ' AND p.featured = ?'; params.push(parseInt(featured)); }
    if (req.query.best_seller) { where += ' AND p.best_seller = ?'; params.push(parseInt(req.query.best_seller)); }
    if (req.query.new_launch) { where += ' AND p.new_launch = ?'; params.push(parseInt(req.query.new_launch)); }
    if (search) { where += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    const total = await db.get(
      `SELECT COUNT(*) as total FROM products p ${where}`, params
    );

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const products = await db.all(`
      SELECT p.*, c.name as category_name,
        (SELECT filename FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
        (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    products.forEach(p => {
      if (p.primary_image) p.primary_image_url = `/uploads/${p.primary_image}`;
      p.discounted_price = p.discount_percent > 0 ? p.price * (1 - p.discount_percent / 100) : p.price;
    });

    res.json({ products, total: total?.total || 0, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const product = await db.get(`
      SELECT p.*, c.name as category_name
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (!product) return res.status(404).json({ error: 'Product not found' });

    const images = await db.all(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC',
      [req.params.id]
    );
    images.forEach(img => { img.url = `/uploads/${img.filename}`; });
    product.images = images;
    product.discounted_price = product.discount_percent > 0 ? product.price * (1 - product.discount_percent / 100) : product.price;

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create product
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const db = await getDb();
    const { name, description, price, discount_percent = 0, stock = 0, category_id, featured = 0, best_seller = 0, new_launch = 0, active = 1 } = req.body;

    if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });

    const result = await db.run(`
      INSERT INTO products (name, description, price, discount_percent, stock, category_id, featured, best_seller, new_launch, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, description, parseFloat(price), parseFloat(discount_percent), parseInt(stock),
      category_id ? parseInt(category_id) : null, parseInt(featured), parseInt(best_seller), parseInt(new_launch), parseInt(active)]);

    const productId = result.lastID;

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        await db.run(
          'INSERT INTO product_images (product_id, filename, is_primary, sort_order) VALUES (?, ?, ?, ?)',
          [productId, req.files[i].filename, i === 0 ? 1 : 0, i]
        );
      }
    }

    const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update product
router.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const db = await getDb();
    const existing = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const { name, description, price, discount_percent, stock, category_id, featured, best_seller, new_launch, active } = req.body;

    await db.run(`
      UPDATE products SET
        name = ?, description = ?, price = ?, discount_percent = ?,
        stock = ?, category_id = ?, featured = ?, best_seller = ?, new_launch = ?, active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name ?? existing.name,
      description ?? existing.description,
      price !== undefined ? parseFloat(price) : existing.price,
      discount_percent !== undefined ? parseFloat(discount_percent) : existing.discount_percent,
      stock !== undefined ? parseInt(stock) : existing.stock,
      category_id !== undefined ? (category_id ? parseInt(category_id) : null) : existing.category_id,
      featured !== undefined ? parseInt(featured) : existing.featured,
      best_seller !== undefined ? parseInt(best_seller) : existing.best_seller,
      new_launch !== undefined ? parseInt(new_launch) : existing.new_launch,
      active !== undefined ? parseInt(active) : existing.active,
      req.params.id
    ]);

    if (req.files && req.files.length > 0) {
      const countRow = await db.get('SELECT COUNT(*) as count FROM product_images WHERE product_id = ?', [req.params.id]);
      const primaryRow = await db.get('SELECT COUNT(*) as count FROM product_images WHERE product_id = ? AND is_primary = 1', [req.params.id]);
      for (let i = 0; i < req.files.length; i++) {
        const isPrimary = primaryRow.count === 0 && i === 0 ? 1 : 0;
        await db.run(
          'INSERT INTO product_images (product_id, filename, is_primary, sort_order) VALUES (?, ?, ?, ?)',
          [req.params.id, req.files[i].filename, isPrimary, countRow.count + i]
        );
      }
    }

    const product = await db.get(`
      SELECT p.*, c.name as category_name
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);

    const images = await db.all(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC',
      [req.params.id]
    );
    images.forEach(img => { img.url = `/uploads/${img.filename}`; });
    product.images = images;

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const images = await db.all('SELECT filename FROM product_images WHERE product_id = ?', [req.params.id]);
    images.forEach(img => {
      const filePath = path.join(__dirname, '../uploads', img.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a specific image
router.delete('/:id/images/:imageId', async (req, res) => {
  try {
    const db = await getDb();
    const image = await db.get('SELECT * FROM product_images WHERE id = ? AND product_id = ?', [req.params.imageId, req.params.id]);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    const filePath = path.join(__dirname, '../uploads', image.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.run('DELETE FROM product_images WHERE id = ?', [req.params.imageId]);

    if (image.is_primary) {
      const nextImage = await db.get('SELECT id FROM product_images WHERE product_id = ? ORDER BY sort_order ASC LIMIT 1', [req.params.id]);
      if (nextImage) await db.run('UPDATE product_images SET is_primary = 1 WHERE id = ?', [nextImage.id]);
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SET primary image
router.put('/:id/images/:imageId/primary', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [req.params.id]);
    await db.run('UPDATE product_images SET is_primary = 1 WHERE id = ? AND product_id = ?', [req.params.imageId, req.params.id]);
    res.json({ message: 'Primary image updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
