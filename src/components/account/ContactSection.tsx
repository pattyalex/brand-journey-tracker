import { Mail } from 'lucide-react';

const ContactSection = () => {
  return (
    <div
      className="bg-white/80 rounded-[20px] p-6"
      style={{ boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)', border: '1px solid rgba(139, 115, 130, 0.06)' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-base font-semibold text-[#2d2a26]">Contact Us</h2>
      </div>
      <div className="text-center py-6 space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#612a4f]/10 flex items-center justify-center mx-auto">
          <Mail className="w-6 h-6 text-[#612a4f]" />
        </div>
        <p className="text-sm text-[#8B7082] leading-relaxed">
          Have a question, feedback, or just want to say hi?<br />
          Drop us an email and we'll get back to you as soon as possible.
        </p>
        <p className="text-[#612a4f] font-semibold text-base">contact@heymeg.ai</p>
      </div>
    </div>
  );
};

export default ContactSection;
