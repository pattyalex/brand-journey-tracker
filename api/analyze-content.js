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

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' },
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'] || 'image/jpeg',
          buffer,
        });
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
    const { contentUrl, contentType, imageData: providedImageData, mediaType: providedMediaType } = req.body;

    let imageData;
    let mediaType = providedMediaType || 'image/jpeg';

    if (providedImageData) {
      imageData = providedImageData;
    } else if (contentUrl) {
      try {
        const fetched = await fetchUrl(contentUrl);
        if (fetched.status !== 200) {
          throw new Error(`Failed to fetch content: ${fetched.status}`);
        }
        mediaType = fetched.contentType;
        imageData = fetched.buffer.toString('base64');
      } catch (error) {
        return res.status(400).json({ error: 'Could not fetch content from URL' });
      }
    } else {
      return res.status(400).json({ error: 'Either contentUrl or imageData must be provided' });
    }

    const result = await anthropicRequest({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageData
            }
          },
          {
            type: 'text',
            text: `Analyze this social media content carefully.

Focus on:
1. Any TEXT OVERLAYS or CAPTIONS in the image/video - these reveal the core message
2. The person's body language and setting
3. The overall theme and message being conveyed

Provide your analysis in JSON format:

{
  "pillar": "The main topic/pillar based on the message (e.g., Business/Entrepreneurship, Personal Development, Networking, Career, Nutrition, Lifestyle, Fashion, etc.)",
  "format": "The content format - if you see a video play button or were told it's a video, say 'Reel' or 'Video'. Other formats: Carousel, Static image post, etc.",
  "deliveryStyle": "The delivery style (e.g., Educational, Entertaining, Inspirational, Motivational, Relatable, etc.)",
  "hook": "The hook or main message - quote the largest/most prominent TEXT OVERLAY you see in the image. This text is usually the hook or main point.",
  "comments": "What people would likely comment about based on the message (e.g., Relatability, Disagreement, Agreement, Inspiration, Requests for more, etc.)",
  "summary": "A brief 2-3 sentence natural language summary explaining the core message and what makes this content effective"
}

CRITICAL INSTRUCTIONS:
- The largest text overlay you see IS the hook/main message - quote it exactly
- If it's a video (you see play button or were told), say format is "Reel" or "Video"
- The TEXT reveals the topic, not the person's appearance
- Focus on the MESSAGE and TOPIC being communicated, not visual aesthetics`
          }
        ]
      }]
    }, apiKey);

    if (result.status !== 200) {
      return res.status(result.status).json({ error: `Claude API error: ${result.status}` });
    }

    res.json(result.body);
  } catch (error) {
    console.error('Error analyzing content:', error);
    res.status(500).json({ error: error.message });
  }
}
