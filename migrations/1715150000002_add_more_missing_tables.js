module.exports = {
  name: 'add_more_missing_tables',
  up: async (client) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS listing_views (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER,
        ip_hash VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255),
        event_type VARCHAR(255),
        page_url TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS lost_items (
        id SERIAL PRIMARY KEY,
        reporter_name VARCHAR(255),
        reporter_email VARCHAR(255),
        reporter_phone VARCHAR(50),
        item_name VARCHAR(255),
        item_description TEXT,
        facility_name VARCHAR(255),
        facility_city VARCHAR(255),
        facility_state VARCHAR(255),
        unit_number VARCHAR(100),
        date_lost DATE,
        category VARCHAR(100),
        photos JSONB DEFAULT '[]'::jsonb,
        recovery_item_id INTEGER,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        source VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER,
        buyer_email VARCHAR(255),
        stripe_session_id VARCHAR(255),
        amount_paid NUMERIC(10, 2),
        fulfillment_method VARCHAR(100),
        shipping_name VARCHAR(255),
        shipping_address TEXT,
        shipping_city VARCHAR(100),
        shipping_state VARCHAR(100),
        shipping_zip VARCHAR(50),
        status VARCHAR(50) DEFAULT 'paid',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  }
};
