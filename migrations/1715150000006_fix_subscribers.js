module.exports = {
  name: 'fix_subscribers',
  up: async (client) => {
    await client.query(`
      ALTER TABLE subscribers 
      ADD COLUMN IF NOT EXISTS unsubscribed BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMPTZ;
    `);
  }
};
