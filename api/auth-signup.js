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

function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.APP_SUPABASE_SERVICE_ROLE_KEY;
}

function getAnonKey() {
  return process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.APP_SUPABASE_ANON_KEY;
}

function getSupabaseClient(url, key) {
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isNetworkFailureMessage(message) {
  const m = typeof message === 'string' ? message : '';
  return /fetch failed|getaddrinfo|ENOTFOUND|ECONNRESET|ETIMEDOUT/i.test(m);
}

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).send('');
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    ensureEnvLoaded();
    const supabaseUrl = getSupabaseUrl();
    const serviceRoleKey = getServiceRoleKey();
    const anonKey = getAnonKey();

    const body = req.body || {};
    const { email, password, metadata } = body;

    if (!email) return res.status(400).json({ success: false, message: 'Missing required field: email' });
    if (!password) return res.status(400).json({ success: false, message: 'Missing required field: password' });

    const adminClient = serviceRoleKey ? getSupabaseClient(supabaseUrl, serviceRoleKey) : null;
    const authClient = getSupabaseClient(supabaseUrl, anonKey || serviceRoleKey);

    if (!authClient) {
      const hasUrl = Boolean(supabaseUrl);
      const hasKey = Boolean(anonKey || serviceRoleKey);
      return res.status(500).json({
        success: false,
        message: `Server misconfigured: missing Supabase credentials (SUPABASE_URL:${hasUrl ? 'ok' : 'missing'}, SUPABASE_KEY:${hasKey ? 'ok' : 'missing'})`,
      });
    }

    let createdUser = null;

    if (adminClient) {
      const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata || {},
      });

      if (createError) {
        const msg = createError.message || 'Signup failed';
        if (isNetworkFailureMessage(msg)) {
          return res.status(502).json({
            success: false,
            message: `Unable to reach Supabase. Check SUPABASE_URL in Vercel (${supabaseUrl || 'missing'}).`,
            error: { message: msg },
          });
        }
        return res.status(400).json({ success: false, message: msg, error: createError });
      }

      createdUser = createData?.user || null;
    } else {
      const { data: signUpData, error: signUpError } = await authClient.auth.signUp({
        email,
        password,
        options: { data: metadata || {} },
      });

      if (signUpError) {
        const msg = signUpError.message || 'Signup failed';
        if (isNetworkFailureMessage(msg)) {
          return res.status(502).json({
            success: false,
            message: `Unable to reach Supabase. Check SUPABASE_URL in Vercel (${supabaseUrl || 'missing'}).`,
            error: { message: msg },
          });
        }
        return res.status(400).json({ success: false, message: msg, error: signUpError });
      }

      createdUser = signUpData?.user || null;
    }

    if (!createdUser?.id) {
      return res.status(500).json({ success: false, message: 'Signup failed: no user returned' });
    }

    const meta = createdUser.user_metadata || {};
    const userData = {
      id: createdUser.id,
      username: meta.username || (typeof email === 'string' ? email.split('@')[0] : ''),
      email: createdUser.email || email,
      fullName: meta.full_name || meta.fullName || '',
      phone: meta.phone || '',
      location: meta.location || '',
      dateOfBirth: meta.date_of_birth || '',
      positionApplied: meta.position_applied || '',
      createdAt: createdUser.created_at || new Date().toISOString(),
    };

    return res.status(200).json({ success: true, user: userData });
  } catch (err) {
    console.error('auth-signup error:', err);
    const msg = err?.message || 'Internal server error';
    const causeCode = err?.cause?.code;
    if (isNetworkFailureMessage(msg) || causeCode === 'ENOTFOUND') {
      return res.status(502).json({
        success: false,
        message: `Unable to reach Supabase. Check SUPABASE_URL in Vercel (${supabaseUrl || 'missing'}).`,
        error: { message: msg, code: causeCode },
      });
    }
    return res.status(500).json({ success: false, message: msg });
  }
};
