import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lzwkaquwomvaoprruouk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6d2thcXV3b212YW9wcnJ1b3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MTc5MzMsImV4cCI6MjA3NzI5MzkzM30.p8CsE8mEI_fQ1wGEpauCrWD7nPouOKIeGljtCQCmwQM";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
