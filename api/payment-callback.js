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

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    ensureEnvLoaded();
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      const supabaseUrl = Boolean(getSupabaseUrl());
      const supabaseKey = Boolean(getSupabaseKey());
      return res.status(500).json({ 
        status: 'error', 
        message: `Server misconfigured: missing Supabase credentials (SUPABASE_URL:${supabaseUrl ? 'ok' : 'missing'}, SUPABASE_KEY:${supabaseKey ? 'ok' : 'missing'})` 
      });
    }

    const payload = req.body || {};

    if (!payload.TransactionID && !payload.CheckoutRequestID) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid webhook data',
      });
    }

    const {
      ResponseCode,
      ResponseDescription,
      TransactionID,
      TransactionAmount,
      TransactionReceipt,
      TransactionDate,
      TransactionReference,
      Msisdn,
      MerchantRequestID,
      CheckoutRequestID,
    } = payload;

    const normalizedResponseCode = Number(ResponseCode);

    let status = 'failed';
    let statusMessage = ResponseDescription;

    if (normalizedResponseCode === 0) {
      status = 'success';
      statusMessage = 'Payment completed successfully';
    } else if (normalizedResponseCode === 1032 || normalizedResponseCode === 1031 || normalizedResponseCode === 1) {
      status = 'cancelled';
      statusMessage = 'Payment was cancelled by user';
    } else if (normalizedResponseCode === 1037) {
      return res.status(200).json({ status: 'received', message: 'Timeout webhook ignored' });
    }

    const attemptStatus = status === 'success' ? 'success' : status === 'cancelled' ? 'cancelled' : 'failed';

    if (CheckoutRequestID) {
      const { data: attempt, error: fetchError } = await supabase
        .from('qatar_payment_attempts')
        .select('id, application_id')
        .eq('checkout_request_id', CheckoutRequestID)
        .maybeSingle();

      if (fetchError) {
        console.error('qatar_payment_attempts fetch error:', fetchError);
      }

      if (attempt?.id) {
        const { error: updateError } = await supabase
          .from('qatar_payment_attempts')
          .update({ status: attemptStatus, updated_at: new Date().toISOString() })
          .eq('checkout_request_id', CheckoutRequestID);

        if (updateError) {
          console.error('qatar_payment_attempts update error:', updateError);
        }
      } else {
        const { error: insertError } = await supabase
          .from('qatar_payment_attempts')
          .insert({
            user_id: null,
            application_id: null,
            interview_booking_id: null,
            purpose: 'unknown',
            checkout_request_id: CheckoutRequestID,
            phone_number: Msisdn || null,
            amount: typeof TransactionAmount === 'number' ? TransactionAmount : Number(TransactionAmount) || 0,
            status: attemptStatus,
          });

        if (insertError) {
          console.error('qatar_payment_attempts insert error:', insertError);
        }
      }

      if (status === 'success') {
        const applicationsUpdateQuery = supabase
          .from('qatar_applications')
          .update({ payment_status: 'paid', payment_reference: CheckoutRequestID });

        const { error: applicationsUpdateError } = attempt?.application_id
          ? await applicationsUpdateQuery.eq('id', attempt.application_id)
          : await applicationsUpdateQuery.eq('payment_reference', CheckoutRequestID);

        if (applicationsUpdateError) {
          console.error('qatar_applications update error:', applicationsUpdateError);
        }
      }
    }

    return res.status(200).json({ status: 'success', message: 'Webhook processed successfully' });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Webhook received but processing failed',
      error: error.message || String(error),
    });
  }
};
