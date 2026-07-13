import fs from 'fs';
import { createClient } from '../node_modules/@supabase/supabase-js/dist/main/index.mjs';

const env = Object.fromEntries(
  fs
    .readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => line.split('='))
);

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const run = async () => {
  const { data, error } = await supabase
    .from('tour_packages')
    .select('id, name, status, user_id, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error querying tour_packages:', error);
    process.exit(1);
  }

  console.table(data);
};

run();
