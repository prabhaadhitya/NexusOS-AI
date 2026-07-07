CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms', 'internal')),
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
    triggered_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- TODO: Tighten these policies post-hackathon
CREATE POLICY "Allow all operations for authenticated users" ON notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon users" ON notifications FOR ALL TO anon USING (true) WITH CHECK (true);
