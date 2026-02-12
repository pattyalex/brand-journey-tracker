import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { StorageKeys, getString, setString, remove } from '@/lib/storage';
import {
  GoogleCalendarTokens,
  GoogleCalendarConnection,
  TransformedGoogleEvent
} from '@/types/google-calendar';

// Use relative URLs in production (Vercel), absolute localhost in development
const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

interface UseGoogleCalendarReturn {
  connection: GoogleCalendarConnection;
  events: TransformedGoogleEvent[];
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  fetchEvents: (startDate: string, endDate: string) => Promise<void>;
  toggleShowEvents: (show: boolean) => void;
  refreshConnection: () => Promise<void>;
}

export const useGoogleCalendar = (): UseGoogleCalendarReturn => {
  const [connection, setConnection] = useState<GoogleCalendarConnection>({
    isConnected: false,
    email: null,
    lastSync: null,
    showEvents: true
  });
  const [events, setEvents] = useState<TransformedGoogleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchParamsRef = useRef<{ startDate: string; endDate: string } | null>(null);

  // Load connection state from localStorage on mount
  useEffect(() => {
    const loadConnectionState = () => {
      const connected = getString(StorageKeys.googleCalendarConnected) === 'true';
      const email = getString(StorageKeys.googleCalendarEmail);
      const lastSync = getString(StorageKeys.googleCalendarLastSync);
      const showEvents = getString(StorageKeys.googleCalendarShowEvents) !== 'false'; // Default true

      setConnection({
        isConnected: connected,
        email,
        lastSync,
        showEvents
      });
    };

    loadConnectionState();

    // Listen for OAuth callback messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'google-calendar-callback' && event.data.success) {
        const { tokens, email } = event.data;

        // Store tokens and connection info
        setString(StorageKeys.googleCalendarTokens, JSON.stringify(tokens));
        setString(StorageKeys.googleCalendarEmail, email);
        setString(StorageKeys.googleCalendarConnected, 'true');
        setString(StorageKeys.googleCalendarLastSync, new Date().toISOString());

        setConnection({
          isConnected: true,
          email,
          lastSync: new Date().toISOString(),
          showEvents: true
        });

        toast.success('Google Calendar connected successfully!');
      }
    };

    // Re-check localStorage when window regains focus (catches popup fallback path)
    // Use a flag to avoid repeated toasts
    let hasShownFocusToast = false;
    const handleFocus = () => {
      if (hasShownFocusToast) return;
      const connected = getString(StorageKeys.googleCalendarConnected) === 'true';
      const alreadyConnected = getString(StorageKeys.googleCalendarLastSync);
      if (connected && !alreadyConnected) {
        hasShownFocusToast = true;
        loadConnectionState();
        toast.success('Google Calendar connected successfully!');
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Get stored tokens
  const getTokens = useCallback((): GoogleCalendarTokens | null => {
    const tokensStr = getString(StorageKeys.googleCalendarTokens);
    if (!tokensStr) return null;
    try {
      return JSON.parse(tokensStr);
    } catch {
      return null;
    }
  }, []);

  // Update stored tokens (for refresh)
  const updateTokens = useCallback((tokens: GoogleCalendarTokens) => {
    setString(StorageKeys.googleCalendarTokens, JSON.stringify(tokens));
  }, []);

  // Connect to Google Calendar
  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/google-calendar/auth-url?userId=default`);
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Open OAuth popup
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      window.open(
        data.authUrl,
        'google-calendar-auth',
        `width=${width},height=${height},left=${left},top=${top},popup=1`
      );
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast.error('Failed to start Google Calendar connection');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect from Google Calendar
  const disconnect = useCallback(async () => {
    setIsLoading(true);
    try {
      const tokens = getTokens();

      await fetch(`${API_BASE}/api/google-calendar/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens })
      });

      // Clear stored data
      remove(StorageKeys.googleCalendarTokens);
      remove(StorageKeys.googleCalendarEmail);
      remove(StorageKeys.googleCalendarConnected);
      remove(StorageKeys.googleCalendarLastSync);

      setConnection({
        isConnected: false,
        email: null,
        lastSync: null,
        showEvents: true
      });
      setEvents([]);

      toast.success('Google Calendar disconnected');
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      toast.error('Failed to disconnect Google Calendar');
    } finally {
      setIsLoading(false);
    }
  }, [getTokens]);

  // Fetch events for a date range
  const fetchEvents = useCallback(async (startDate: string, endDate: string) => {
    const tokens = getTokens();
    if (!tokens) {
      setEvents([]);
      return;
    }

    lastFetchParamsRef.current = { startDate, endDate };
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/google-calendar/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens, startDate, endDate })
      });

      const data = await response.json();

      if (data.error) {
        if (data.needsReauth) {
          // Token expired, need to reconnect
          setConnection(prev => ({ ...prev, isConnected: false }));
          remove(StorageKeys.googleCalendarConnected);
          toast.error('Google Calendar session expired. Please reconnect.');
          return;
        }
        throw new Error(data.error);
      }

      // Update tokens if refreshed
      if (data.tokens) {
        updateTokens(data.tokens);
      }

      setEvents(data.events || []);
      setString(StorageKeys.googleCalendarLastSync, new Date().toISOString());
      setConnection(prev => ({ ...prev, lastSync: new Date().toISOString() }));
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getTokens, updateTokens]);

  // Re-fetch events when user switches back to the HeyMeg tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && lastFetchParamsRef.current) {
        const { startDate, endDate } = lastFetchParamsRef.current;
        fetchEvents(startDate, endDate);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchEvents]);

  // Toggle showing events in calendar
  const toggleShowEvents = useCallback((show: boolean) => {
    setString(StorageKeys.googleCalendarShowEvents, show.toString());
    setConnection(prev => ({ ...prev, showEvents: show }));
  }, []);

  // Refresh connection status
  const refreshConnection = useCallback(async () => {
    const tokens = getTokens();
    if (!tokens) {
      setConnection(prev => ({ ...prev, isConnected: false }));
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/google-calendar/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens })
      });

      const data = await response.json();

      if (data.isConnected) {
        if (data.tokens) {
          updateTokens(data.tokens);
        }
        setConnection(prev => ({
          ...prev,
          isConnected: true,
          email: data.email
        }));
      } else {
        // Token invalid, clear connection
        remove(StorageKeys.googleCalendarConnected);
        setConnection(prev => ({ ...prev, isConnected: false }));
      }
    } catch (error) {
      console.error('Error refreshing Google Calendar connection:', error);
    }
  }, [getTokens, updateTokens]);

  return {
    connection,
    events,
    isLoading,
    connect,
    disconnect,
    fetchEvents,
    toggleShowEvents,
    refreshConnection
  };
};
