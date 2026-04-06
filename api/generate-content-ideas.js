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
    const { pillarName, subCategory, count, direction, allThemes, previousIdeas } = req.body;
    const ideaCount = count || 7;

    if (!pillarName || !subCategory) {
      return res.status(400).json({ error: 'Both pillarName and subCategory are required' });
    }

    const systemPrompt = `You are MegAI, a creative strategist that generates content ideas for brand creators.

## Core Rules

1. **Theme specificity is non-negotiable.** Every idea you generate must be deeply specific to the user's topic and theme. If an idea would still make sense for a completely different niche just by swapping out a keyword, discard it and try again. Generic ideas are failures.

2. **No generic hook templates.** Never fall back on formulaic hooks like "X things you didn't know about Y" or "Stop scrolling if you Z." Every hook must be crafted from the specific substance of the topic, not filled into a reusable template.

3. **Vary narrative structure across ideas.** Do not repeat the same format or storytelling arc within a set of ideas. Mix approaches — use contrast, tension, personal stakes, unexpected angles, behind-the-scenes framing, provocative questions, or micro-stories. Each idea should feel structurally distinct from the others.

4. **User direction is the highest priority instruction.** When the user provides direction, tone preferences, or constraints, treat those as overriding instructions. Shape every idea around what the user has asked for, not what seems generically "engaging."

5. **Avoid repetition.** When provided with previousIdeas, never regenerate or closely rephrase any of them. Each new idea must offer a genuinely different angle.

## Output Rules
- Write as actual video/post titles that make people stop scrolling
- NO emojis
- Each idea should spark curiosity or emotion
- Keep titles concise (under 15 words)
- Return ONLY a JSON array of ${ideaCount} strings, nothing else.`;

    const themesContext = allThemes && allThemes.length > 0
      ? `\n\nThe creator's full set of content themes: ${allThemes.join(', ')}. The ACTIVE theme is "${pillarName}" — generate ideas only for this theme.`
      : '';

    const previousIdeasBlock = previousIdeas && previousIdeas.length > 0
      ? `\n\nPREVIOUSLY GENERATED IDEAS (do NOT repeat or closely rephrase any of these):\n${previousIdeas.map((idea, i) => `${i + 1}. ${idea}`).join('\n')}`
      : '';

    const directionBlock = direction
      ? `\n\nIMPORTANT DIRECTION: The ideas should have a "${direction}" tone/angle. Lean heavily into this direction.`
      : '';

    const result = await anthropicRequest({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Generate ${ideaCount} content ideas for a creator focused on "${pillarName}", specifically about "${subCategory}".${themesContext}${directionBlock}${previousIdeasBlock}

Return only a JSON array of strings.`
      }]
    }, apiKey);

    if (result.status !== 200) {
      return res.status(result.status).json({ error: `Claude API error: ${result.status}` });
    }

    const text = result.body.content[0].text;
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      const ideas = JSON.parse(match[0]);
      res.json({ ideas });
    } else {
      res.status(500).json({ error: 'Failed to parse ideas from AI response' });
    }
  } catch (error) {
    console.error('Error generating content ideas:', error);
    res.status(500).json({ error: error.message });
  }
}
