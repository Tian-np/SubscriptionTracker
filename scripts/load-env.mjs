import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const isProd = process.argv.includes('--prod');

function loadDotEnv(filename) {
  const path = join(root, filename);
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

const fileEnv = { ...loadDotEnv('.env'), ...loadDotEnv('.env.local') };

const supabaseUrl =
  process.env.SUPABASE_URL ??
  fileEnv.SUPABASE_URL ??
  'https://kwizcxeutuaawdfqlkah.supabase.co';
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ?? fileEnv.SUPABASE_ANON_KEY ?? '';
const vapidPublicKey =
  process.env.VAPID_PUBLIC_KEY ?? fileEnv.VAPID_PUBLIC_KEY ?? '';

const targetFile = isProd
  ? join(root, 'src/environments/environment.prod.ts')
  : join(root, 'src/environments/environment.ts');

const content = isProd
  ? `export const environment = {
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
`
  : `export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  useMockApi: false,
  useSupabase: true,
  supabaseUrl: '${supabaseUrl}',
  supabaseAnonKey: '${supabaseAnonKey}',
  defaultCurrency: 'THB',
  defaultRemindDays: 3,
  vapidPublicKey: '${vapidPublicKey}',
};
`;

writeFileSync(targetFile, content);

const label = isProd ? 'environment.prod.ts' : 'environment.ts';
console.log(`✓ ${label} generated`);
console.log(`  supabaseUrl: ${supabaseUrl}`);
console.log(
  `  supabaseAnonKey: ${supabaseAnonKey ? '***set***' : 'MISSING — copy .env.example → .env.local'}`,
);

if (!supabaseAnonKey) {
  process.exit(1);
}
