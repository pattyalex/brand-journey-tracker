import { google } from 'googleapis';

const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { tokens, eventId, event } = req.body;

    if (!tokens || !tokens.access_token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const eventBody = {};
    if (event.summary !== undefined) eventBody.summary = event.summary;
    if (event.description !== undefined) eventBody.description = event.description;
    if (event.location !== undefined) eventBody.location = event.location;

    if (event.isAllDay) {
      eventBody.start = { date: event.date };
      eventBody.end = { date: event.endDate || event.date };
    } else if (event.date && event.startTime && event.endTime) {
      const startDateTime = `${event.date}T${event.startTime}:00`;
      const endDateTime = `${event.date}T${event.endTime}:00`;
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      eventBody.start = { dateTime: startDateTime, timeZone };
      eventBody.end = { dateTime: endDateTime, timeZone };
    }

    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: eventBody,
    });

    const updated = response.data;
    const isAllDay = !updated.start?.dateTime;
    const startDateTimeStr = updated.start?.dateTime || updated.start?.date;
    const endDateTimeStr = updated.end?.dateTime || updated.end?.date;

    let date, startTime, endTime;
    if (isAllDay) {
      date = updated.start?.date;
    } else {
      const startObj = new Date(startDateTimeStr);
      const endObj = new Date(endDateTimeStr);
      date = startObj.toISOString().split('T')[0];
      startTime = startObj.toTimeString().slice(0, 5);
      endTime = endObj.toTimeString().slice(0, 5);
    }

    res.json({
      event: {
        id: updated.id,
        title: updated.summary || '(No title)',
        description: updated.description,
        date,
        startTime,
        endTime,
        isAllDay,
        source: 'google',
        htmlLink: updated.htmlLink,
        location: updated.location,
      },
      tokens: oauth2Client.credentials,
    });
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);

    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return res.status(401).json({ error: 'Token expired or revoked', needsReauth: true });
    }

    res.status(500).json({ error: error.message });
  }
}
