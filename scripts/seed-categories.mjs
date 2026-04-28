/**
 * Seed script – inserts the default storefront categories into MongoDB
 * so they appear in the admin panel for editing.
 *
 * Usage:  node scripts/seed-categories.mjs
 */

import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Load .env.local manually (no dotenv dependency) ──
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

// ── Category schema (minimal mirror of models/Category.ts) ──
const CategorySchema = new mongoose.Schema(
  {
    name:           { type: String, required: true },
    slug:           { type: String, required: true, unique: true },
    parentId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    image:          { type: String },
    seoTitle:       { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

// ── Default categories to seed ──
const DEFAULT_CATEGORIES = [
  {
    name: 'Men',
    slug: 'men',
    seoTitle: 'Men\'s Fragrances | Blend Perfume',
    seoDescription: 'Refined profiles for daily and evening wear. Explore the men\'s fragrance collection.',
  },
  {
    name: 'Women',
    slug: 'women',
    seoTitle: 'Women\'s Fragrances | Blend Perfume',
    seoDescription: 'Elegant blends with modern softness and depth. Explore the women\'s fragrance collection.',
  },
  {
    name: 'Unisex',
    slug: 'unisex',
    seoTitle: 'Unisex Fragrances | Blend Perfume',
    seoDescription: 'Balanced scents with versatile mood and projection for everyone.',
  },
  {
    name: 'Luxury',
    slug: 'luxury',
    seoTitle: 'Luxury Fragrances | Blend Perfume',
    seoDescription: 'Premium selections with elevated presentation and rare ingredients.',
  },
];

// ── Main ──
async function main() {
  console.log('🔗  Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log('✅  Connected.\n');

  let created = 0;
  let skipped = 0;

  for (const cat of DEFAULT_CATEGORIES) {
    const exists = await Category.findOne({ slug: cat.slug });
    if (exists) {
      console.log(`   ⏭  "${cat.name}" (/${cat.slug}) already exists – skipped`);
      skipped++;
    } else {
      await Category.create(cat);
      console.log(`   ✅  "${cat.name}" (/${cat.slug}) created`);
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
