module.exports = {
  name: 'fix_listing_views',
  up: async (client) => {
    await client.query(`
      ALTER TABLE listing_views
      ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ DEFAULT NOW();
    `);

    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'listing_views'
          AND column_name = 'created_at'
        ) THEN
          UPDATE listing_views
          SET viewed_at = created_at
          WHERE viewed_at IS NULL;
        END IF;
      END $$;
    `);

    await client.query(`
      ALTER TABLE listing_views
      DROP COLUMN IF EXISTS created_at;
    `);
  }
};
