import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).send('');
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Server is missing required environment variables' });
    }

    const { phone, userId, paymentReference, jobTitle, amount = 240 } = req.body || {};
    if (!phone) return res.status(400).json({ success: false, message: 'Missing required field: phone' });

    const projectData = {
      userId: userId || 'guest-user',
      activationFee: 240,
      jobTitle: jobTitle || null,
      submittedAt: new Date().toISOString(),
    };

    const ipAddress = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    if (amount !== 240) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        project_name: 'QATAR',
        full_name: userId || 'Qatar Jobs User',
        email: 'qatarjobs@application.com',
        phone: phone,
        project_data: projectData,
        payment_reference: paymentReference || null,
        payment_status: 'unpaid',
        payment_amount: 240,
        ip_address: ipAddress.split(',')[0].trim(),
        user_agent: userAgent,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to save application', error: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      data: { applicationId: data.id, reference: data.payment_reference },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
