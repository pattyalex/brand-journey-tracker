import { google } from 'googleapis';

const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

export default async function handler(req, res) {
  try {
    const { code, state: userId } = req.query;

    if (!code) {
      return res.redirect('/?google-calendar-error=no-code');
    }

    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    // Get user email
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    console.log('Google Calendar connected for:', userInfo.email);

    // Return HTML that passes tokens back to the frontend via postMessage
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Calendar Connected</title>
          <style>
            body {
              font-family: 'DM Sans', -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(145deg, #f5f0f3 0%, #ede5ea 100%);
            }
            .container {
              text-align: center;
              padding: 40px;
              background: white;
              border-radius: 20px;
              box-shadow: 0 4px 24px rgba(45, 42, 38, 0.08);
            }
            .success-icon {
              width: 64px;
              height: 64px;
              background: linear-gradient(145deg, #4285f4 0%, #1a73e8 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
            }
            .success-icon svg { width: 32px; height: 32px; color: white; }
            h2 { color: #2d2a26; margin-bottom: 10px; }
            p { color: #8B7082; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2>Google Calendar Connected!</h2>
            <p>You can close this window now.</p>
          </div>
          <script>
            const data = {
              success: true,
              tokens: ${JSON.stringify(tokens)},
              email: ${JSON.stringify(userInfo.email)}
            };
            if (window.opener) {
              window.opener.postMessage({ type: 'google-calendar-callback', ...data }, '*');
              setTimeout(() => window.close(), 2000);
            } else {
              // Fallback: store in localStorage and redirect
              localStorage.setItem('google_calendar_tokens', JSON.stringify(data.tokens));
              localStorage.setItem('google_calendar_email', data.email);
              localStorage.setItem('google_calendar_connected', 'true');
              setTimeout(() => window.location.href = '/my-account?google-connected=true', 1000);
            }
          </script>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Google Calendar callback error:', error);
    res.redirect('/?google-calendar-error=' + encodeURIComponent(error.message));
  }
};
