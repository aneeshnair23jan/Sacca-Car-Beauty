import mongoose from 'mongoose';
import { connectDb, Product } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { isMultipartRequest, readJsonRequestBody } from '@/lib/apiRequest';
import { upload, runMiddleware, uploadFilesToStorage, deleteStoredFile, getStoredFileUrl } from '@/lib/upload';
import { parseIdList, parseJsonArray, serializeProduct } from './index';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const { id } = req.query;
  await connectDb();

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  // ── GET /api/products/:id ──────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const product = await Product.findById(id)
        .populate('category_id', 'name')
        .lean({ virtuals: true });
      if (!product) return res.status(404).json({ error: 'Product not found' });

      const serialized = serializeProduct(product);
      // Attach full image list with urls for the product detail page
      serialized.images = (product.images || []).map((img) => ({
        ...img,
        id: img._id?.toString(),
        url: getStoredFileUrl(img.filename),
      }));

      return res.json(serialized);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── PUT /api/products/:id ──────────────────────────────────────────────────
  if (req.method === 'PUT') {
    try {
      requireAuth(req);
      if (isMultipartRequest(req)) {
        await runMiddleware(req, res, upload.array('images', 10));
      } else {
        req.body = await readJsonRequestBody(req);
        req.files = [];
      }

      const existing = await Product.findById(id);
      if (!existing) return res.status(404).json({ error: 'Product not found' });

      const {
        name, description, price, discount_percent, stock,
        category_id, featured, best_seller, new_launch, active,
        video_url, seo_title, seo_description,
        variants, vehicle_compatibility, reviews, related_product_ids,
      } = req.body;

      if (name !== undefined) existing.name = name;
      if (description !== undefined) existing.description = description;
      if (price !== undefined) existing.price = parseFloat(price);
      if (discount_percent !== undefined) existing.discount_percent = parseFloat(discount_percent);
      if (stock !== undefined) existing.stock = parseInt(stock);
      if (category_id !== undefined) existing.category_id = category_id || null;
      if (featured !== undefined) existing.featured = featured === '1' || featured === true || featured === 1;
      if (best_seller !== undefined) existing.best_seller = best_seller === '1' || best_seller === true || best_seller === 1;
      if (new_launch !== undefined) existing.new_launch = new_launch === '1' || new_launch === true || new_launch === 1;
      if (active !== undefined) existing.active = active === '1' || active === true || active === 1;
      if (video_url !== undefined) existing.video_url = video_url;
      if (seo_title !== undefined) existing.seo_title = seo_title;
      if (seo_description !== undefined) existing.seo_description = seo_description;
      if (variants !== undefined) existing.variants = parseJsonArray(variants);
      if (vehicle_compatibility !== undefined) existing.vehicle_compatibility = parseJsonArray(vehicle_compatibility);
      if (reviews !== undefined) {
        existing.reviews = parseJsonArray(reviews).map((review) => ({
          ...review,
          rating: Number(review.rating) || 5,
        }));
      }
      if (related_product_ids !== undefined) existing.related_product_ids = parseIdList(related_product_ids);

      // Append new uploaded images
      if (req.files?.length > 0) {
        const hasPrimary = existing.images.some((i) => i.is_primary);
        const storedImages = await uploadFilesToStorage(req.files);
        storedImages.forEach((image, i) => {
          existing.images.push({
            filename: image.filename,
            is_primary: !hasPrimary && i === 0,
            sort_order: existing.images.length + i,
          });
        });
      }

      await existing.save();

      const updated = await Product.findById(id)
        .populate('category_id', 'name')
        .lean({ virtuals: true });

      const serialized = serializeProduct(updated);
      serialized.images = (updated.images || []).map((img) => ({
        ...img,
        id: img._id?.toString(),
        url: getStoredFileUrl(img.filename),
      }));

      return res.json(serialized);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      return res.status(500).json({ error: err.message });
    }
  }

  // ── DELETE /api/products/:id ───────────────────────────────────────────────
  if (req.method === 'DELETE') {
    try {
      requireAuth(req);
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      // Delete product image objects from the configured storage backend.
      await Promise.all(product.images.map((img) => deleteStoredFile(img.filename)));

      await product.deleteOne();
      return res.json({ message: 'Product deleted successfully' });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
