import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uwamjxcojofzkojnsogt.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YW1qeGNvam9memtvam5zb2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyODc4NjYsImV4cCI6MjEwNjg2Mzg2Nn0.G9-H_q7F2UCRRPUhDDsBc3_jX2J7MQxZNnyd4IPOlkg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
