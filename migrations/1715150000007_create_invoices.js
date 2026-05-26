module.exports = {
  name: 'create_invoices',
  up: async (client) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(100),
        invoice_date DATE,
        due_date DATE,
        buyer_name VARCHAR(255),
        buyer_email VARCHAR(255),
        buyer_phone VARCHAR(100),
        buyer_address TEXT,
        transaction_type VARCHAR(100),
        items JSONB,
        subtotal NUMERIC(10,2),
        tax_rate NUMERIC(5,2),
        tax_amount NUMERIC(10,2),
        total NUMERIC(10,2),
        payment_method VARCHAR(100),
        payment_status VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  }
};
