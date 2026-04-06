import https from 'https';

function supabaseVerify(token, supabaseUrl) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(`${supabaseUrl}/auth/v1/user`);
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const options = {
      hostname: parsed.hostname, port: 443, path: parsed.pathname, method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': anonKey },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: {} }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function resendRequest(body, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(responseData) }); }
        catch (e) { resolve({ status: res.statusCode, body: {} }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.heymeg.ai');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
  const userToken = authHeader.replace('Bearer ', '');
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const verifyResult = await supabaseVerify(userToken, supabaseUrl);
  if (verifyResult.status !== 200 || !verifyResult.body.id) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Resend API key not configured' });

  try {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'to, subject, and html are required' });
    }

    const result = await resendRequest({
      from: 'HeyMeg <noreply@heymeg.ai>',
      to,
      subject,
      html,
    }, apiKey);

    if (result.status !== 200 && result.status !== 201) {
      return res.status(400).json({ error: result.body.message || 'Failed to send email' });
    }

    res.json({ success: true, messageId: result.body.id });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
