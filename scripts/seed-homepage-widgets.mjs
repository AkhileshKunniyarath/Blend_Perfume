import mongoose from 'mongoose';

function buildMongoUri() {
  const user = process.env.MONGODB_USER;
  const pass = process.env.MONGODB_PASS;
  const host = process.env.MONGODB_HOST;
  const app = process.env.MONGODB_APP || 'Cluster0';

  if (user && pass && host) {
    return `mongodb+srv://${user}:${encodeURIComponent(pass)}@${host}/?appName=${app}`;
  }

  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  throw new Error('Missing MongoDB connection settings.');
}

const categorySchema = new mongoose.Schema({}, { strict: false, collection: 'categories' });
const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const widgetSchema = new mongoose.Schema({}, { strict: false, collection: 'widgets' });

const Category = mongoose.models.SeedCategory || mongoose.model('SeedCategory', categorySchema);
const Product = mongoose.models.SeedProduct || mongoose.model('SeedProduct', productSchema);
const Widget = mongoose.models.SeedWidget || mongoose.model('SeedWidget', widgetSchema);

function chooseHeroImage(products, categories) {
  return (
    products.find((product) => Array.isArray(product.images) && product.images[0])?.images?.[0] ||
    categories.find((category) => category.image)?.image ||
    ''
  );
}

function chooseCategoryIds(categories) {
  const preferredNames = ['Men', 'Women', 'Unisex', 'Luxury'];
  const selected = [];

  for (const name of preferredNames) {
    const match = categories.find((category) =>
      String(category.name || '').toLowerCase().includes(name.toLowerCase())
    );
    if (match) {
      selected.push(String(match._id));
    }
  }

  for (const category of categories) {
    if (selected.length >= 4) {
      break;
    }
    const id = String(category._id);
    if (!selected.includes(id)) {
      selected.push(id);
    }
  }

  return selected;
}

function chooseProductIds(products, limit) {
  return products.slice(0, limit).map((product) => String(product._id));
}

async function main() {
  await mongoose.connect(buildMongoUri(), { bufferCommands: false });

  const [categories, products, existingWidgets] = await Promise.all([
    Category.find({}, { name: 1, slug: 1, image: 1 }).sort({ createdAt: 1, _id: 1 }).lean(),
    Product.find({}, { name: 1, slug: 1, images: 1, categoryId: 1 }).sort({ createdAt: -1, _id: -1 }).lean(),
    Widget.find({}, { type: 1, title: 1, position: 1 }).sort({ position: 1 }).lean(),
  ]);

  console.log(
    JSON.stringify(
      {
        categoryCount: categories.length,
        productCount: products.length,
        existingWidgetCount: existingWidgets.length,
        existingWidgets,
      },
      null,
      2
    )
  );

  const heroImage = chooseHeroImage(products, categories);
  const categoryIds = chooseCategoryIds(categories);
  const bestSellerIds = chooseProductIds(products, 6);
  const exploreIds = chooseProductIds(products, 8);

  const widgets = [
    {
      type: 'HERO_BANNER',
      title: 'Craft Your Signature Scent',
      data: {
        eyebrow: 'Blend Perfume',
        subtitle:
          'Premium perfume rituals with refined depth, smooth projection, and a luxury feel that lingers.',
        buttonText: 'Shop Now',
        link: '/#best-sellers',
        imageUrl: heroImage,
        alignment: 'left',
        overlayOpacity: 44,
      },
      position: 0,
      isActive: true,
    },
    {
      type: 'CATEGORY_GRID',
      title: 'Shop by Collection',
      data: {
        subtitle: 'Explore fragrance directions designed for every mood and moment.',
        categoryIds,
      },
      position: 1,
      isActive: true,
    },
    {
      type: 'HORIZONTAL_PRODUCT',
      title: 'Best Sellers',
      data: {
        subtitle: 'The scents customers keep returning to for daily wear and gifting.',
        productIds: bestSellerIds,
        limit: 6,
      },
      position: 2,
      isActive: true,
    },
    {
      type: 'FULL_BANNER',
      title: 'Long Lasting Fragrance',
      data: {
        eyebrow: 'Signature Wear',
        subtitle:
          'Built with premium oils for a clean opening, expressive heart notes, and a memorable dry down.',
        buttonText: 'Discover More',
        link: '/#collections',
        imageUrl: heroImage,
        alignment: 'center',
        overlayOpacity: 38,
      },
      position: 3,
      isActive: true,
    },
    {
      type: 'VERTICAL_PRODUCT_GRID',
      title: 'Explore Collection',
      data: {
        subtitle: 'An editorial-style product grid for deeper browsing.',
        productIds: exploreIds,
        limit: 8,
      },
      position: 4,
      isActive: true,
    },
    {
      type: 'HALF_BANNER',
      title: 'A Ritual That Feels Intentional',
      data: {
        eyebrow: 'Layered Luxury',
        subtitle:
          'From packaging to dry down, every detail is shaped to feel polished, modern, and gift-worthy.',
        buttonText: 'View Collection',
        link: '/#collections',
        imageUrl: heroImage,
        reverse: false,
      },
      position: 5,
      isActive: true,
    },
    {
      type: 'STORY_SECTION',
      title: 'Crafted with Premium Oils',
      data: {
        eyebrow: 'Our Story',
        subtitle:
          'Blend was built around the idea that perfume should feel both expressive and effortless, with lasting presence and elevated design.',
        buttonText: 'Explore the Brand',
        link: '/#collections',
        imageUrl: heroImage,
        points: [
          'Premium oils selected for smooth projection and day-long wear.',
          'Balanced top, heart, and base notes for a fuller scent story.',
          'A clean luxury look designed for gifting and repeat wear.',
        ],
      },
      position: 6,
      isActive: true,
    },
    {
      type: 'TESTIMONIALS',
      title: 'Loved by Fragrance Lovers',
      data: {
        subtitle: 'Minimal, premium, and memorable from the first spray.',
        testimonials: [
          {
            quote: 'The scent profile feels polished and luxurious without being overpowering.',
            author: 'Aarav',
            role: 'Verified Buyer',
          },
          {
            quote: 'Beautiful presentation and a long-lasting finish that actually stays elegant.',
            author: 'Riya',
            role: 'Repeat Customer',
          },
          {
            quote: 'A premium everyday fragrance that gets compliments every time I wear it.',
            author: 'Mehul',
            role: 'Fragrance Lover',
          },
        ],
      },
      position: 7,
      isActive: true,
    },
  ];

  await Widget.deleteMany({});
  await Widget.insertMany(widgets);

  console.log(
    JSON.stringify(
      {
        seededWidgetCount: widgets.length,
        seededTypes: widgets.map((widget) => widget.type),
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
