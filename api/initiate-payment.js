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

function getSwiftpayApiKey() {
  return process.env.SWIFTPAY_API_KEY;
}

function getSwiftpayTillId() {
  return process.env.SWIFTPAY_TILL_ID;
}

function getSwiftpayBackendUrl() {
  return process.env.SWIFTPAY_BACKEND_URL;
}

function getSupabaseClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseKey();
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// SwiftPay Configuration

// Normalize phone number to 254 format
function normalizePhoneNumber(phone) {
  if (!phone) return null;
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }
  if (cleaned.length !== 12 || !/^\d+$/.test(cleaned)) {
    return null;
  }
  return cleaned;
}

function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    ensureEnvLoaded();

    const supabase = getSupabaseClient();
    const swiftpayApiKey = getSwiftpayApiKey();
    const swiftpayTillId = getSwiftpayTillId();
    const swiftpayBackendUrl = getSwiftpayBackendUrl();

    if (!supabase || !swiftpayApiKey || !swiftpayTillId || !swiftpayBackendUrl) {
      const supabaseUrl = Boolean(getSupabaseUrl());
      const supabaseKey = Boolean(getSupabaseKey());
      const swiftpayKey = Boolean(swiftpayApiKey);
      const swiftpayTill = Boolean(swiftpayTillId);
      const swiftpayUrl = Boolean(swiftpayBackendUrl);
      return res.status(500).json({
        success: false,
        message: `Server misconfigured: missing credentials (SUPABASE_URL:${supabaseUrl ? 'ok' : 'missing'}, SUPABASE_KEY:${supabaseKey ? 'ok' : 'missing'}, SWIFTPAY_API_KEY:${swiftpayKey ? 'ok' : 'missing'}, SWIFTPAY_TILL_ID:${swiftpayTill ? 'ok' : 'missing'}, SWIFTPAY_BACKEND_URL:${swiftpayUrl ? 'ok' : 'missing'})`,
      });
    }

    if (!req.body) {
      return res.status(400).json({ success: false, message: 'Request body is missing or invalid' });
    }

    let {
      phoneNumber,
      amount = 240,
      description = 'Qatar Jobs Portal Verification',
      applicationId,
      interviewBookingId,
      purpose,
      userId,
      interviewCompany,
      interviewPosition,
      interviewType,
      interviewAt,
      interviewStatus,
    } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format. Use 07XXXXXXXX or 254XXXXXXXXX' });
    }

    if (amount !== 240) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const externalReference = `QATAR-${Date.now()}`;

    const swiftpayPayload = {
      phone_number: normalizedPhone,
      amount: amount,
      till_id: swiftpayTillId,
    };

    const response = await fetch(`${swiftpayBackendUrl}/api/mpesa/stk-push-api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${swiftpayApiKey}`,
      },
      body: JSON.stringify(swiftpayPayload),
    });

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return res.status(502).json({
        success: false,
        message: 'Invalid response from payment service',
      });
    }

    if (response.ok && (data.success === true || data.status === 'success')) {
      const checkoutId = data.data?.checkout_id || data.data?.request_id || data.CheckoutRequestID || externalReference;

      try {
        const safeUserId = isUuid(userId) ? userId : null;
        const safeApplicationId = isUuid(applicationId) ? applicationId : null;
        let safeInterviewBookingId = isUuid(interviewBookingId) ? interviewBookingId : null;

        if (!safeInterviewBookingId && (purpose === 'interview_booking' || interviewCompany || interviewPosition)) {
          if (!interviewAt) {
            console.error('qatar_interview_bookings insert error: interview_at is required');
          } else {
            const insertBooking = async (userIdToInsert) => {
              return await supabase
                .from('qatar_interview_bookings')
                .insert({
                  user_id: userIdToInsert,
                  company: interviewCompany || null,
                  position: interviewPosition || null,
                  interview_type: interviewType || 'video',
                  interview_at: interviewAt,
                  status: interviewStatus || 'pending',
                })
                .select('id')
                .single();
            };

            let { data: createdBooking, error: bookingInsertError } = await insertBooking(safeUserId);

            if (bookingInsertError && bookingInsertError.code === '23503' && safeUserId) {
              ({ data: createdBooking, error: bookingInsertError } = await insertBooking(null));
            }

            if (bookingInsertError) {
              console.error('qatar_interview_bookings insert error:', bookingInsertError);
            } else if (createdBooking?.id) {
              safeInterviewBookingId = createdBooking.id;
            }
          }
        }

        const inferredPurpose = purpose || (safeApplicationId ? 'application' : safeInterviewBookingId ? 'interview_booking' : 'unknown');

        const { error: dbError } = await supabase
          .from('qatar_payment_attempts')
          .insert({
            user_id: safeUserId,
            application_id: safeApplicationId,
            interview_booking_id: safeInterviewBookingId,
            purpose: inferredPurpose,
            checkout_request_id: checkoutId,
            phone_number: normalizedPhone,
            amount: parseFloat(amount),
            status: 'pending',
          });

        if (dbError) {
          console.error('Database insert error:', dbError);
        }
      } catch (dbErr) {
        console.error('Database error:', dbErr);
      }

      return res.status(200).json({
        success: true,
        message: 'Payment initiated successfully',
        data: {
          requestId: checkoutId,
          checkoutRequestId: checkoutId,
          transactionRequestId: checkoutId,
          reference: externalReference,
          description,
          amount,
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: data.message || 'Payment initiation failed',
      error: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred',
      error: error.message || String(error),
    });
  }
};
