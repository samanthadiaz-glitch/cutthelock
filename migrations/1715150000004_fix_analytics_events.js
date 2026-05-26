module.exports = {
  name: 'fix_analytics_events',
  up: async (client) => {
    await client.query(`
      ALTER TABLE analytics_events 
      ADD COLUMN IF NOT EXISTS path TEXT,
      ADD COLUMN IF NOT EXISTS referrer TEXT,
      ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255),
      ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255),
      ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255),
      ADD COLUMN IF NOT EXISTS user_agent_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS ip_hash VARCHAR(255);
    `);
  }
};
