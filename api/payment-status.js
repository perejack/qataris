import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// SwiftPay M-Pesa Verification Proxy
const MPESA_PROXY_URL = process.env.MPESA_PROXY_URL;
const MPESA_PROXY_API_KEY = process.env.MPESA_PROXY_API_KEY;

async function queryMpesaPaymentStatus(checkoutId) {
  try {
    const response = await fetch(MPESA_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkoutId,
        apiKey: MPESA_PROXY_API_KEY,
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
    if (!supabase || !MPESA_PROXY_URL) {
      return res.status(500).json({
        success: false,
        message: 'Server is missing required environment variables',
      });
    }

    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({ success: false, message: 'Payment reference is required' });
    }

    const { data: transaction, error: dbError } = await supabase
      .from('transactions')
      .select('*')
      .or(`reference.eq.${reference},transaction_request_id.eq.${reference}`)
      .maybeSingle();

    if (dbError) {
      return res.status(500).json({
        success: false,
        message: 'Error checking payment status',
        error: dbError.message || String(dbError),
      });
    }

    if (!transaction) {
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
    if (transaction.status === 'success') {
      paymentStatus = 'SUCCESS';
    } else if (transaction.status === 'failed' || transaction.status === 'cancelled') {
      paymentStatus = 'FAILED';
    }

    if (paymentStatus === 'PENDING' && transaction.transaction_request_id) {
      const proxyResponse = await queryMpesaPaymentStatus(transaction.transaction_request_id);

      const proxyStatus =
        normalizeProxyStatus(proxyResponse?.payment?.status) ||
        normalizeProxyStatus(proxyResponse?.status) ||
        normalizeProxyStatus(proxyResponse?.data?.status);

      if (proxyResponse && proxyStatus === 'SUCCESS') {
        await supabase.from('transactions').update({ status: 'success' }).eq('id', transaction.id);
        paymentStatus = 'SUCCESS';
      } else if (proxyStatus === 'FAILED') {
        paymentStatus = 'FAILED';
      }
    }

    return res.status(200).json({
      success: true,
      payment: {
        status: paymentStatus,
        amount: transaction.amount,
        phoneNumber: transaction.phone,
        mpesaReceiptNumber: transaction.receipt_number,
        resultDesc: transaction.result_description,
        resultCode: transaction.result_code,
        timestamp: transaction.updated_at,
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
