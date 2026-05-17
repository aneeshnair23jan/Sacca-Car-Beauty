import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDb, Product } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export default async function handler(req, res) {
  const { id, imageId } = req.query;

  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  try {
    requireAuth(req);
    await connectDb();

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(imageId)) {
      return res.status(400).json({ error: 'Invalid image request ID' });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const image = product.images.id(imageId);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    // Delete file from disk
    const filePath = path.join(process.cwd(), 'public', 'uploads', image.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const wasPrimary = image.is_primary;
    image.deleteOne();

    // Promote next image to primary if needed
    if (wasPrimary && product.images.length > 0) {
      product.images[0].is_primary = true;
    }

    await product.save();
    return res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: err.message });
  }
}
