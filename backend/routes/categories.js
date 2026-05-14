const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const categories = await db.all(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.active = 1
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const category = await db.get('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const result = await db.run('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
    const category = await db.get('SELECT * FROM categories WHERE id = ?', [result.lastID]);
    res.status(201).json(category);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Category name already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { name, description } = req.body;
    const existing = await db.get('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    await db.run('UPDATE categories SET name = ?, description = ? WHERE id = ?', [
      name ?? existing.name, description ?? existing.description, req.params.id
    ]);
    const category = await db.get('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json(category);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Category name already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const productCount = await db.get('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [req.params.id]);
    if (productCount.count > 0) {
      return res.status(400).json({ error: 'Cannot delete category with existing products. Reassign products first.' });
    }
    await db.run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
