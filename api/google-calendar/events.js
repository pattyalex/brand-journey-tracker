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
    const { tokens, startDate, endDate } = req.body;

    if (!tokens || !tokens.access_token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Build time range
    const timeMin = startDate ? new Date(startDate).toISOString() : new Date().toISOString();
    const timeMax = endDate
      ? new Date(endDate).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250
    });

    const events = response.data.items || [];

    // Transform events to HeyMeg format
    const transformedEvents = events.map(event => {
      const isAllDay = !event.start?.dateTime;
      const startDateTime = event.start?.dateTime || event.start?.date;
      const endDateTime = event.end?.dateTime || event.end?.date;

      let date, startTime, endTime;

      if (isAllDay) {
        date = event.start?.date;
      } else {
        const startDateObj = new Date(startDateTime);
        const endDateObj = new Date(endDateTime);
        date = startDateObj.toISOString().split('T')[0];
        startTime = startDateObj.toTimeString().slice(0, 5);
        endTime = endDateObj.toTimeString().slice(0, 5);
      }

      return {
        id: event.id,
        title: event.summary || '(No title)',
        description: event.description,
        date,
        startTime,
        endTime,
        isAllDay,
        source: 'google',
        htmlLink: event.htmlLink,
        location: event.location
      };
    });

    res.json({
      events: transformedEvents,
      tokens: oauth2Client.credentials
    });
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);

    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return res.status(401).json({ error: 'Token expired or revoked', needsReauth: true });
    }

    res.status(500).json({ error: error.message });
  }
};
