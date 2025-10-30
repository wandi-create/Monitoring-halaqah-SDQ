import { createClient } from '@supabase/supabase-js';

// Kredensial kini diambil dengan aman dari Variabel Lingkungan Vercel (Environment Variables)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Logika ini memastikan kredensial ditemukan
if (!supabaseUrl || !supabaseAnonKey) {
    // Di lingkungan Node.js (Vercel), ini akan menghasilkan error build/runtime jika kunci hilang.
    // Di browser, ini akan menggunakan nilai kosong, tetapi seharusnya sudah diatasi oleh Vercel.
    console.error("Kesalahan: Variabel Lingkungan Supabase tidak ditemukan. Pastikan sudah diatur di Vercel.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
