module.exports = {
  name: 'add_remaining_tables',
  up: async (client) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS units (
        id SERIAL PRIMARY KEY,
        unit_number VARCHAR(255),
        facility_name VARCHAR(255),
        facility_address TEXT,
        purchase_date DATE,
        purchase_price NUMERIC(10,2),
        additional_costs NUMERIC(10,2),
        unit_size VARCHAR(100),
        notes TEXT,
        status VARCHAR(100) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        type VARCHAR(100),
        recipient VARCHAR(255),
        subject VARCHAR(255),
        body TEXT,
        metadata JSONB,
        sent_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payment_arrangements (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(100),
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(100),
        total_amount NUMERIC(10,2),
        balance_remaining NUMERIC(10,2),
        payoff_date DATE,
        notes TEXT,
        agreement_file_url TEXT,
        description TEXT,
        payment_link TEXT,
        status VARCHAR(100) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS arrangement_payments (
        id SERIAL PRIMARY KEY,
        arrangement_id INTEGER,
        amount NUMERIC(10,2),
        stripe_payment_id VARCHAR(255),
        notes TEXT,
        paid_at TIMESTAMPTZ,
        receipt_number VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS popp_agreements (
        id SERIAL PRIMARY KEY,
        buyer_name VARCHAR(255),
        buyer_email VARCHAR(255),
        buyer_phone VARCHAR(100),
        buyer_id_last4 VARCHAR(10),
        id_type VARCHAR(100),
        relationship VARCHAR(255),
        facility_name VARCHAR(255),
        unit_number VARCHAR(255),
        auction_date DATE,
        facility_location VARCHAR(255),
        reference_number VARCHAR(255),
        representative VARCHAR(255),
        items JSONB,
        total_price NUMERIC(10,2),
        payment_method VARCHAR(100),
        deposit_paid NUMERIC(10,2),
        balance_due NUMERIC(10,2),
        pickup_deadline TIMESTAMPTZ,
        buyer_signature TEXT,
        rep_signature TEXT,
        notes TEXT,
        unit_orig_price NUMERIC(10,2),
        file_url TEXT,
        unit_id INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS buyback_agreements (
        id SERIAL PRIMARY KEY,
        buyer_name VARCHAR(255),
        buyer_email VARCHAR(255),
        buyer_phone VARCHAR(100),
        buyer_id_last4 VARCHAR(10),
        id_type VARCHAR(100),
        facility_name VARCHAR(255),
        unit_number VARCHAR(255),
        auction_date DATE,
        facility_location VARCHAR(255),
        reference_number VARCHAR(255),
        representative VARCHAR(255),
        items JSONB,
        total_price NUMERIC(10,2),
        currency VARCHAR(50),
        pickup_deadline TIMESTAMPTZ,
        payment_method VARCHAR(100),
        deposit_paid NUMERIC(10,2),
        balance_due NUMERIC(10,2),
        buyer_signature TEXT,
        buyer_signed_at TIMESTAMPTZ,
        rep_signature TEXT,
        rep_signed_at TIMESTAMPTZ,
        notes TEXT,
        fee_percentage NUMERIC(5,2),
        payment_plan BOOLEAN DEFAULT false,
        unit_orig_price NUMERIC(10,2),
        file_url TEXT,
        unit_id INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS inventory_acknowledgments (
        id SERIAL PRIMARY KEY,
        tenant_name VARCHAR(255),
        tenant_email VARCHAR(255),
        tenant_phone VARCHAR(100),
        tenant_address TEXT,
        unit_number VARCHAR(255),
        facility_name VARCHAR(255),
        auction_date DATE,
        transaction_type VARCHAR(100),
        items JSONB,
        date_signed TIMESTAMPTZ,
        signature_data TEXT,
        printed_name VARCHAR(255),
        representative VARCHAR(255),
        rep_signature TEXT,
        notes TEXT,
        file_url TEXT,
        unit_id INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS liability_releases (
        id SERIAL PRIMARY KEY,
        tenant_name VARCHAR(255),
        tenant_email VARCHAR(255),
        tenant_phone VARCHAR(100),
        tenant_address TEXT,
        unit_number VARCHAR(255),
        facility_name VARCHAR(255),
        facility_address TEXT,
        transaction_type VARCHAR(100),
        date_of_release DATE,
        witness_name VARCHAR(255),
        witness_signature TEXT,
        date_signed TIMESTAMPTZ,
        signature_data TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS identity_verifications (
        id SERIAL PRIMARY KEY,
        claimant_name VARCHAR(255),
        claimant_address_street VARCHAR(255),
        claimant_address_city VARCHAR(100),
        claimant_address_state VARCHAR(100),
        claimant_address_zip VARCHAR(50),
        claimant_phone VARCHAR(100),
        claimant_email VARCHAR(255),
        id_type VARCHAR(100),
        id_number VARCHAR(100),
        id_expiration_date DATE,
        id_issuance_state VARCHAR(100),
        unit_number VARCHAR(255),
        facility_name VARCHAR(255),
        facility_city VARCHAR(100),
        rental_date_from DATE,
        rental_date_to DATE,
        how_learned TEXT,
        declaration_checked BOOLEAN DEFAULT false,
        declaration_date DATE,
        verified_by VARCHAR(255),
        verification_notes TEXT,
        id_match_confirmed BOOLEAN DEFAULT false,
        verification_status VARCHAR(100),
        file_url TEXT,
        unit_id INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payment_plan_addendums (
        id SERIAL PRIMARY KEY,
        tenant_name VARCHAR(255),
        tenant_email VARCHAR(255),
        tenant_phone VARCHAR(100),
        tenant_address TEXT,
        unit_number VARCHAR(255),
        facility_name VARCHAR(255),
        related_agreement_ref VARCHAR(255),
        original_amount NUMERIC(10,2),
        fee_percentage NUMERIC(5,2),
        fee_amount NUMERIC(10,2),
        total_with_fee NUMERIC(10,2),
        deposit_amount NUMERIC(10,2),
        deposit_due_date DATE,
        installment_count INTEGER,
        payment_frequency VARCHAR(100),
        schedule JSONB,
        signature_data TEXT,
        representative_name VARCHAR(255),
        representative_signature TEXT,
        date_signed TIMESTAMPTZ,
        file_url TEXT,
        unit_id INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS claim_documents (
        id SERIAL PRIMARY KEY,
        claim_id INTEGER,
        document_type VARCHAR(100),
        filename VARCHAR(255),
        file_url TEXT,
        file_size INTEGER,
        mime_type VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  }
};
