import GoogleCalendarIntegration from "@/components/settings/GoogleCalendarIntegration";

const IntegrationsSection = () => {
  return (
    <div className="space-y-6">
      <div
        className="bg-white/80 rounded-[20px] p-6"
        style={{
          boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
          border: '1px solid rgba(139, 115, 130, 0.06)',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div>
            <h2 className="text-base font-semibold text-[#2d2a26]">
              Integrations
            </h2>
            <p className="text-xs text-[#8B7082]">
              Connect external services
            </p>
          </div>
        </div>

        {/* Google Calendar */}
        <GoogleCalendarIntegration />
      </div>
    </div>
  );
};

export default IntegrationsSection;
