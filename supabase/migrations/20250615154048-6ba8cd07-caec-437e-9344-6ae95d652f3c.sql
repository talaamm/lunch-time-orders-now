
-- Enable RLS on the Admin table (with correct capitalization)
ALTER TABLE public."Admin" ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read the admin settings (no authentication required)
CREATE POLICY "Anyone can view admin settings" 
  ON public."Admin" 
  FOR SELECT 
  USING (true);

-- Allow anyone to insert/update admin settings (since we don't have user authentication)
-- In a real production app, you'd want to restrict this to authenticated admins only
CREATE POLICY "Anyone can update admin settings" 
  ON public."Admin" 
  FOR ALL 
  USING (true);

-- Insert a default row if it doesn't exist
INSERT INTO public."Admin" (id, status, message) 
VALUES (1, true, 'Welcome to the University Cafeteria!')
ON CONFLICT (id) DO NOTHING;
