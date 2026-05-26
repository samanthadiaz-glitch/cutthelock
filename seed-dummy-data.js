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

const dummyRecoveryItems = [
  {
    photo_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800',
    title: 'Vintage Wedding Ring',
    description: 'Gold band with a small diamond inscription found in a jewelry box.',
    status: 'available'
  },
  {
    photo_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
    title: 'Family Photo Album',
    description: 'Leather-bound photo album from the 1990s containing family vacation photos.',
    status: 'claimed'
  },
  {
    photo_url: 'https://images.unsplash.com/photo-1605553147321-c44bb0c64115?auto=format&fit=crop&q=80&w=800',
    title: 'Military Medals Collection',
    description: 'A small wooden shadow box containing WWII service medals and dog tags.',
    status: 'reunited'
  }
];

const dummyUnits = [
  {
    unit_number: 'A-112',
    facility_name: 'Extra Space Storage - Round Rock',
    facility_address: '123 Main St, Round Rock, TX',
    purchase_date: '2026-04-15',
    purchase_price: 350.00,
    additional_costs: 50.00,
    unit_size: '10x10',
    notes: 'Contained mostly furniture and electronics.',
    status: 'cleared'
  },
  {
    unit_number: 'C-04',
    facility_name: 'Public Storage - Austin North',
    facility_address: '456 Tech Blvd, Austin, TX',
    purchase_date: '2026-05-01',
    purchase_price: 1200.00,
    additional_costs: 150.00,
    unit_size: '10x20',
    notes: 'Large unit with vintage collectibles and tools.',
    status: 'processing'
  }
];

const dummyLostItems = [
  {
    reporter_name: 'Jane Doe',
    reporter_email: 'jane.doe@example.com',
    reporter_phone: '555-0192',
    item_name: 'Heirloom Watch',
    item_description: 'Silver pocket watch with initials J.D. engraved on the back.',
    facility_name: 'Extra Space Storage - Round Rock',
    facility_city: 'Round Rock',
    facility_state: 'TX',
    unit_number: 'A-112',
    date_lost: '2026-04-01',
    category: 'jewelry',
    status: 'pending'
  },
  {
    reporter_name: 'John Smith',
    reporter_email: 'john.smith@example.com',
    reporter_phone: '555-0344',
    item_name: 'Box of childhood photos',
    item_description: 'Plastic tote bin containing loose photos from 1980-1995.',
    facility_name: 'Public Storage - Austin North',
    facility_city: 'Austin',
    facility_state: 'TX',
    unit_number: 'C-04',
    date_lost: '2026-03-15',
    category: 'photos',
    status: 'matched'
  }
];

const dummyPaymentArrangements = [
  {
    invoice_number: 'CTL-1001',
    customer_name: 'Alice Johnson',
    customer_email: 'alice.j@example.com',
    customer_phone: '555-0101',
    total_amount: 500.00,
    balance_remaining: 250.00,
    payoff_date: '2026-06-01',
    notes: 'Agreed to pay in two installments.',
    description: 'Buyback arrangement for Unit B-22 belongings.',
    status: 'active'
  }
];

async function seed() {
  console.log('Seeding dummy data...');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Seed Recovery Items
    console.log('Seeding recovery items...');
    for (const item of dummyRecoveryItems) {
      await client.query(
        `INSERT INTO recovery_items (photo_url, title, description, status) 
         VALUES ($1, $2, $3, $4)`,
        [item.photo_url, item.title, item.description, item.status]
      );
    }

    // Seed Units
    console.log('Seeding units...');
    for (const unit of dummyUnits) {
      await client.query(
        `INSERT INTO units (unit_number, facility_name, facility_address, purchase_date, purchase_price, additional_costs, unit_size, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [unit.unit_number, unit.facility_name, unit.facility_address, unit.purchase_date, unit.purchase_price, unit.additional_costs, unit.unit_size, unit.notes, unit.status]
      );
    }

    // Seed Lost Items
    console.log('Seeding lost items...');
    for (const item of dummyLostItems) {
      await client.query(
        `INSERT INTO lost_items (reporter_name, reporter_email, reporter_phone, item_name, item_description, facility_name, facility_city, facility_state, unit_number, date_lost, category, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [item.reporter_name, item.reporter_email, item.reporter_phone, item.item_name, item.item_description, item.facility_name, item.facility_city, item.facility_state, item.unit_number, item.date_lost, item.category, item.status]
      );
    }

    // Seed Payment Arrangements
    console.log('Seeding payment arrangements...');
    for (const arr of dummyPaymentArrangements) {
      await client.query(
        `INSERT INTO payment_arrangements (invoice_number, customer_name, customer_email, customer_phone, total_amount, balance_remaining, payoff_date, notes, description, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [arr.invoice_number, arr.customer_name, arr.customer_email, arr.customer_phone, arr.total_amount, arr.balance_remaining, arr.payoff_date, arr.notes, arr.description, arr.status]
      );
    }

    await client.query('COMMIT');
    console.log('Dummy data seeding complete!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to seed dummy data:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
