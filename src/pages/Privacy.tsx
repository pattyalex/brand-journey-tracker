import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: '#f9f7f5', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Hero Header */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #612a4f 0%, #4a3442 40%, #2d2a26 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 20% 80%, rgba(139, 106, 126, 0.3) 0%, transparent 60%),
              radial-gradient(ellipse 40% 60% at 80% 20%, rgba(97, 42, 79, 0.2) 0%, transparent 60%)
            `,
          }}
        />
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors mb-8 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1
            className="text-4xl md:text-5xl text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Privacy Policy
          </h1>
          <p className="text-white/50 text-sm">
            Effective Date: February 12, 2026 &nbsp;|&nbsp; Last Updated: February 12, 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-10 md:py-14">
        <div className="space-y-6">

          {/* Section 1 */}
          <section
            className="bg-white/80 rounded-[20px] p-6 md:p-8"
            style={{
              boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
              border: '1px solid rgba(139, 115, 130, 0.06)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)' }}
              >
                1
              </span>
              <h2
                className="text-xl text-[#2d2a26]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Introduction
              </h2>
            </div>
            <div className="space-y-4 text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                Welcome to HeyMeg ("we," "us," "our"). HeyMeg is a content creation workspace that helps content creators organize their work, write scripts, plan content, schedule via a content calendar, manage brand deals, and leverage built-in AI features to enhance their creative workflow.
              </p>
              <p>
                This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our website, applications, and services (collectively, the "Service"). By accessing or using HeyMeg, you agree to the practices described in this policy.
              </p>
              <p>
                We are based in the United States and operate under applicable U.S. federal and state laws. We also comply with the European Union General Data Protection Regulation ("GDPR") and the California Consumer Privacy Act ("CCPA") where applicable.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section
            className="bg-white/80 rounded-[20px] p-6 md:p-8"
            style={{
              boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
              border: '1px solid rgba(139, 115, 130, 0.06)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)' }}
              >
                2
              </span>
              <h2
                className="text-xl text-[#2d2a26]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Children's Information
              </h2>
            </div>
            <div className="space-y-4 text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                Our Service is intended for general audiences and is not directed at children. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child without legally valid parental consent, we will take reasonable steps to delete that information as promptly as possible.
              </p>
              <p>
                If you believe that a child has provided us with personal information without appropriate consent, please contact us at the address listed in Section 13 so that we can take the necessary steps to remove such information.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section
            className="bg-white/80 rounded-[20px] p-6 md:p-8"
            style={{
              boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
              border: '1px solid rgba(139, 115, 130, 0.06)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)' }}
              >
                3
              </span>
              <h2
                className="text-xl text-[#2d2a26]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Information We Collect
              </h2>
            </div>
            <div className="space-y-6 text-[15px] leading-relaxed text-[#4d3e48]">
              <div>
                <h3 className="font-semibold text-[#2d2a26] mb-2">3.1 Information You Provide to Us</h3>
                <ul className="space-y-2 ml-1">
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Account Information:</strong> When you create an account, we collect your name, email address, password, and any other information you provide during registration or in your account profile.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Content You Create:</strong> Content you upload, including but not limited to content entries, calendar data, marketing materials, scripts, and AI-generated inputs and outputs.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Google Calendar Data:</strong> If you choose to connect your Google Calendar, we receive relevant calendar event data in accordance with Google's User Data Policy.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Communications:</strong> Any support requests, feedback, or messages you provide to us.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[#2d2a26] mb-2">3.2 Information Collected Automatically</h3>
                <ul className="space-y-2 ml-1">
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Device & Usage Data:</strong> We collect certain browser type, operating system, device information, visit timestamps, and activity. This includes IP addresses, log data, and request details.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Cookies & Similar Technologies:</strong> We use cookies (such as session tokens) for authentication, maintaining sessions, and ensuring the Service functions properly. These are strictly functional and are not used for advertising or third-party tracking.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[#2d2a26] mb-2">3.3 Information from Third Parties</h3>
                <ul className="space-y-2 ml-1">
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Payment Processors:</strong> We use Stripe for payment processing. We do not store your full credit card number or billing details. Stripe may collect and retain transaction history and a digital fingerprint for fraud prevention and payment-keeping purposes.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section
            className="bg-white/80 rounded-[20px] p-6 md:p-8"
            style={{
              boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
              border: '1px solid rgba(139, 115, 130, 0.06)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)' }}
              >
                4
              </span>
              <h2
                className="text-xl text-[#2d2a26]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                How We Use Your Information
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-[#4d3e48]">
              <p className="mb-3">We use the information we collect for the following purposes:</p>
              <ul className="space-y-2 ml-1">
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span><strong>Provide and Improve the Service:</strong> Deliver, maintain, and sync your data across the platform.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span><strong>Analyze and Diagnose:</strong> Diagnose issues, develop new features, and improve existing ones.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span><strong>Power AI Features:</strong> AI-assisted tools provide content suggestions, personalized recommendations, and smart assistance powered by AI models. Unless otherwise specified, AI suggestions are generated by us.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span><strong>Communicate with You:</strong> Send time-relevant updates, security alerts, and respond to your inquiries.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span><strong>Ensure Security:</strong> Detect and prevent fraud, unauthorized access, and protect the rights and safety of our users.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span><strong>Legal Obligations:</strong> Fulfill lawful requirements and enforce our terms.</span>
                </li>
              </ul>
              <div
                className="mt-5 p-4 rounded-xl"
                style={{
                  background: 'linear-gradient(145deg, rgba(139, 106, 126, 0.08) 0%, rgba(74, 52, 66, 0.05) 100%)',
                  border: '1px solid rgba(139, 115, 130, 0.1)',
                }}
              >
                <p className="text-sm text-[#8B7082]">
                  <strong>For users located in the European Economic Area (EEA) or the United Kingdom:</strong> We process your data on the following legal grounds: performance of a contract, legitimate interests (which are not overridden by your fundamental rights and freedoms), consent (which you may withdraw at any time), and legal obligations.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section
            className="bg-white/80 rounded-[20px] p-6 md:p-8"
            style={{
              boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
              border: '1px solid rgba(139, 115, 130, 0.06)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)' }}
              >
                5
              </span>
              <h2
                className="text-xl text-[#2d2a26]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Sharing Your Information
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-[#4d3e48]">
              <p className="mb-3">We do not sell your personal information. We may share your data in the following circumstances:</p>
              <ul className="space-y-2 ml-1">
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span><strong>Service Providers:</strong> We share data with trusted third-party providers (e.g., hosting, payment processing, analytics) who process it on our behalf and are contractually obligated to protect it. Our infrastructure evolves; this Privacy Policy is updated in good faith to reflect current practices.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span><strong>Legal Requirements:</strong> We may disclose information if required by law, regulation, or legal process, or to protect the rights, property, or safety of HeyMeg or our users.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you via notice on our Service before your information becomes subject to a different privacy policy.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section
            className="bg-white/80 rounded-[20px] p-6 md:p-8"
            style={{
              boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
              border: '1px solid rgba(139, 115, 130, 0.06)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)' }}
              >
                6
              </span>
              <h2
                className="text-xl text-[#2d2a26]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Data Retention
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                We retain your personal information as long as your account is active or as needed to provide you the Service. If you delete your account, we will delete or anonymize your data within 30 days, except where retention is required for legal, tax, or compliance purposes (e.g., financial logs, aggregated analytics). We use commercially reasonable means to ensure timely and thorough data deletion.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section
            className="bg-white/80 rounded-[20px] p-6 md:p-8"
            style={{
              boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
              border: '1px solid rgba(139, 115, 130, 0.06)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)' }}
              >
                7
              </span>
              <h2
                className="text-xl text-[#2d2a26]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Data Security
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure transmission protocols, and periodic access reviews. However, no method of electronic storage or transmission is 100% secure, and while we strive to use commercially reasonable means to protect your data, we cannot guarantee its absolute security.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section
            className="bg-white/80 rounded-[20px] p-6 md:p-8"
            style={{
              boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
              border: '1px solid rgba(139, 115, 130, 0.06)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)' }}
              >
                8
              </span>
              <h2
                className="text-xl text-[#2d2a26]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                International Data Transfers
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                Your data may be processed and stored on infrastructure provided by Vercel (hosting and deployment) and other third-party services located outside your country of residence. If you are located in the EEA or the UK, we ensure that appropriate safeguards are in place for international transfers, including Standard Contractual Clauses (SCCs). Regardless of where your data is processed, we apply the same protections described in this policy.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section
            className="bg-white/80 rounded-[20px] p-6 md:p-8"
            style={{
              boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
              border: '1px solid rgba(139, 115, 130, 0.06)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)' }}
              >
                9
              </span>
              <h2
                className="text-xl text-[#2d2a26]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Your Rights
              </h2>
            </div>
            <div className="space-y-5 text-[15px] leading-relaxed text-[#4d3e48]">
              <p>Depending on your jurisdiction, you may have the following rights regarding your personal information:</p>

              <div>
                <h3 className="font-semibold text-[#2d2a26] mb-2">EEA/UK Residents (GDPR)</h3>
                <ul className="space-y-1.5 ml-1">
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Right to Erasure:</strong> Request deletion of your personal data.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Right to Restrict Processing:</strong> Request limitation of how we use your data.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Right to Data Portability:</strong> Receive your data in a structured, commonly used format.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Right to Object:</strong> Object to processing based on legitimate interests.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Right to Lodge a Complaint:</strong> File a complaint with your local supervisory authority.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[#2d2a26] mb-2">California Residents (CCPA)</h3>
                <ul className="space-y-1.5 ml-1">
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Right to Know:</strong> Request details about the personal information we have collected about you in the past 12 months (note: we do not sell personal information and do not discriminate against users who exercise their rights).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Right to Delete:</strong> Request deletion of your personal information.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Right to Opt-Out:</strong> Opt out of the sale of personal information (we do not sell your data).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                    <span><strong>Right to Non-Discrimination:</strong> Exercise your rights without fear of discriminatory treatment.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 10 */}
          <section
            className="bg-white/80 rounded-[20px] p-6 md:p-8"
            style={{
              boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
              border: '1px solid rgba(139, 115, 130, 0.06)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)' }}
              >
                10
              </span>
              <h2
                className="text-xl text-[#2d2a26]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Cookies and Tracking Technologies
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                We use cookies and similar technologies strictly for functional purposes, such as session management and authentication. We do not use advertising cookies or third-party tracking cookies. You can control cookies through your browser settings, but disabling functional cookies may affect the performance of the Service.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section
            className="bg-white/80 rounded-[20px] p-6 md:p-8"
            style={{
              boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
              border: '1px solid rgba(139, 115, 130, 0.06)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)' }}
              >
                11
              </span>
              <h2
                className="text-xl text-[#2d2a26]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Third-Party Links
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of those external sites. We encourage you to review the privacy policies of any third-party services you access through our platform before providing them with your personal information.
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section
            className="bg-white/80 rounded-[20px] p-6 md:p-8"
            style={{
              boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
              border: '1px solid rgba(139, 115, 130, 0.06)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)' }}
              >
                12
              </span>
              <h2
                className="text-xl text-[#2d2a26]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Changes to This Privacy Policy
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                We may update this Privacy Policy from time to time. For significant changes, we will notify you by posting a prominent notice on our Service or by sending you a notification. Your continued use of the Service after changes constitutes your acceptance of the updated policy. We encourage you to review this page periodically.
              </p>
            </div>
          </section>

          {/* Section 13 */}
          <section
            className="bg-white/80 rounded-[20px] p-6 md:p-8"
            style={{
              boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
              border: '1px solid rgba(139, 115, 130, 0.08)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)' }}
              >
                13
              </span>
              <h2
                className="text-xl text-[#2d2a26]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Contact Us
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-[#4d3e48]">
              <p className="mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div
                className="p-5 rounded-xl"
                style={{
                  background: 'linear-gradient(145deg, rgba(97, 42, 79, 0.06) 0%, rgba(139, 106, 126, 0.04) 100%)',
                  border: '1px solid rgba(139, 115, 130, 0.1)',
                }}
              >
                <p className="font-semibold text-[#2d2a26] mb-2">HeyMeg</p>
                <p>
                  Email:{' '}
                  <a href="mailto:hello@heymeg.ai" className="font-medium hover:underline" style={{ color: '#612a4f' }}>
                    hello@heymeg.ai
                  </a>
                </p>
                <p>
                  Website:{' '}
                  <a href="https://www.heymeg.ai" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline" style={{ color: '#612a4f' }}>
                    www.heymeg.ai
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <div
            className="p-5 rounded-xl text-center"
            style={{
              background: 'linear-gradient(145deg, rgba(97, 42, 79, 0.06) 0%, rgba(139, 106, 126, 0.03) 100%)',
              border: '1px solid rgba(139, 115, 130, 0.08)',
            }}
          >
            <p className="text-sm text-[#8B7082]">
              <strong>Governing Law:</strong> This Privacy Policy is governed by and construed in accordance with the laws of the State of Florida, United States, without regard to its conflict of law principles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
