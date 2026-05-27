import { useNavigate } from 'react-router-dom';
import { Shield, FileText, ChevronRight } from 'lucide-react';

const LegalSection = () => {
  const navigate = useNavigate();

  return (
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
            Legal
          </h2>
          <p className="text-xs text-[#8B7082]">
            Review our policies and terms
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => navigate('/privacy')}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-[#E8E4E6] hover:border-[#8B7082]/30 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#8B7082]/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#612a4f]" />
            </div>
            <div>
              <p className="font-medium text-[#2d2a26] text-sm">
                Privacy Policy
              </p>
              <p className="text-xs text-[#8B7082]">
                How we collect, use, and protect your data
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8B7082]" />
        </button>

        <button
          onClick={() => navigate('/terms')}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-[#E8E4E6] hover:border-[#8B7082]/30 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#8B7082]/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#612a4f]" />
            </div>
            <div>
              <p className="font-medium text-[#2d2a26] text-sm">
                Terms of Service
              </p>
              <p className="text-xs text-[#8B7082]">
                Rules and guidelines for using HeyMeg
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8B7082]" />
        </button>
      </div>
    </div>
  );
};

export default LegalSection;
