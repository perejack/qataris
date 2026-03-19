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

// SwiftPay M-Pesa Verification Proxy
function getMpesaProxyUrl() {
  return process.env.MPESA_PROXY_URL;
}

function getMpesaProxyApiKey() {
  return process.env.MPESA_PROXY_API_KEY;
}

async function queryMpesaPaymentStatus(checkoutId) {
  const mpesaProxyUrl = getMpesaProxyUrl();
  const mpesaProxyApiKey = getMpesaProxyApiKey();
  
  if (!mpesaProxyUrl || !mpesaProxyApiKey) return null;
  
  try {
    const response = await fetch(mpesaProxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkoutId,
        apiKey: mpesaProxyApiKey,
      }),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

function normalizeProxyStatus(input) {
  if (!input) return null;
  const s = String(input).toLowerCase();
  if (['success', 'succeeded', 'complete', 'completed', 'paid', 'ok'].includes(s)) return 'SUCCESS';
  if (['failed', 'failure', 'cancelled', 'canceled', 'declined', 'rejected', 'timeout'].includes(s)) return 'FAILED';
  if (['pending', 'processing'].includes(s)) return 'PENDING';
  return null;
}

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).send('');
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    ensureEnvLoaded();
    const supabase = getSupabaseClient();
    const mpesaProxyUrl = getMpesaProxyUrl();
    
    if (!supabase || !mpesaProxyUrl) {
      const supabaseUrl = Boolean(getSupabaseUrl());
      const supabaseKey = Boolean(getSupabaseKey());
      const proxyUrl = Boolean(mpesaProxyUrl);
      return res.status(500).json({
        success: false,
        message: `Server misconfigured: missing credentials (SUPABASE_URL:${supabaseUrl ? 'ok' : 'missing'}, SUPABASE_KEY:${supabaseKey ? 'ok' : 'missing'}, MPESA_PROXY_URL:${proxyUrl ? 'ok' : 'missing'})`,
      });
    }

    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({ success: false, message: 'Payment reference is required' });
    }

    const { data: attempt, error: dbError } = await supabase
      .from('qatar_payment_attempts')
      .select('*')
      .eq('checkout_request_id', reference)
      .maybeSingle();

    if (dbError) {
      return res.status(500).json({
        success: false,
        message: 'Error checking payment status',
        error: dbError.message || String(dbError),
      });
    }

    if (!attempt) {
      const proxyResponse = await queryMpesaPaymentStatus(reference);
      const proxyStatus =
        normalizeProxyStatus(proxyResponse?.payment?.status) ||
        normalizeProxyStatus(proxyResponse?.status) ||
        normalizeProxyStatus(proxyResponse?.data?.status);

      if (proxyResponse && proxyStatus) {
        return res.status(200).json({
          success: true,
          payment: {
            status: proxyStatus,
            amount: null,
            phoneNumber: null,
            mpesaReceiptNumber: null,
            resultDesc: null,
            resultCode: null,
            timestamp: null,
          },
        });
      }

      return res.status(200).json({
        success: true,
        payment: {
          status: 'PENDING',
          message: 'Payment is still being processed',
        },
      });
    }

    let paymentStatus = 'PENDING';
    if (attempt.status === 'success') {
      paymentStatus = 'SUCCESS';
    } else if (attempt.status === 'failed' || attempt.status === 'cancelled') {
      paymentStatus = 'FAILED';
    }

    if (paymentStatus === 'PENDING' && attempt.checkout_request_id) {
      const proxyResponse = await queryMpesaPaymentStatus(attempt.checkout_request_id);

      const proxyStatus =
        normalizeProxyStatus(proxyResponse?.payment?.status) ||
        normalizeProxyStatus(proxyResponse?.status) ||
        normalizeProxyStatus(proxyResponse?.data?.status);

      if (proxyResponse && proxyStatus === 'SUCCESS') {
        await supabase.from('qatar_payment_attempts').update({ status: 'success' }).eq('id', attempt.id);
        paymentStatus = 'SUCCESS';
      } else if (proxyStatus === 'FAILED') {
        paymentStatus = 'FAILED';
      }
    }

    return res.status(200).json({
      success: true,
      payment: {
        status: paymentStatus,
        amount: attempt.amount,
        phoneNumber: attempt.phone_number,
        mpesaReceiptNumber: null,
        resultDesc: null,
        resultCode: null,
        timestamp: attempt.updated_at,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error.message || String(error),
    });
  }
};
