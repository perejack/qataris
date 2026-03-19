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

function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).send('');
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

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

    const body = req.body || {};
    const { phone, userId, jobTitle, email, projectData } = body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Missing required field: phone' });
    }

    const safeUserId = isUuid(userId) ? userId : null;
    const normalizedEmail = normalizeEmail(email);

    const insertRow = async (userIdToInsert) => {
      return await supabase
        .from('qatar_applications')
        .insert({
          user_id: userIdToInsert,
          job_title: jobTitle || null,
          pending_email: normalizedEmail || null,
          source: 'interactive_form',
          data: projectData || {},
          payment_reference: null,
          payment_status: 'unpaid',
        })
        .select('id')
        .single();
    };

    let { data, error } = await insertRow(safeUserId);

    if (error && error.code === '23503' && safeUserId) {
      ({ data, error } = await insertRow(null));
    }

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to save application', error: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      data: { applicationId: data.id },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
