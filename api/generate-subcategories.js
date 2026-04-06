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

function anthropicRequest(body, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(responseData) }); }
        catch (e) { reject(new Error('Invalid JSON from Anthropic')); }
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Anthropic API key not configured' });

  try {
    const { pillarName, existingCategories } = req.body;

    if (!pillarName || pillarName.trim().length < 2) {
      return res.status(400).json({ error: 'Pillar name must be at least 2 characters' });
    }

    const result = await anthropicRequest({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: `Generate sub-categories for content pillars.

STRICT RULES:
- Each sub-category MUST be 1-2 words ONLY
- Maximum 15 characters per sub-category
- NO sentences, NO hooks, NO content ideas
- Think: folder names, not video titles

CORRECT FORMAT:
["Fundraising", "Leadership", "Hiring", "Failures", "Growth"]

WRONG FORMAT (DO NOT DO THIS):
["How I raised money", "My leadership journey", "Hiring mistakes I made"]

Return ONLY a JSON array.`,
      messages: [{
        role: 'user',
        content: `Content pillar: "${pillarName}"

Generate 5-7 sub-categories. Each must be 1-2 words only (like folder names).
${existingCategories && existingCategories.length > 0 ? `\nDO NOT include any of these already existing categories: ${JSON.stringify(existingCategories)}\nGenerate DIFFERENT ones only.\n` : ''}
Example: For "Fitness" → ["Workouts", "Nutrition", "Recovery", "Mindset", "Equipment"]

Return JSON array only.`
      }]
    }, apiKey);

    if (result.status !== 200) {
      return res.status(result.status).json({ error: `Claude API error: ${result.status}` });
    }

    const text = result.body.content[0].text;
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      const subCategories = JSON.parse(match[0]);
      res.json({ subCategories });
    } else {
      res.status(500).json({ error: 'Failed to parse sub-categories from AI response' });
    }
  } catch (error) {
    console.error('Error generating sub-categories:', error);
    res.status(500).json({ error: error.message });
  }
}
