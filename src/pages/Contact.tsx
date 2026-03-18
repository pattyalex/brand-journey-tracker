import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

const Contact = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20" style={{ background: '#faf8f9', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: '#8b7a85' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#612a4f')}
        onMouseLeave={e => (e.currentTarget.style.color = '#8b7a85')}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="w-full max-w-md">

        {/* Label */}
        <span className="block text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#8b7a85' }}>
          Contact
        </span>

        {/* Heading */}
        <h1 className="mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 500, color: '#2d2a26', lineHeight: 1.1 }}>
          Say hello.<br />
          <em style={{ color: '#8B7082', fontStyle: 'italic' }}>We're listening.</em>
        </h1>

        {/* Divider */}
        <div className="my-6" style={{ width: '40px', height: '2px', background: 'rgba(97,42,79,0.2)' }} />

        {/* Subtext */}
        <p className="mb-10" style={{ fontSize: '16px', color: '#8b7a85', lineHeight: 1.75 }}>
          Have a question or just want to reach out? Email us.
        </p>

        {/* Email card */}
        <a
          href="mailto:contact@heymeg.ai"
          className="flex items-center gap-5 w-full rounded-2xl p-6 transition-all group"
          style={{ background: '#ffffff', border: '1px solid rgba(97,42,79,0.1)', boxShadow: '0 4px 24px rgba(97,42,79,0.06)', textDecoration: 'none' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 40px rgba(97,42,79,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(97,42,79,0.2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(97,42,79,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(97,42,79,0.1)'; }}
        >
          <div className="flex items-center justify-center flex-shrink-0 rounded-xl" style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #612a4f, #9B5080)' }}>
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: '#8b7a85' }}>Email us at</p>
            <p className="font-semibold" style={{ color: '#612a4f', fontSize: '16px' }}>contact@heymeg.ai</p>
          </div>
          <ArrowLeft className="w-4 h-4 ml-auto rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#612a4f' }} />
        </a>

      </div>
    </div>
  );
};

export default Contact;
