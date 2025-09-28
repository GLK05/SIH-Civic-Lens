import { createClient } from '@supabase/supabase-js';

// Use injected keys from Netlify if available, otherwise fall back to hardcoded values (for local dev)
const supabaseUrl = window.SUPABASE_CONFIG?.url || 'https://atvwnghqynoturvhoulb.supabase.co';
const supabaseAnonKey = window.SUPABASE_CONFIG?.anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0dnduZ2hxeW5vdHVydmhvdWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1Njg1NjIsImV4cCI6MjA3NDE0NDU2Mn0.eCAd-i4UpPkLHIH77ST0-Zt0_Zcxp0SCox9VAOTPt0A';

// Check if the placeholder values are still being used.
// This check works for both local dev (direct edit) and deployed (if env vars are not set).
if (!supabaseUrl || supabaseUrl.includes('your-project-id') || !supabaseAnonKey || supabaseAnonKey.includes('your-supabase-anon-key')) {
  console.warn(
`********************************************************************************
*                                                                              *
*      SUPABASE CREDENTIALS ARE NOT SET!                                       *
*                                                                              *
*   The application cannot connect to the database. Please follow the          *
*   setup instructions in the README.md file to configure your credentials.    *
*                                                                              *
********************************************************************************`
  );
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);