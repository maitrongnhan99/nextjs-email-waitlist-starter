-- Create waitlist table for storing email subscriptions
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  convertkit_subscriber_id TEXT,
  source TEXT DEFAULT 'waitlist',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Create index on subscribed_at for analytics
CREATE INDEX IF NOT EXISTS idx_waitlist_subscribed_at ON waitlist(subscribed_at);

-- Enable Row Level Security (RLS)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for waitlist signup)
CREATE POLICY "Allow public insert" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Create policy to allow service role to select all (for admin access)
CREATE POLICY "Allow service role select" ON waitlist
  FOR SELECT USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE OR REPLACE TRIGGER update_waitlist_updated_at
  BEFORE UPDATE ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for analytics (optional)
CREATE OR REPLACE VIEW waitlist_stats AS
SELECT 
  COUNT(*) as total_subscribers,
  COUNT(*) FILTER (WHERE DATE(subscribed_at) = CURRENT_DATE) as today_subscribers,
  COUNT(*) FILTER (WHERE subscribed_at >= NOW() - INTERVAL '7 days') as week_subscribers,
  COUNT(*) FILTER (WHERE subscribed_at >= NOW() - INTERVAL '30 days') as month_subscribers,
  COUNT(*) FILTER (WHERE convertkit_subscriber_id IS NOT NULL) as synced_to_convertkit
FROM waitlist;

-- Create feature_requests table for storing user feature requests
CREATE TABLE IF NOT EXISTS feature_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  feature_request TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_feature_requests_email ON feature_requests(email);

-- Create index on created_at for analytics
CREATE INDEX IF NOT EXISTS idx_feature_requests_created_at ON feature_requests(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for feature request submission)
CREATE POLICY "Allow public insert feature requests" ON feature_requests
  FOR INSERT WITH CHECK (true);

-- Create policy to allow service role to select all (for admin access)
CREATE POLICY "Allow service role select feature requests" ON feature_requests
  FOR SELECT USING (auth.role() = 'service_role');

-- Create trigger to automatically update updated_at for feature_requests
CREATE OR REPLACE TRIGGER update_feature_requests_updated_at
  BEFORE UPDATE ON feature_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();