module.exports = {
  name: 'ensure_listing_checkout_columns',
  up: async (client) => {
    await client.query(`
      ALTER TABLE listings
      ADD COLUMN IF NOT EXISTS payment_link_url TEXT,
      ADD COLUMN IF NOT EXISTS shipping_enabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS shipping_price NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS shipping_payment_link_url TEXT,
      ADD COLUMN IF NOT EXISTS local_delivery BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS local_delivery_payment_link_url TEXT,
      ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_sentimental BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS sentimental_tier INTEGER,
      ADD COLUMN IF NOT EXISTS sentimental_category VARCHAR(255);
    `);
  }
};
