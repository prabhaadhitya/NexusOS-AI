-- Initial Schema

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    owner_email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    segment TEXT, -- "new", "returning", "vip"
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    price NUMERIC(10, 2) NOT NULL,
    cost NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    reorder_level INT NOT NULL,
    supplier_name TEXT,
    last_restocked_at TIMESTAMPTZ
);

CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    sale_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL, -- "paid", "pending", "overdue"
    issued_date DATE NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    appointment_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL, -- "scheduled", "completed", "cancelled"
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL, -- "open", "in_progress", "resolved"
    sentiment TEXT, -- "positive", "neutral", "negative"
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    channel TEXT NOT NULL, -- "email", "social", "sms"
    status TEXT NOT NULL,
    reach INT NOT NULL DEFAULT 0,
    conversions INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orchestration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_query TEXT NOT NULL,
    agents_invoked TEXT[] NOT NULL,
    final_response TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestration_logs ENABLE ROW LEVEL SECURITY;

-- Note: These policies are deliberately permissive for hackathon demo purposes.
-- TODO: Tighten these policies post-hackathon to correctly scope data to authenticated users/businesses.
CREATE POLICY "Allow all operations for authenticated/anon on businesses" ON businesses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated/anon on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated/anon on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated/anon on inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated/anon on sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated/anon on invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated/anon on appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated/anon on support_tickets" ON support_tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated/anon on marketing_campaigns" ON marketing_campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated/anon on orchestration_logs" ON orchestration_logs FOR ALL USING (true) WITH CHECK (true);
