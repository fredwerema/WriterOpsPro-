import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const supabaseUrl = 'https://lcynmynqjmivckrzyvfj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjeW5teW5xam1pdmNrcnp5dmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjE4MjksImV4cCI6MjA4MDgzNzgyOX0.xzxDHeo33pdLm8fNmCnSWvim_PXmTQ_xx4HYwpunkE8';

export const supabase = createClient(supabaseUrl, supabaseKey);