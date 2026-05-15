import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { CMS_SETTING_KEY, serializeCmsContent } from '@/lib/cms';
import { defaultCmsContent } from '@/lib/cmsDefaults';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('Please define MONGODB_URI in .env.local');

// ── Connection cache (reused across hot-reloads in dev) ──────────────────────
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function connectDb() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }
  cached.conn = await cached.promise;
  await seedDefaults();
  return cached.conn;
}

// ── Schemas ──────────────────────────────────────────────────────────────────

const CategorySchema = new mongoose.Schema(
  { name: { type: String, required: true, unique: true }, description: String },
  { timestamps: true }
);

const ProductImageSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    is_primary: { type: Boolean, default: false },
    sort_order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ProductVariantSchema = new mongoose.Schema(
  {
    name: String,
    value: String,
    price_delta: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
  },
  { _id: false }
);

const VehicleCompatibilitySchema = new mongoose.Schema(
  {
    brand: String,
    model: String,
    year: String,
  },
  { _id: false }
);

const ProductReviewSchema = new mongoose.Schema(
  {
    name: String,
    rating: { type: Number, default: 5 },
    comment: String,
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    discount_percent: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    featured: { type: Boolean, default: false },
    best_seller: { type: Boolean, default: false },
    new_launch: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    images: [ProductImageSchema],
    video_url: String,
    seo_title: String,
    seo_description: String,
    variants: [ProductVariantSchema],
    vehicle_compatibility: [VehicleCompatibilitySchema],
    reviews: [ProductReviewSchema],
    related_product_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

// Virtual: discounted_price
ProductSchema.virtual('discounted_price').get(function () {
  return this.discount_percent > 0
    ? this.price * (1 - this.discount_percent / 100)
    : this.price;
});

// Virtual: primary_image_url
ProductSchema.virtual('primary_image_url').get(function () {
  const primary = this.images?.find((i) => i.is_primary) || this.images?.[0];
  return primary ? `/uploads/${primary.filename}` : null;
});

ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: String,
});

const AdminUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
  },
  { timestamps: true }
);

// ── Model getters (safe for Next.js hot-reload) ──────────────────────────────
export const Category =
  mongoose.models.Category || mongoose.model('Category', CategorySchema);

export const Product =
  mongoose.models.Product || mongoose.model('Product', ProductSchema);

export const Setting =
  mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

export const AdminUser =
  mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);

// ── Seed defaults on first connect ──────────────────────────────────────────
async function seedDefaults() {
  // Settings
  const defaultSettings = [
    { key: 'shop_name',          value: process.env.ADMIN_SHOP_NAME     || 'My Shop' },
    { key: 'shop_tagline',       value: process.env.ADMIN_SHOP_TAGLINE  || '' },
    { key: 'shop_description',   value: process.env.ADMIN_SHOP_DESC     || '' },
    { key: 'whatsapp_number',    value: process.env.ADMIN_WHATSAPP      || '' },
    { key: 'currency',           value: process.env.ADMIN_CURRENCY      || 'USD' },
    { key: 'currency_symbol',    value: process.env.ADMIN_CURRENCY_SYM  || '$' },
    { key: 'feature_1',          value: 'Order via WhatsApp' },
    { key: 'feature_2',          value: 'Premium Quality Products' },
    { key: 'feature_3',          value: 'Top Rated Store' },
    { key: 'whatsapp_cta_title', value: 'Order via WhatsApp' },
    { key: 'whatsapp_cta_desc',  value: 'Browse our products, add to cart, and send your order directly via WhatsApp. Fast, easy, and personal.' },
    { key: CMS_SETTING_KEY,      value: serializeCmsContent(defaultCmsContent) },
  ];
  for (const s of defaultSettings) {
    await Setting.updateOne({ key: s.key }, { $setOnInsert: s }, { upsert: true });
  }

  // Categories
  const defaultCategories = ['Car Care', 'Interior', 'Exterior', 'Electronics', 'Performance'];
  for (const name of defaultCategories) {
    await Category.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
  }

  await seedProductsIfEmpty();

  // Admin user
  const exists = await AdminUser.findOne();
  if (!exists) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const password_hash = await bcrypt.hash(password, 10);
    await AdminUser.create({ username, password_hash });
  }
}

async function seedProductsIfEmpty() {
  const existingProducts = await Product.countDocuments();
  if (existingProducts > 0) return;

  const categories = await Category.find().lean();
  const categoryByName = Object.fromEntries(categories.map((category) => [category.name, category._id]));

  const products = [
    {
      name: 'Premium 7D Custom Floor Mats',
      description: 'Luxury layered floor mats with raised edges, anti-slip backing, and easy-clean surface for daily protection.',
      price: 12999,
      discount_percent: 12,
      stock: 18,
      category_id: categoryByName.Interior,
      featured: true,
      best_seller: true,
      active: true,
      seo_title: 'Premium 7D Custom Floor Mats',
      seo_description: 'Custom-fit luxury 7D car floor mats with premium finish and daily protection.',
      variants: [
        { name: 'Color', value: 'Black', price_delta: 0, stock: 10 },
        { name: 'Color', value: 'Tan', price_delta: 500, stock: 8 },
      ],
      vehicle_compatibility: [
        { brand: 'BMW', model: '3 Series', year: '2025' },
        { brand: 'Mercedes', model: 'C-Class', year: '2025' },
      ],
      reviews: [
        { name: 'Verified Buyer', rating: 5, comment: 'Excellent fit and premium cabin feel.' },
      ],
    },
    {
      name: 'Ambient Interior Lighting Kit',
      description: 'App-controlled ambient lighting kit designed to elevate night drives with a clean premium glow.',
      price: 8999,
      discount_percent: 10,
      stock: 14,
      category_id: categoryByName.Electronics,
      featured: true,
      new_launch: true,
      active: true,
      seo_title: 'Ambient Interior Lighting Kit',
      seo_description: 'Premium app-controlled ambient lighting kit for luxury car interiors.',
      variants: [
        { name: 'Mode', value: 'Single Zone', price_delta: 0, stock: 8 },
        { name: 'Mode', value: 'Multi Zone', price_delta: 2500, stock: 6 },
      ],
      vehicle_compatibility: [
        { brand: 'Audi', model: 'A4', year: '2024' },
        { brand: 'BMW', model: '5 Series', year: '2024' },
      ],
    },
    {
      name: 'Ceramic Gloss Protection Kit',
      description: 'Paint care kit with prep cleaner, ceramic gloss sealant, applicator, and microfiber finishing cloth.',
      price: 5499,
      discount_percent: 0,
      stock: 24,
      category_id: categoryByName['Car Care'],
      best_seller: true,
      active: true,
      seo_title: 'Ceramic Gloss Protection Kit',
      seo_description: 'Premium ceramic gloss kit for car paint protection and shine.',
      reviews: [
        { name: 'Detailing Customer', rating: 5, comment: 'Gloss improved immediately after the first use.' },
      ],
    },
    {
      name: 'Carbon Style Door Sill Protectors',
      description: 'Scratch-resistant sill guards with carbon finish to protect entry points and add a sportier look.',
      price: 3499,
      discount_percent: 8,
      stock: 20,
      category_id: categoryByName.Exterior,
      new_launch: true,
      active: true,
      seo_title: 'Carbon Style Door Sill Protectors',
      seo_description: 'Carbon-style door sill protectors for premium exterior and interior entry protection.',
    },
  ];

  await Product.insertMany(products);
}
