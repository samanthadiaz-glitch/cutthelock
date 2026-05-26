module.exports = {
  name: 'fix_listing_views',
  up: async (client) => {
    await client.query(`
      ALTER TABLE listing_views 
      RENAME COLUMN created_at TO viewed_at;
    `);
  }
};
