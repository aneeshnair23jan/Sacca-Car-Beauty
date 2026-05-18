import { connectDb, Product, Category } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { isMultipartRequest, readJsonRequestBody } from '@/lib/apiRequest';
import { upload, runMiddleware, uploadFilesToStorage, getStoredFileUrl } from '@/lib/upload';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  await connectDb();

  // ── GET /api/products ──────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const {
        category, featured, best_seller, new_launch,
        search, active = '1', page = 1, limit = 20,
      } = req.query;

      const filter = {};
      if (active !== 'all') filter.active = active === '1';
      if (category) filter.category_id = category;
      if (featured) filter.featured = featured === '1';
      if (best_seller) filter.best_seller = best_seller === '1';
      if (new_launch) filter.new_launch = new_launch === '1';
      if (search) filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];

      const total = await Product.countDocuments(filter);
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const products = await Product.find(filter)
        .populate('category_id', 'name')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(parseInt(limit))
        .lean({ virtuals: true });

      const result = products.map((p) => serializeProduct(p));
      return res.json({ products: result, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST /api/products ─────────────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      requireAuth(req);
      if (isMultipartRequest(req)) {
        await runMiddleware(req, res, upload.array('images', 10));
      } else {
        req.body = await readJsonRequestBody(req);
        req.files = [];
      }

      const {
        name, description, price,
        discount_percent = 0, stock = 0, category_id,
        featured = '0', best_seller = '0', new_launch = '0', active = '1',
        video_url = '', seo_title = '', seo_description = '',
        variants = '[]', vehicle_compatibility = '[]', reviews = '[]',
        related_product_ids = '',
      } = req.body;

      if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });

      const storedImages = await uploadFilesToStorage(req.files || []);
      const images = storedImages.map((image, i) => ({
        filename: image.filename,
        is_primary: i === 0,
        sort_order: i,
      }));

      const product = await Product.create({
        name, description,
        price: parseFloat(price),
        discount_percent: parseFloat(discount_percent),
        stock: parseInt(stock),
        category_id: category_id || null,
        featured: featured === '1' || featured === true,
        best_seller: best_seller === '1' || best_seller === true,
        new_launch: new_launch === '1' || new_launch === true,
        active: active === '1' || active === true,
        images,
        video_url,
        seo_title,
        seo_description,
        variants: parseJsonArray(variants),
        vehicle_compatibility: parseJsonArray(vehicle_compatibility),
        reviews: parseJsonArray(reviews).map((review) => ({
          ...review,
          rating: Number(review.rating) || 5,
        })),
        related_product_ids: parseIdList(related_product_ids),
      });

      const populated = await Product.findById(product._id)
        .populate('category_id', 'name')
        .lean({ virtuals: true });

      return res.status(201).json(serializeProduct(populated));
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// ── Helpers ──────────────────────────────────────────────────────────────────
export function serializeProduct(p) {
  const primary = p.images?.find((i) => i.is_primary) || p.images?.[0];
  return {
    ...p,
    id: p._id?.toString(),
    category_id: p.category_id?._id?.toString() || p.category_id?.toString() || null,
    category_name: p.category_id?.name || null,
    primary_image_url: primary ? getStoredFileUrl(primary.filename) : null,
    image_count: p.images?.length || 0,
    discounted_price: p.discount_percent > 0
      ? p.price * (1 - p.discount_percent / 100)
      : p.price,
    // Normalize booleans to 0/1 so frontend comparisons (=== 1) still work
    featured: p.featured ? 1 : 0,
    best_seller: p.best_seller ? 1 : 0,
    new_launch: p.new_launch ? 1 : 0,
    active: p.active ? 1 : 0,
    video_url: p.video_url || '',
    seo_title: p.seo_title || '',
    seo_description: p.seo_description || '',
    variants: p.variants || [],
    vehicle_compatibility: p.vehicle_compatibility || [],
    reviews: p.reviews || [],
    related_product_ids: (p.related_product_ids || []).map((id) => id?.toString()),
  };
}

export function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseIdList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}
