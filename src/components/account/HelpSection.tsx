import { HelpCircle, ChevronDown } from 'lucide-react';

interface HelpSectionProps {
  faqs: { question: string; answer: string }[];
  expandedFaq: number | null;
  setExpandedFaq: (v: number | null) => void;
}

const HelpSection = ({ faqs, expandedFaq, setExpandedFaq }: HelpSectionProps) => {
  return (
    <div
      className="bg-white/80 rounded-[20px] p-6"
      style={{ boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)', border: '1px solid rgba(139, 115, 130, 0.06)' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)', boxShadow: '0 4px 12px rgba(107, 74, 94, 0.2)' }}>
          <HelpCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>Frequently Asked Questions</h2>
          <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Quick answers to common questions</p>
        </div>
      </div>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`rounded-xl border transition-all ${expandedFaq === index ? 'border-[#612a4f]/20 bg-[#612a4f]/5' : 'border-[#E8E4E6] hover:border-[#8B7082]/30'}`}
          >
            <button
              type="button"
              onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className={`text-sm font-medium ${expandedFaq === index ? 'text-[#612a4f]' : 'text-[#2d2a26]'}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>{faq.question}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedFaq === index ? 'rotate-180 text-[#612a4f]' : 'text-[#8B7082]'}`} />
            </button>
            {expandedFaq === index && (
              <div className="px-4 pb-4">
                <p className="text-sm text-[#8B7082] leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpSection;
