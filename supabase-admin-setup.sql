-- Run this SQL in your Supabase SQL Editor to set up the Admin/User system

-- 1. Create admins table to store admin emails
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- 2. Create default_template table to store the master template
CREATE TABLE IF NOT EXISTS default_template (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- 3. Insert your email as the first admin
INSERT INTO admins (email, created_by) 
VALUES ('nader.ibrahim@cafonline.com', 'system')
ON CONFLICT (email) DO NOTHING;

-- 4. Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_template ENABLE ROW LEVEL SECURITY;

-- 5. Policies for admins table
-- Anyone can read admins (to check if they're an admin)
CREATE POLICY "Anyone can read admins" ON admins
  FOR SELECT USING (true);

-- Only admins can insert new admins
CREATE POLICY "Admins can insert admins" ON admins
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email')
  );

-- Only admins can delete admins (but not themselves)
CREATE POLICY "Admins can delete other admins" ON admins
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email')
    AND email != auth.jwt()->>'email'
  );

-- 6. Policies for default_template table
-- Anyone can read the default template (public access)
CREATE POLICY "Anyone can read default_template" ON default_template
  FOR SELECT USING (true);

-- Only admins can update/insert the default template
CREATE POLICY "Admins can update default_template" ON default_template
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email')
  );

CREATE POLICY "Admins can modify default_template" ON default_template
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email')
  );

-- 7. Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
