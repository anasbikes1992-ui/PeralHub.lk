-- Create provider_configs table for backend configuration
CREATE TABLE IF NOT EXISTS provider_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_type VARCHAR(50) NOT NULL CHECK (provider_type IN ('stay_provider', 'vehicle_provider', 'event_organizer', 'sme')),
  business_name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100),
  contact_person VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Sri Lanka',
  postal_code VARCHAR(20),
  commission_rate DECIMAL(5,2) DEFAULT 8.5,
  payment_partner VARCHAR(50) DEFAULT 'lankaPay' CHECK (payment_partner IN ('lankaPay', 'manual', 'bank_transfer')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  verified BOOLEAN DEFAULT FALSE,
  documents JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_provider_per_user UNIQUE(user_id, provider_type)
);

-- Create indexes for performance
CREATE INDEX idx_provider_configs_user_id ON provider_configs(user_id);
CREATE INDEX idx_provider_configs_provider_type ON provider_configs(provider_type);
CREATE INDEX idx_provider_configs_status ON provider_configs(status);
CREATE INDEX idx_provider_configs_verified ON provider_configs(verified);

-- Enable Row Level Security
ALTER TABLE provider_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provider_configs
-- Allow users to view their own configs
CREATE POLICY "Users can view own provider configs"
  ON provider_configs FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own configs
CREATE POLICY "Users can create provider configs"
  ON provider_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own configs
CREATE POLICY "Users can update own provider configs"
  ON provider_configs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own configs
CREATE POLICY "Users can delete own provider configs"
  ON provider_configs FOR DELETE
  USING (auth.uid() = user_id);

-- Allow admins to view all configs
CREATE POLICY "Admins can view all provider configs"
  ON provider_configs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Allow admins to update all configs (for verification/approval)
CREATE POLICY "Admins can update all provider configs"
  ON provider_configs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_provider_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER provider_configs_updated_at_trigger
BEFORE UPDATE ON provider_configs
FOR EACH ROW
EXECUTE FUNCTION update_provider_configs_updated_at();

-- Create a view for admin dashboard to see provider stats
CREATE OR REPLACE VIEW provider_config_stats AS
SELECT 
  provider_type,
  COUNT(*) as total_providers,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_providers,
  SUM(CASE WHEN verified = TRUE THEN 1 ELSE 0 END) as verified_providers,
  ROUND(AVG(commission_rate)::numeric, 2) as avg_commission_rate,
  JSON_BUILD_OBJECT(
    'created_today', COUNT(CASE WHEN created_at::date = CURRENT_DATE THEN 1 END),
    'created_this_week', COUNT(CASE WHEN created_at::date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END),
    'created_this_month', COUNT(CASE WHEN created_at::date >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END)
  ) as creation_stats
FROM provider_configs
GROUP BY provider_type
ORDER BY provider_type;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON provider_configs TO authenticated;
GRANT SELECT ON provider_config_stats TO authenticated;
