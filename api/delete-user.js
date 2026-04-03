import https from 'https';

function supabaseRequest(url, method, token, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': token,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(responseData || '{}') }); }
        catch (e) { resolve({ status: res.statusCode, body: {} }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.heymeg.ai');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return res.status(500).json({ error: 'Service role key not configured' });
  }

  // Verify the user's auth token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const userToken = authHeader.replace('Bearer ', '');

  try {
    // Verify the token by getting the user
    const verifyResult = await supabaseRequest(
      `${supabaseUrl}/auth/v1/user`,
      'GET',
      userToken,
      null
    );

    if (verifyResult.status !== 200 || !verifyResult.body.id) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = verifyResult.body.id;

    // Delete the user using the service role key
    const deleteResult = await supabaseRequest(
      `${supabaseUrl}/auth/v1/admin/users/${userId}`,
      'DELETE',
      serviceRoleKey,
      null
    );

    if (deleteResult.status !== 200) {
      console.error('Error deleting user:', deleteResult.body);
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in delete-user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
