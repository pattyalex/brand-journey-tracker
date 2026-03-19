import { Calendar } from 'lucide-react';
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
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)',
              boxShadow: '0 4px 12px rgba(107, 74, 94, 0.2)',
            }}
          >
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              Integrations
            </h2>
            <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
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
