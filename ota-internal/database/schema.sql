-- Database Schema for OTA Tour Management Platform
-- Multi-tenant with Row Level Security

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Organizations (Artists, Agencies, Labels, Venues)
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('artist', 'agency', 'label', 'venue')) NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('artist', 'manager', 'crew', 'booking_agent')) NOT NULL,
  display_name TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Venues
CREATE TABLE venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  address TEXT,
  capacity INTEGER,
  latitude DECIMAL,
  longitude DECIMAL,
  contact_info JSONB DEFAULT '{}',
  tech_specs JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shows (Core entity)
CREATE TABLE shows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id),
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('tentative', 'confirmed', 'cancelled', 'overdue', 'pending')) DEFAULT 'tentative',
  
  -- Financial
  guarantee_amount DECIMAL NOT NULL DEFAULT 0,
  guarantee_currency TEXT DEFAULT 'EUR',
  ticket_sales_amount DECIMAL DEFAULT 0,
  merch_amount DECIMAL DEFAULT 0,
  
  -- Logistics
  load_in_time TIME,
  soundcheck_time TIME,
  doors_time TIME,
  stage_time TIME,
  
  -- Technical & Hospitality
  tech_rider JSONB DEFAULT '{}',
  hospitality_rider JSONB DEFAULT '{}',
  
  -- Metadata
  notes TEXT,
  contracts JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Splits (Commissions, Splits)
CREATE TABLE financial_splits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID REFERENCES shows(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id), -- beneficiary
  split_type TEXT CHECK (split_type IN ('booking_commission', 'management_commission', 'artist_share', 'venue_share')) NOT NULL,
  percentage DECIMAL CHECK (percentage >= 0 AND percentage <= 100),
  fixed_amount DECIMAL,
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  show_id UUID REFERENCES shows(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'EUR',
  expense_date DATE NOT NULL,
  receipt_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Travel Segments
CREATE TABLE travel_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  show_id UUID REFERENCES shows(id) ON DELETE CASCADE,
  segment_type TEXT CHECK (segment_type IN ('flight', 'hotel', 'transfer', 'train', 'bus')) NOT NULL,
  title TEXT NOT NULL,
  departure_datetime TIMESTAMPTZ,
  arrival_datetime TIMESTAMPTZ,
  departure_location TEXT,
  arrival_location TEXT,
  confirmation_code TEXT,
  cost_amount DECIMAL,
  cost_currency TEXT DEFAULT 'EUR',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies
-- Organizations: Users can only see organizations they belong to
CREATE POLICY "Users can view own organizations" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- User Profiles: Users can see profiles in their organizations
CREATE POLICY "Users can view organization profiles" ON user_profiles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Shows: Organization-scoped
CREATE POLICY "Users can view organization shows" ON shows
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert organization shows" ON shows
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update organization shows" ON shows
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Similar policies for other tables
CREATE POLICY "Users can view organization expenses" ON expenses
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view organization travel" ON travel_segments
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view organization splits" ON financial_splits
  FOR SELECT USING (
    show_id IN (
      SELECT id FROM shows WHERE organization_id IN (
        SELECT organization_id FROM user_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_segments ENABLE ROW LEVEL SECURITY;

-- Indexes for Performance
CREATE INDEX idx_shows_organization_date ON shows(organization_id, date);
CREATE INDEX idx_shows_venue ON shows(venue_id);
CREATE INDEX idx_expenses_organization_date ON expenses(organization_id, expense_date);
CREATE INDEX idx_travel_show ON travel_segments(show_id);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_org ON user_profiles(organization_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shows_updated_at BEFORE UPDATE ON shows 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_travel_segments_updated_at BEFORE UPDATE ON travel_segments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enhanced Finance Tables for Professional Tour Management
-- ========================================================

-- Financial Entities (Unified Income/Expense tracking)
CREATE TABLE financial_entities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  show_id UUID REFERENCES shows(id) ON DELETE SET NULL,
  
  -- Transaction details
  date DATE NOT NULL,
  description TEXT NOT NULL,
  reference TEXT, -- Invoice number, receipt ID, etc.
  
  -- Multi-currency support
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  exchange_rate DECIMAL(10,6),
  base_currency_amount DECIMAL(12,2) NOT NULL,
  exchange_rate_date TIMESTAMPTZ,
  
  -- Categorization
  category TEXT CHECK (category IN (
    'travel-flights', 'travel-ground', 'accommodation',
    'production-sound', 'production-lights', 'production-stage',
    'crew-fees', 'crew-per-diem', 'marketing-promotion', 'marketing-digital',
    'merchandise', 'catering', 'insurance', 'visas-permits',
    'equipment-rental', 'transportation-freight', 'venue-expenses',
    'admin-fees', 'other'
  )) NOT NULL,
  
  -- Vendor/counterparty
  vendor TEXT,
  payment_method TEXT,
  
  -- Status tracking
  status TEXT CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled', 'disputed')) DEFAULT 'draft',
  
  -- Tax information
  tax_info JSONB DEFAULT '{}', -- WHT, VAT details
  
  -- File attachments
  attachments TEXT[], -- URLs to uploaded files
  
  -- Auto-categorization confidence (0.0 to 1.0)
  auto_categorization_confidence DECIMAL(3,2),
  
  -- Tags for additional categorization
  tags TEXT[] DEFAULT '{}',
  
  -- Settlement reference
  settlement_id UUID,
  
  -- Audit fields
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Split Configurations (Management/Booking fees, etc.)
CREATE TABLE split_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  
  -- Configuration details (stored as JSONB for flexibility)
  management_fee JSONB NOT NULL DEFAULT '{"percentage": 0.20, "basis": "gross"}',
  booking_fee JSONB NOT NULL DEFAULT '{"percentage": 0.10, "basis": "gross"}',
  artist_split JSONB NOT NULL DEFAULT '{"percentage": 0.70, "afterExpenses": true}',
  
  -- Optional recoupment settings
  label_recoup JSONB DEFAULT NULL,
  tour_advance JSONB DEFAULT NULL,
  
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settlements (Show-specific financial breakdowns)
CREATE TABLE settlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID REFERENCES shows(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  split_config_id UUID REFERENCES split_configurations(id),
  
  -- Revenue breakdown (stored as JSONB)
  revenue JSONB NOT NULL DEFAULT '{}',
  expenses JSONB NOT NULL DEFAULT '{}',
  splits JSONB NOT NULL DEFAULT '{}',
  taxes JSONB NOT NULL DEFAULT '{}',
  
  -- Net amount to artist
  net_to_artist_amount DECIMAL(12,2) NOT NULL,
  net_to_artist_currency TEXT NOT NULL DEFAULT 'EUR',
  
  -- Payment schedule
  payment_schedule JSONB DEFAULT '[]',
  
  -- Settlement status
  status TEXT CHECK (status IN ('draft', 'pending-approval', 'approved', 'paid', 'disputed')) DEFAULT 'draft',
  settlement_date DATE,
  
  -- Audit fields
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget Templates
CREATE TABLE budget_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  
  -- Template characteristics
  tour_type TEXT CHECK (tour_type IN ('club', 'festival', 'arena', 'stadium', 'private')) NOT NULL,
  markets TEXT[] DEFAULT '{}', -- Country codes
  
  -- Budget by category (JSONB for flexibility)
  categories JSONB NOT NULL DEFAULT '{}',
  
  -- Performance tracking
  performance JSONB DEFAULT '{"timesUsed": 0, "averageVariance": 0, "successRate": 0}',
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cashflow Projections
CREATE TABLE cashflow_projections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Projection period
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Monthly projections (JSONB array)
  monthly_projections JSONB NOT NULL DEFAULT '[]',
  
  -- Assumptions used
  assumptions JSONB NOT NULL DEFAULT '{}',
  
  -- Risk factors
  risks JSONB DEFAULT '[]',
  
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Alerts
CREATE TABLE financial_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Alert details
  type TEXT CHECK (type IN ('budget-variance', 'payment-overdue', 'forecast-risk', 'expense-anomaly', 'opportunity')) NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Related entity references
  related_ids JSONB DEFAULT '{}',
  
  -- Suggested actions
  suggestions TEXT[] DEFAULT '{}',
  
  -- Alert triggers
  triggers JSONB NOT NULL DEFAULT '{}',
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  is_actionable BOOLEAN DEFAULT TRUE,
  dismissed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exchange Rates Cache (for offline use)
CREATE TABLE exchange_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate DECIMAL(10,6) NOT NULL,
  rate_date DATE NOT NULL,
  source TEXT DEFAULT 'api',
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  UNIQUE(from_currency, to_currency, rate_date)
);

-- Indexes for performance
CREATE INDEX idx_financial_entities_org_date ON financial_entities(organization_id, date DESC);
CREATE INDEX idx_financial_entities_show ON financial_entities(show_id);
CREATE INDEX idx_financial_entities_category ON financial_entities(category);
CREATE INDEX idx_financial_entities_status ON financial_entities(status);
CREATE INDEX idx_settlements_show ON settlements(show_id);
CREATE INDEX idx_settlements_org ON settlements(organization_id);
CREATE INDEX idx_exchange_rates_pair_date ON exchange_rates(from_currency, to_currency, rate_date DESC);
CREATE INDEX idx_financial_alerts_org_unread ON financial_alerts(organization_id, is_read) WHERE is_read = FALSE;

-- RLS Policies for Financial Data
ALTER TABLE financial_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashflow_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_alerts ENABLE ROW LEVEL SECURITY;

-- Users can only access their organization's financial data
CREATE POLICY "Users can access their organization's financial entities"
ON financial_entities FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can access their organization's split configurations"
ON split_configurations FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can access their organization's settlements"
ON settlements FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can access their organization's budget templates"
ON budget_templates FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can access their organization's cashflow projections"
ON cashflow_projections FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can access their organization's financial alerts"
ON financial_alerts FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
));

-- Exchange rates are globally readable, but only system can write
CREATE POLICY "Exchange rates are readable by all authenticated users"
ON exchange_rates FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Only service role can modify exchange rates"  
ON exchange_rates FOR ALL
USING (auth.role() = 'service_role');

-- Triggers for updated_at
CREATE TRIGGER update_financial_entities_updated_at BEFORE UPDATE ON financial_entities 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_split_configurations_updated_at BEFORE UPDATE ON split_configurations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settlements_updated_at BEFORE UPDATE ON settlements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_templates_updated_at BEFORE UPDATE ON budget_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert seed data for development
INSERT INTO organizations (name, type) VALUES 
  ('Demo Artist', 'artist'),
  ('Demo Booking Agency', 'agency'),
  ('Demo Management', 'agency');

-- Default split configuration for demo
INSERT INTO split_configurations (organization_id, name, management_fee, booking_fee, artist_split, is_default)
SELECT id, 'Standard Split', 
  '{"percentage": 0.20, "basis": "net", "capAmount": null}',
  '{"percentage": 0.10, "basis": "gross", "capAmount": null}', 
  '{"percentage": 0.70, "afterExpenses": true}',
  true
FROM organizations WHERE name = 'Demo Artist';

-- Note: User profiles will be created via triggers on auth.users insert
-- or via the application on first login
