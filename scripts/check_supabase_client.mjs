import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env');
  process.exit(2);
}

const supabase = createClient(url, anon);

async function run() {
  try {
    const sessionRes = await supabase.auth.getSession();
    console.log('auth.getSession():', JSON.stringify(sessionRes, null, 2));

    // Try to read cafe_settings
    const { data, error } = await supabase.from('cafe_settings').select('*').limit(1);
    console.log('\nselect result:');
    if (error) console.log('error:', error.message);
    console.log('data:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Unexpected error:', e);
  }
}

run();
