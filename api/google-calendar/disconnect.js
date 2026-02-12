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

    if (tokens && tokens.access_token) {
      const oauth2Client = createOAuth2Client();
      oauth2Client.setCredentials(tokens);

      try {
        await oauth2Client.revokeToken(tokens.access_token);
        console.log('Google Calendar tokens revoked');
      } catch (revokeError) {
        console.warn('Could not revoke token (may already be invalid):', revokeError.message);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    res.status(500).json({ error: error.message });
  }
};
