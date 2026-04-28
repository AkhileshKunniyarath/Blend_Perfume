/**
 * Seed script - inserts the product details from blendperfume.in into MongoDB
 *
 * Usage: node scripts/seed-products.mjs
 */

import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Load .env.local manually ──
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

const user = process.env.MONGODB_USER;
const pass = process.env.MONGODB_PASS;
const host = process.env.MONGODB_HOST;
const app  = process.env.MONGODB_APP || 'Cluster0';

let MONGODB_URI;
if (user && pass && host) {
  MONGODB_URI = `mongodb+srv://${user}:${encodeURIComponent(pass)}@${host}/?appName=${app}`;
} else if (process.env.MONGODB_URI) {
  MONGODB_URI = process.env.MONGODB_URI;
} else {
  console.error('❌  Missing MongoDB credentials in .env.local');
  process.exit(1);
}

// ── Schemas ──
const VariantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  price: { type: Number, required: true },
});

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    images: [{ type: String }],
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    stock: { type: Number, required: true, default: 0 },
    variants: [VariantSchema],
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const rawProducts = [
  { name: 'PACOFAME', p50: 580, p100: 1060 },
  { name: 'AXE MAGIC', p50: 680, p100: 1260 },
  { name: 'INSITE', p50: 620, p100: 1140 },
  { name: 'EVENTUS', p50: 640, p100: 1180 },
  { name: 'CRYSTA', p50: 630, p100: 1160 },
  { name: 'FREDMEN', p50: 520, p100: 940 },
  { name: 'SPIKE', p50: 490, p100: 880 },
  { name: 'ICE BLUE', p50: 530, p100: 960 },
  { name: 'RALPH SPORT', p50: 550, p100: 1000 },
  { name: 'WARM SPICY', p50: 580, p100: 1060 },
  { name: 'SECRET SHELL', p50: 580, p100: 1060 },
  { name: 'YORK', p50: 590, p100: 1080 },
  { name: 'PRIMA FEST', p50: 780, p100: 1460 },
  { name: 'OBZERVE', p50: 680, p100: 1240 },
  { name: 'RICH-513', p50: 680, p100: 1260 },
  { name: 'JENTLE', p50: 600, p100: 1100 },
  { name: 'BLACK GOLD', p50: 580, p100: 1060 },
  { name: 'GREEN SHINE', p50: 590, p100: 1080 },
  { name: 'FRUIT VIBE', p50: 580, p100: 1060 },
  { name: 'EVERLLE', p50: 580, p100: 1060 },
  { name: 'FELNEX', p50: 560, p100: 1020 },
  { name: 'INIFINITY', p50: 520, p100: 940 },
];

async function main() {
  console.log('🔗  Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log('✅  Connected.\n');

  // get a category to use as default fallback
  const category = await Category.findOne({ slug: 'unisex' }) || await Category.findOne();
  if (!category) {
    console.error('❌  No categories found. Please run seed-categories.mjs first.');
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (const p of rawProducts) {
    const slug = p.name.toLowerCase().replace(/\s+/g, '-');
    const exists = await Product.findOne({ slug });
    
    if (exists) {
      console.log(`   ⏭  "${p.name}" (/${slug}) already exists – skipped`);
      skipped++;
    } else {
      await Product.create({
        name: p.name,
        slug,
        description: `Experience the elegant and long-lasting fragrance of ${p.name}.`,
        price: p.p50,
        categoryId: category._id,
        stock: 50,
        variants: [
          { size: '50ML', price: p.p50 },
          { size: '100ML', price: p.p100 },
        ],
        seoTitle: `${p.name} Perfume | Blend Perfume`,
        seoDescription: `Buy ${p.name} premium long-lasting perfume online. Available in 50ML and 100ML sizes.`,
      });
      console.log(`   ✅  "${p.name}" (/${slug}) created`);
      created++;
    }
  }

  console.log(`\n🎉  Done — ${created} created, ${skipped} skipped.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
