import { MessageCircle, Mail } from 'lucide-react';

const ContactSection = () => {
  return (
    <div
      className="bg-white/80 rounded-[20px] p-6"
      style={{ boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)', border: '1px solid rgba(139, 115, 130, 0.06)' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)', boxShadow: '0 4px 12px rgba(107, 74, 94, 0.2)' }}>
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>Contact Us</h2>
      </div>
      <div className="text-center py-6 space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#612a4f]/10 flex items-center justify-center mx-auto">
          <Mail className="w-6 h-6 text-[#612a4f]" />
        </div>
        <p className="text-sm text-[#8B7082] leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Have a question, feedback, or just want to say hi?<br />
          Drop us an email and we'll get back to you as soon as possible.
        </p>
        <p className="text-[#612a4f] font-semibold text-base" style={{ fontFamily: "'DM Sans', sans-serif" }}>contact@heymeg.ai</p>
      </div>
    </div>
  );
};

export default ContactSection;
