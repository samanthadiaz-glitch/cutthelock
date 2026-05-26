/**
 * Seed sample listings from storage unit finds.
 * Run during build to populate marketplace with demo inventory.
 */
const dotenv = require('dotenv');
if (typeof dotenv.config === 'function') {
  dotenv.config();
} else if (typeof dotenv.load === 'function') {
  dotenv.load();
}
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const sampleListings = [
  {
    title: 'Mid-Century Teak Credenza',
    description: 'Beautiful 1960s teak credenza with sliding doors and adjustable shelving. Some surface wear adds character. Legs are solid with no wobble. Perfect for a living room or home office. Found in Unit B-14, Round Rock.',
    price: 285.00,
    category: 'furniture',
    condition: 'good',
    unit_origin: 'Unit B-14',
    facility_name: 'Public Storage',
    facility_city: 'Round Rock',
    facility_state: 'TX',
    featured: true
  },
  {
    title: 'Vintage Polaroid SX-70 Camera',
    description: 'Iconic folding SLR instant camera in chrome and brown leather. Tested and functional. Includes original case. A collectible piece of photography history.',
    price: 175.00,
    category: 'collectibles',
    condition: 'excellent',
    unit_origin: 'Unit A-22',
    facility_name: 'Extra Space Storage',
    facility_city: 'Austin',
    facility_state: 'TX',
    featured: true
  },
  {
    title: 'DeWalt 20V MAX Drill/Driver Kit',
    description: 'Complete kit with drill, two batteries, charger, and carrying case. Batteries hold charge well. Light use. Retail value over $200.',
    price: 95.00,
    category: 'tools',
    condition: 'good',
    unit_origin: 'Unit C-8',
    facility_name: 'CubeSmart',
    facility_city: 'Georgetown',
    facility_state: 'TX',
    featured: false
  },
  {
    title: 'Cast Iron Dutch Oven (Le Creuset)',
    description: 'Classic 5.5 qt round Dutch oven in flame orange. Heavy, well-made, and built to last generations. Some enamel wear inside but fully functional. These retail for $380+ new.',
    price: 120.00,
    category: 'home',
    condition: 'good',
    unit_origin: 'Unit D-3',
    facility_name: 'Life Storage',
    facility_city: 'Cedar Park',
    facility_state: 'TX',
    featured: true
  },
  {
    title: 'Leather-Bound Book Collection (12 Volumes)',
    description: 'Complete set of classic literature in matching leather bindings. Gold-embossed spines. Includes Dickens, Twain, Austen, and more. Minor shelf wear. A stunning set for any home library.',
    price: 150.00,
    category: 'books',
    condition: 'good',
    unit_origin: 'Unit A-22',
    facility_name: 'Extra Space Storage',
    facility_city: 'Austin',
    facility_state: 'TX',
    featured: false
  },
  {
    title: 'Schwinn Varsity Road Bike (1974)',
    description: 'Classic vintage road bike in original sunset orange. Chrome fenders, Shimano derailleurs. Rides smooth. Tires hold air. A head-turner that gets you from A to B in style.',
    price: 225.00,
    category: 'sports',
    condition: 'fair',
    unit_origin: 'Unit F-1',
    facility_name: 'Public Storage',
    facility_city: 'Round Rock',
    facility_state: 'TX',
    featured: true
  },
  {
    title: 'Sony PlayStation 4 Pro (1TB)',
    description: 'PS4 Pro with original controller and power cable. Factory reset and tested. Runs quiet, no issues. Does not include games.',
    price: 165.00,
    category: 'electronics',
    condition: 'good',
    unit_origin: 'Unit E-11',
    facility_name: 'StorQuest',
    facility_city: 'Pflugerville',
    facility_state: 'TX',
    featured: false
  },
  {
    title: 'Hand-Stitched Quilt (Queen Size)',
    description: 'Stunning handmade patchwork quilt in blues and creams. Double-stitched binding. No tears or stains. Someone spent hundreds of hours on this. It deserves a good home.',
    price: 85.00,
    category: 'vintage',
    condition: 'excellent',
    unit_origin: 'Unit D-3',
    facility_name: 'Life Storage',
    facility_city: 'Cedar Park',
    facility_state: 'TX',
    featured: false
  },
  {
    title: 'Vintage Levi\'s 501 Jeans (32x34)',
    description: 'Original Levi\'s 501 with the perfect fade. Made in USA, red tab. These are the real deal, not reproductions. Excellent condition for their age.',
    price: 65.00,
    category: 'clothing',
    condition: 'good',
    unit_origin: 'Unit G-5',
    facility_name: 'Uncle Bob\'s',
    facility_city: 'Round Rock',
    facility_state: 'TX',
    featured: false
  },
  {
    title: 'Craftsman Rolling Tool Chest',
    description: 'Heavy-duty red steel tool chest with 8 drawers and casters. All drawers slide smooth with ball bearings. Some paint chips on exterior. Empty (tools sold separately).',
    price: 195.00,
    category: 'tools',
    condition: 'good',
    unit_origin: 'Unit C-8',
    facility_name: 'CubeSmart',
    facility_city: 'Georgetown',
    facility_state: 'TX',
    featured: false
  },
  {
    title: 'Vintage Star Wars Action Figures (Lot of 6)',
    description: 'Original Kenner figures from the early 1980s. Includes Luke, Han Solo, Chewbacca, Darth Vader, Yoda, and Boba Fett. No packaging but all limbs intact. These are appreciating fast.',
    price: 340.00,
    category: 'collectibles',
    condition: 'good',
    unit_origin: 'Unit A-7',
    facility_name: 'Extra Space Storage',
    facility_city: 'Austin',
    facility_state: 'TX',
    featured: true
  },
  {
    title: 'Solid Oak Dining Table (Seats 6)',
    description: 'Heavy farmhouse-style dining table in warm honey oak. Sturdy construction, minor ring marks on surface that sand out easily. No chairs included. This table has decades of dinners left in it.',
    price: 225.00,
    category: 'furniture',
    condition: 'fair',
    unit_origin: 'Unit B-14',
    facility_name: 'Public Storage',
    facility_city: 'Round Rock',
    facility_state: 'TX',
    featured: false
  }
];

async function seed() {
  console.log('Seeding sample listings...');
  const client = await pool.connect();
  try {
    // Check if listings already exist
    const existing = await client.query('SELECT COUNT(*) FROM listings');
    if (parseInt(existing.rows[0].count) > 0) {
      console.log('Listings already seeded (' + existing.rows[0].count + ' items). Skipping.');
      return;
    }

    for (const item of sampleListings) {
      await client.query(
        `INSERT INTO listings (title, description, price, category, condition, unit_origin, facility_name, facility_city, facility_state, photos, featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [item.title, item.description, item.price, item.category, item.condition, item.unit_origin, item.facility_name, item.facility_city, item.facility_state, JSON.stringify([]), item.featured]
      );
    }

    console.log('Seeded ' + sampleListings.length + ' sample listings.');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
