import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar, Check, Loader2, RefreshCw } from 'lucide-react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { formatDistanceToNow } from 'date-fns';

const GoogleCalendarIntegration = () => {
  const {
    connection,
    isLoading,
    connect,
    disconnect,
    toggleShowEvents,
    refreshConnection
  } = useGoogleCalendar();

  // Refresh connection status on mount
  useEffect(() => {
    if (connection.isConnected) {
      refreshConnection();
    }
  }, []);

  const formatLastSync = () => {
    if (!connection.lastSync) return null;
    try {
      return formatDistanceToNow(new Date(connection.lastSync), { addSuffix: true });
    } catch {
      return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-[#E8E4E6] hover:border-[#8B7082]/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-medium text-[#2d2a26] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Google Calendar
          </p>
          {connection.isConnected ? (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Connected
                </span>
              </div>
              {connection.email && (
                <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {connection.email}
                </p>
              )}
              {connection.lastSync && (
                <p className="text-[10px] text-[#8B7082]/70" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Last synced {formatLastSync()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Sync your schedule for better planning
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {connection.isConnected && (
          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Show in calendar
            </span>
            <Switch
              checked={connection.showEvents}
              onCheckedChange={toggleShowEvents}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        )}

        {connection.isConnected ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refreshConnection()}
              disabled={isLoading}
              className="h-9 w-9 p-0 text-[#8B7082] hover:text-[#612a4f] hover:bg-[#612a4f]/5"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              onClick={disconnect}
              disabled={isLoading}
              className="h-9 px-4 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Disconnect'
              )}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={connect}
            disabled={isLoading}
            className="h-9 px-4 rounded-lg border-[#8B7082]/30 text-[#612a4f] hover:bg-[#612a4f]/5 hover:border-[#612a4f]/30"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Connect'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default GoogleCalendarIntegration;
