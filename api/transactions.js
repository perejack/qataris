import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const raw = fs.readFileSync(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined || process.env[key] === '') {
        process.env[key] = value;
      }
    }
  } catch {
    // ignore
  }
}

function ensureEnvLoaded() {
  if (process.env.__QATAR_LOCAL_ENV_LOADED) return;
  process.env.__QATAR_LOCAL_ENV_LOADED = '1';

  const root = process.cwd();
  loadEnvFile(path.join(root, '.vercel', '.env.development.local'));
  loadEnvFile(path.join(root, '.vercel', '.env.local'));
  loadEnvFile(path.join(root, '.env.local'));
  loadEnvFile(path.join(root, '.env'));
}

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
}

function getSupabaseKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.APP_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.APP_SUPABASE_ANON_KEY
  );
}

function getSupabaseClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseKey();
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getAdminToken(req) {
  const header = req.headers['x-admin-token'] || req.headers['X-Admin-Token'];
  if (typeof header === 'string' && header.trim()) return header.trim();

  const auth = req.headers.authorization || req.headers.Authorization;
  if (typeof auth === 'string') {
    const match = auth.match(/^Bearer\s+(.+)$/i);
    if (match?.[1]) return match[1].trim();
  }

  return '';
}

function parsePositiveInt(val, fallback) {
  const parsed = Number.parseInt(String(val ?? ''), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).send('');
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const isProduction = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  const expectedToken = process.env.TRANSACTIONS_ADMIN_TOKEN || 'dev-token';
  const providedToken = getAdminToken(req);

  // In development, allow access without token if none provided
  if (isProduction) {
    if (!expectedToken || expectedToken === 'dev-token') {
      return res.status(500).json({ success: false, message: 'Server misconfigured: missing TRANSACTIONS_ADMIN_TOKEN' });
    }
    if (providedToken !== expectedToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  } else {
    // Development: skip token check if no token provided and using default dev-token
    if (expectedToken !== 'dev-token' && providedToken !== expectedToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  }

  try {
    ensureEnvLoaded();
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      const supabaseUrl = Boolean(getSupabaseUrl());
      const supabaseKey = Boolean(getSupabaseKey());
      return res.status(500).json({ 
        success: false, 
        message: `Server misconfigured: missing Supabase credentials (SUPABASE_URL:${supabaseUrl ? 'ok' : 'missing'}, SUPABASE_KEY:${supabaseKey ? 'ok' : 'missing'})` 
      });
    }
    const page = parsePositiveInt(req.query.page, 1);
    const pageSize = Math.min(parsePositiveInt(req.query.pageSize, 25), 200);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const purpose = typeof req.query.purpose === 'string' ? req.query.purpose.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';

    let query = supabase
      .from('qatar_transactions_explorer')
      .select('*', { count: 'exact' })
      .order('payment_created_at', { ascending: false });

    if (purpose) {
      query = query.eq('purpose', purpose);
    }

    if (status) {
      query = query.eq('payment_status', status);
    }

    if (q) {
      const safe = q.replace(/%/g, '\\%').replace(/,/g, '');
      query = query.or(
        [
          `checkout_request_id.ilike.%${safe}%`,
          `phone_number.ilike.%${safe}%`,
          `interview_company.ilike.%${safe}%`,
          `interview_position.ilike.%${safe}%`,
          `application_email.ilike.%${safe}%`,
          `application_job_title.ilike.%${safe}%`,
        ].join(',')
      );
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('qatar transactions query error:', error);
      return res.status(500).json({ success: false, message: 'Failed to load transactions', error: error.message });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
      count: typeof count === 'number' ? count : null,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('qatar transactions api error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message || String(error) });
  }
};
