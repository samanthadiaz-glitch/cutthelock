module.exports = {
  name: 'create_listings_table',
  up: async (client) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2),
        category VARCHAR(255),
        condition VARCHAR(255),
        unit_origin VARCHAR(255),
        facility_name VARCHAR(255),
        facility_city VARCHAR(255),
        facility_state VARCHAR(255),
        photos JSONB DEFAULT '[]'::jsonb,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  }
};
