import { Button } from "@/components/ui/button";
import { Download, Calendar, AlertTriangle } from 'lucide-react';

interface DataSectionProps {
  handleExportAllData: () => void;
  handleDownloadCalendar: () => void;
}

const DataSection = ({ handleExportAllData, handleDownloadCalendar }: DataSectionProps) => {
  return (
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
          <Download className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
            Data
          </h2>
          <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Export and download your data
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl border border-[#E8E4E6] hover:border-[#8B7082]/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#8B7082]/10 flex items-center justify-center">
              <Download className="w-4 h-4 text-[#612a4f]" />
            </div>
            <div>
              <p className="font-medium text-[#2d2a26] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Export All Data
              </p>
              <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Download all your account data as JSON
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="h-9 px-4 rounded-lg border-[#8B7082]/30 text-[#612a4f] hover:bg-[#612a4f]/5 hover:border-[#612a4f]/30"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            onClick={handleExportAllData}
          >
            Export
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-[#E8E4E6] hover:border-[#8B7082]/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#8B7082]/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#612a4f]" />
            </div>
            <div>
              <p className="font-medium text-[#2d2a26] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Download Content Calendar
              </p>
              <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Export your content calendar as CSV or iCal
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="h-9 px-4 rounded-lg border-[#8B7082]/30 text-[#612a4f] hover:bg-[#612a4f]/5 hover:border-[#612a4f]/30"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            onClick={handleDownloadCalendar}
          >
            Download
          </Button>
        </div>
      </div>

      <div
        className="mt-6 p-4 rounded-xl flex items-start gap-3"
        style={{
          background: 'linear-gradient(145deg, rgba(139, 106, 126, 0.08) 0%, rgba(74, 52, 66, 0.05) 100%)',
          border: '1px solid rgba(139, 115, 130, 0.1)',
        }}
      >
        <AlertTriangle className="w-4 h-4 text-[#612a4f] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Exported data may contain sensitive information. Please store it securely and do not share with others.
        </p>
      </div>
    </div>
  );
};

export default DataSection;
