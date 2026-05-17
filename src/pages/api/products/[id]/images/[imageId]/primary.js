import mongoose from 'mongoose';
import { connectDb, Product } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export default async function handler(req, res) {
  const { id, imageId } = req.query;

  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  try {
    requireAuth(req);
    await connectDb();

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(imageId)) {
      return res.status(400).json({ error: 'Invalid image request ID' });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Clear all primaries then set the chosen one
    product.images.forEach((img) => { img.is_primary = false; });
    const target = product.images.id(imageId);
    if (!target) return res.status(404).json({ error: 'Image not found' });
    target.is_primary = true;

    await product.save();
    return res.json({ message: 'Primary image updated' });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: err.message });
  }
}
