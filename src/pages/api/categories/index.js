import { connectDb, Category, Product } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export default async function handler(req, res) {
  await connectDb();

  if (req.method === 'GET') {
    try {
      const categories = await Category.find().sort({ name: 1 }).lean();

      // Attach active product counts
      const counts = await Product.aggregate([
        { $match: { active: true } },
        { $group: { _id: '$category_id', count: { $sum: 1 } } },
      ]);
      const countMap = {};
      counts.forEach((c) => { if (c._id) countMap[c._id.toString()] = c.count; });

      const result = categories.map((c) => ({
        ...c,
        id: c._id.toString(),
        product_count: countMap[c._id.toString()] || 0,
      }));

      return res.json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      requireAuth(req);
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ error: 'Category name is required' });

      const category = await Category.create({ name, description });
      return res.status(201).json({ ...category.toObject(), id: category._id.toString() });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      if (err.code === 11000) return res.status(400).json({ error: 'Category name already exists' });
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
