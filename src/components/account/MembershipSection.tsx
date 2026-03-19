import { Button } from "@/components/ui/button";
import { CreditCard, Crown, Check, FileText } from 'lucide-react';

const MembershipSection = () => {
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
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              Membership
            </h2>
            <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Manage your subscription
            </p>
          </div>
        </div>

        {/* Trial Banner */}
        <div
          className="p-4 rounded-xl mb-6 flex items-center justify-between"
          style={{
            background: 'linear-gradient(145deg, rgba(97, 42, 79, 0.08) 0%, rgba(74, 52, 66, 0.05) 100%)',
            border: '1px solid rgba(97, 42, 79, 0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#612a4f] animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-[#612a4f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Free Trial Active
              </p>
              <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                14-day trial ends on May 30, 2025
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 rounded-lg text-xs border-red-200 text-red-500 hover:bg-red-50"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Cancel Trial
          </Button>
        </div>

        {/* Current Plan */}
        <div className="p-5 rounded-xl bg-[#8B7082]/5 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Premium Monthly
              </p>
              <p className="text-2xl font-semibold text-[#612a4f] mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                $17<span className="text-sm font-normal text-[#8B7082]">/month</span>
              </p>
              <p className="text-xs text-[#8B7082] mt-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Next billing: May 30, 2025
              </p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'linear-gradient(145deg, #612a4f 0%, #4a3442 100%)',
                color: 'white',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Current Plan
            </span>
          </div>
        </div>

        {/* Plan Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border-2 border-[#612a4f]/20 bg-[#612a4f]/5">
            <p className="text-sm font-medium text-[#2d2a26] mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Monthly
            </p>
            <p className="text-xl font-semibold text-[#612a4f]" style={{ fontFamily: "'Playfair Display', serif" }}>
              $17<span className="text-xs font-normal text-[#8B7082]">/mo</span>
            </p>
            <ul className="mt-3 space-y-2">
              {['Unlimited projects', 'Advanced features', 'Priority support'].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  <Check className="w-3 h-3 text-[#612a4f]" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-xl border border-[#E8E4E6] hover:border-[#8B7082]/30 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Annual
              </p>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                Save 18%
              </span>
            </div>
            <p className="text-xl font-semibold text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif" }}>
              $14<span className="text-xs font-normal text-[#8B7082]">/mo</span>
            </p>
            <p className="text-[10px] text-[#8B7082] mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Billed annually ($168)
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 rounded-lg text-xs border-[#8B7082]/30 text-[#612a4f] hover:bg-[#612a4f]/5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Switch to Annual
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div
        className="bg-white/80 rounded-[20px] p-6"
        style={{
          boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
          border: '1px solid rgba(139, 115, 130, 0.06)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#8B7082]/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-[#612a4f]" />
            </div>
            <h3 className="text-sm font-medium text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Payment Method
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs text-[#612a4f] hover:bg-[#612a4f]/5"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Edit
          </Button>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl border border-[#E8E4E6]">
          <div className="w-12 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">VISA</span>
          </div>
          <div>
            <p className="text-sm font-medium text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242
            </p>
            <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Expires 05/28
            </p>
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div
        className="bg-white/80 rounded-[20px] p-6"
        style={{
          boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
          border: '1px solid rgba(139, 115, 130, 0.06)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#8B7082]/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#612a4f]" />
            </div>
            <h3 className="text-sm font-medium text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Invoices
            </h3>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { date: 'Apr 30, 2025', amount: '$17.00', status: 'Paid' },
            { date: 'Mar 30, 2025', amount: '$17.00', status: 'Paid' },
          ].map((invoice, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#8B7082]/5">
              <div>
                <p className="text-sm text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {invoice.date}
                </p>
                <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {invoice.amount}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-green-100 text-green-700">
                  {invoice.status}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-[#612a4f]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembershipSection;
