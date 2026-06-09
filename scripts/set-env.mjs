import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const supabaseUrl =
  process.env.SUPABASE_URL ?? 'https://kwizcxeutuaawdfqlkah.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? '';
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY ?? '';

const content = `export const environment = {
  production: true,
  apiUrl: '/api',
  useMockApi: false,
  useSupabase: true,
  supabaseUrl: '${supabaseUrl}',
  supabaseAnonKey: '${supabaseAnonKey}',
  defaultCurrency: 'THB',
  defaultRemindDays: 3,
  vapidPublicKey: '${vapidPublicKey}',
};
`;

writeFileSync(join(root, 'src/environments/environment.prod.ts'), content);
console.log('✓ environment.prod.ts generated');
console.log(`  supabaseUrl: ${supabaseUrl}`);
console.log(`  supabaseAnonKey: ${supabaseAnonKey ? '***set***' : 'MISSING — set SUPABASE_ANON_KEY'}`);
