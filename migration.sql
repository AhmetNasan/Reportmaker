-- SQL Migration Script for QBC Platform Restructure

-- 1. Update work_orders table with new operational columns and rename highway to location
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='work_orders' AND column_name='highway') THEN
        ALTER TABLE work_orders RENAME COLUMN highway TO location;
    END IF;
END $$;

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS reported_by TEXT,
ADD COLUMN IF NOT EXISTS reported_date DATE,
ADD COLUMN IF NOT EXISTS status_update_date DATE,
ADD COLUMN IF NOT EXISTS qbc_comments TEXT,
ADD COLUMN IF NOT EXISTS ro TEXT,
ADD COLUMN IF NOT EXISTS tdp TEXT,
ADD COLUMN IF NOT EXISTS application_date DATE,
ADD COLUMN IF NOT EXISTS tdp_status TEXT,
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS media_announcement TEXT;

-- 2. Create the new manufacturing table
CREATE TABLE IF NOT EXISTS manufacturing (
    id BIGSERIAL PRIMARY KEY,
    work_order_number TEXT NOT NULL UNIQUE REFERENCES work_orders(work_order) ON DELETE CASCADE,
    road_catg TEXT,
    sign_material TEXT,
    sign_type TEXT,
    sign_ref TEXT,
    sign_shape TEXT,
    sign_size TEXT,
    sign_qty INTEGER,
    post_type TEXT,
    post_height TEXT,
    post_qty INTEGER,
    found_size TEXT,
    found_qty INTEGER,
    fab_status TEXT DEFAULT 'Pending',
    installation_date DATE,
    scrap_removal TEXT,
    fab_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Migrate existing data from work_orders to manufacturing
INSERT INTO manufacturing (
    work_order_number, road_catg, sign_type, sign_ref, sign_shape, sign_size, sign_material, sign_qty,
    post_type, post_height, post_qty, found_size, found_qty, fab_status, installation_date, scrap_removal, fab_details
)
SELECT
    work_order, road_catg, sign_type, sign_ref, sign_shape, sign_size, sign_material, sign_qty,
    post_type, post_height, post_qty, found_size, found_qty, fab_status, installation_date, scrap_removal, fab_details
FROM work_orders
ON CONFLICT (work_order_number) DO NOTHING;

-- 4. Enable RLS on the new table
ALTER TABLE manufacturing ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for manufacturing
-- These policies allow authenticated users to perform all actions.
-- In a production environment, you may want to restrict this further (e.g., only admins can delete).
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'manufacturing' AND policyname = 'Allow authenticated users to read manufacturing') THEN
        CREATE POLICY "Allow authenticated users to read manufacturing" ON manufacturing
        FOR SELECT TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'manufacturing' AND policyname = 'Allow authenticated users to perform all actions') THEN
        CREATE POLICY "Allow authenticated users to perform all actions" ON manufacturing
        FOR ALL TO authenticated USING (true);
    END IF;
END $$;
