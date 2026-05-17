import mongoose from 'mongoose';
import { connectDb, Category, Product } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;
  await connectDb();

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }

  if (req.method === 'GET') {
    try {
      const category = await Category.findById(id).lean();
      if (!category) return res.status(404).json({ error: 'Category not found' });
      return res.json({ ...category, id: category._id.toString() });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      requireAuth(req);
      const { name, description, image_url } = req.body;
      const category = await Category.findByIdAndUpdate(
        id,
        {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(image_url !== undefined && { image_url }),
        },
        { new: true, runValidators: true }
      ).lean();
      if (!category) return res.status(404).json({ error: 'Category not found' });
      return res.json({ ...category, id: category._id.toString() });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      if (err.code === 11000) return res.status(400).json({ error: 'Category name already exists' });
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      requireAuth(req);
      const category = await Category.findById(id);
      if (!category) return res.status(404).json({ error: 'Category not found' });

      const productCount = await Product.countDocuments({ category_id: id });
      if (productCount > 0) {
        await Product.updateMany({ category_id: id }, { $set: { category_id: null } });
      }

      await Category.findByIdAndDelete(id);
      return res.json({
        message: productCount > 0
          ? `Category deleted and ${productCount} product${productCount !== 1 ? 's were' : ' was'} moved to Uncategorized.`
          : 'Category deleted successfully',
      });
    } catch (err) {
      console.error('Category delete failed:', err);
      if (err.status) return res.status(err.status).json({ error: err.message });
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
