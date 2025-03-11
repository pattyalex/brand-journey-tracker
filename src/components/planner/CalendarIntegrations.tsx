
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Share, Download, Loader2 } from "lucide-react";
import { CalendarIntegration } from "@/types/planner";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CalendarIntegrationsProps {
  integrations: CalendarIntegration[];
  onConnect: (type: CalendarIntegration["type"]) => Promise<void>;
  onDisconnect: (type: CalendarIntegration["type"]) => Promise<void>;
  onExport: (type: "pdf" | "ical") => Promise<void>;
}

export const CalendarIntegrations = ({
  integrations,
  onConnect,
  onDisconnect,
  onExport,
}: CalendarIntegrationsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<CalendarIntegration["type"] | null>(null);
  const [exportLoading, setExportLoading] = useState<"pdf" | "ical" | null>(null);
  const { toast } = useToast();

  const handleConnect = async (type: CalendarIntegration["type"]) => {
    setLoading(type);
    try {
      await onConnect(type);
      toast({
        title: "Calendar connected",
        description: `Successfully connected to ${type} calendar`,
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: `Failed to connect to ${type} calendar. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (type: CalendarIntegration["type"]) => {
    setLoading(type);
    try {
      await onDisconnect(type);
      toast({
        title: "Calendar disconnected",
        description: `Successfully disconnected from ${type} calendar`,
      });
    } catch (error) {
      toast({
        title: "Disconnection failed",
        description: `Failed to disconnect from ${type} calendar. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleExport = async (type: "pdf" | "ical") => {
    setExportLoading(type);
    try {
      await onExport(type);
      toast({
        title: "Export successful",
        description: `Successfully exported calendar as ${type === "pdf" ? "PDF" : "iCal file"}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: `Failed to export calendar. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Calendar className="h-4 w-4" />
          <span>Calendar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Calendar Integrations</DialogTitle>
          <DialogDescription>
            Connect to external calendars or export your schedule.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Calendar Services</h3>
            {integrations.map((integration) => (
              <div key={integration.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="capitalize">{integration.type} Calendar</span>
                </div>
                <Button
                  variant={integration.connected ? "outline" : "default"}
                  size="sm"
                  onClick={() => integration.connected ? handleDisconnect(integration.type) : handleConnect(integration.type)}
                  disabled={loading === integration.type}
                >
                  {loading === integration.type ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : integration.connected ? (
                    "Disconnect"
                  ) : (
                    "Connect"
                  )}
                </Button>
              </div>
            ))}
            
            <Alert className="mt-4">
              <AlertDescription>
                Note: When you connect a calendar, your events will be synced between this planner and your calendar account.
              </AlertDescription>
            </Alert>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Export Calendar</h3>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => handleExport("pdf")}
                disabled={exportLoading === "pdf"}
              >
                {exportLoading === "pdf" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>Export as PDF</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => handleExport("ical")}
                disabled={exportLoading === "ical"}
              >
                {exportLoading === "ical" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Share className="h-4 w-4" />
                )}
                <span>Export as iCal</span>
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarIntegrations;
