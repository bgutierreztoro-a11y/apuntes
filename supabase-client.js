// ── Supabase Client ─────────────────────────────────────────────────────────
// IMPORTANTE: Reemplaza los dos valores de abajo con los de tu proyecto Supabase
// Settings → API → Project URL  y  anon / public key
const SUPABASE_URL      = 'https://xssojsdfoxqrplslsbvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzc29qc2Rmb3hxcnBsc2xzYnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNjYxNDIsImV4cCI6MjA5Nzc0MjE0Mn0.12M29iZ6JUP3DQZxaP2IIEEgWuARgfKJ_GUx58CfDAM';

window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
