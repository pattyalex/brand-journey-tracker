import { google } from 'googleapis';

const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { tokens } = req.body;

    if (!tokens || !tokens.access_token) {
      return res.json({ isConnected: false });
    }

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);

    // Try to get user info to validate tokens
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    res.json({
      isConnected: true,
      email: userInfo.email,
      tokens: oauth2Client.credentials
    });
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);
    res.json({ isConnected: false, error: error.message });
  }
};
