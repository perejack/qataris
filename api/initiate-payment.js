import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const SWIFTPAY_API_KEY = process.env.SWIFTPAY_API_KEY;
const SWIFTPAY_TILL_ID = process.env.SWIFTPAY_TILL_ID;
const SWIFTPAY_BACKEND_URL = process.env.SWIFTPAY_BACKEND_URL;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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
    if (!supabase || !SWIFTPAY_API_KEY || !SWIFTPAY_TILL_ID || !SWIFTPAY_BACKEND_URL) {
      return res.status(500).json({
        success: false,
        message: 'Server is missing required environment variables',
      });
    }

    if (!req.body) {
      return res.status(400).json({ success: false, message: 'Request body is missing or invalid' });
    }

    let { phoneNumber, amount = 240, description = 'Qatar Jobs Portal Verification' } = req.body;

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
      till_id: SWIFTPAY_TILL_ID,
    };

    const response = await fetch(`${SWIFTPAY_BACKEND_URL}/api/mpesa/stk-push-api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SWIFTPAY_API_KEY}`,
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
        const { error: dbError } = await supabase
          .from('transactions')
          .insert({
            transaction_request_id: checkoutId,
            reference: externalReference,
            phone: normalizedPhone,
            status: 'pending',
            amount: parseFloat(amount),
          });

        if (dbError) {
          // Keep flow working even if DB insert fails
          console.error('Database insert error:', dbError);

          try {
            await supabase
              .from('transactions')
              .insert({
                transaction_request_id: checkoutId,
                amount: parseFloat(amount),
              });
          } catch (fallbackErr) {
            console.error('Database fallback insert error:', fallbackErr);
          }
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
