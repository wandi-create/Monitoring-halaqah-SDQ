import { createClient } from '@supabase/supabase-js';

// =======================================================================================
// == PENTING: Ganti nilai di bawah ini dengan URL dan Kunci Anon Supabase proyek Anda. ==
// == Nilai saat ini adalah placeholder dan TIDAK akan berfungsi.                       ==
// =======================================================================================
const supabaseUrl = "https://lzwkaquwomvaoprruouk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6d2thcXV3b212YW9wcnJ1b3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MTc5MzMsImV4cCI6MjA3NzI5MzkzM30.p8CsE8mEI_fQ1wGEpauCrWD7nPouOKIeGljtCQCmwQM";
// =======================================================================================


// In a proper build environment (like Next.js or Vite), you would use environment variables:
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
//
// However, in this simplified browser environment, we must use placeholders
// and instruct the user to replace them.

if (supabaseUrl.includes("gantidengan") || supabaseAnonKey.includes("gantidengan")) {
  // We don't throw an error, which would crash the app.
  // Instead, we display a highly visible banner to guide the user.
  // This allows the UI to render so the user can see the app's structure.
  const banner = document.createElement('div');
  banner.style.cssText = `
    position: sticky; top: 0; left: 0; right: 0; padding: 16px; 
    background-color: #fef2f2; color: #991b1b; text-align: center; 
    font-family: sans-serif; font-size: 16px; z-index: 9999;
    border-bottom: 2px solid #ef4444;
  `;
  banner.innerHTML = `
    <b>Konfigurasi Diperlukan:</b> Harap edit file <code>lib/supabaseClient.ts</code> 
    dan ganti placeholder untuk <code>supabaseUrl</code> dan <code>supabaseAnonKey</code> 
    dengan kredensial Supabase Anda yang sebenarnya agar aplikasi dapat berfungsi.
  `;
  
  // Wait for the DOM to be ready before prepending the banner.
  const prependBanner = () => document.body.prepend(banner);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', prependBanner);
  } else {
    prependBanner();
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
