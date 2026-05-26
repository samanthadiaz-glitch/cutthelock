module.exports = {
  name: 'add_missing_schema',
  up: async (client) => {
    await client.query(`
      ALTER TABLE listings 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'available',
      ADD COLUMN IF NOT EXISTS payment_link_url TEXT,
      ADD COLUMN IF NOT EXISTS shipping_enabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS shipping_price NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS shipping_payment_link_url TEXT,
      ADD COLUMN IF NOT EXISTS local_delivery BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS local_delivery_payment_link_url TEXT,
      ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS unit_id INTEGER,
      ADD COLUMN IF NOT EXISTS is_sentimental BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS sentimental_tier INTEGER,
      ADD COLUMN IF NOT EXISTS sentimental_category VARCHAR(255),
      ADD COLUMN IF NOT EXISTS recovery_item_id INTEGER,
      ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS recovery_items (
        id SERIAL PRIMARY KEY,
        photo_url TEXT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'available',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  }
};
