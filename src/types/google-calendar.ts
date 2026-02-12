export interface GoogleCalendarTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  token_type: string;
  scope: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
  location?: string;
  status?: string;
  colorId?: string;
}

export interface GoogleCalendarConnection {
  isConnected: boolean;
  email: string | null;
  lastSync: string | null;
  showEvents: boolean;
}

export interface TransformedGoogleEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  isAllDay: boolean;
  source: 'google';
  htmlLink?: string;
  location?: string;
}
