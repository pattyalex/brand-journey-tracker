import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
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
            Terms of Service
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
                Acceptance of Terms
              </h2>
            </div>
            <div className="space-y-4 text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                Welcome to HeyMeg ("we," "us," "our"). These Terms of Service ("Terms") govern your access to and use of the HeyMeg website at www.heymeg.ai, our applications, and all related services (collectively, the "Service").
              </p>
              <p>
                By creating an account, accessing, or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
              </p>
              <p>
                We may update these Terms from time to time. If we make material changes, we will notify you by posting the updated Terms on our website and updating the "Last Updated" date above. Your continued use of the Service after such changes constitutes your acceptance of the revised Terms.
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
                Description of Service
              </h2>
            </div>
            <div className="space-y-4 text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                HeyMeg is a content creation workspace designed for content creators. The Service allows users to organize their work, write scripts, plan and schedule content using a content calendar, manage brand deals, develop marketing strategies, and use built-in AI-powered tools to enhance their creative workflow.
              </p>
              <p>
                We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice. We will make reasonable efforts to provide advance notice of significant changes that may affect your use of the Service.
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
                Eligibility
              </h2>
            </div>
            <div className="space-y-4 text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                The Service is intended for general audiences and is not directed at children. By using the Service, you represent that you have the legal capacity to enter into a binding agreement in your jurisdiction.
              </p>
              <p>
                If you are using the Service on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.
              </p>
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
                Account Registration
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-[#4d3e48]">
              <p className="mb-3">To access certain features of the Service, you must create an account. When you do, you agree to:</p>
              <ul className="space-y-2 ml-1">
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span>Provide accurate, current, and complete information during registration.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span>Maintain and promptly update your account information to keep it accurate and complete.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span>Keep your login credentials secure and confidential.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span>Accept responsibility for all activities that occur under your account.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span>Notify us immediately of any unauthorized use of your account or any other breach of security.</span>
                </li>
              </ul>
              <p className="mt-4">
                You are responsible for any loss or damage arising from your failure to protect your account credentials.
              </p>
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
                Free Trial and Plans
              </h2>
            </div>
            <div className="space-y-5 text-[15px] leading-relaxed text-[#4d3e48]">
              <div>
                <h3 className="font-semibold text-[#2d2a26] mb-2">5.1 Free Trial</h3>
                <p>
                  HeyMeg offers a 14-day free trial for new users. During the trial period, you will have access to the Service's features as described on our website. You will be required to provide valid payment information to start the free trial. Your payment method will not be charged during the trial period.
                </p>
                <p className="mt-3">
                  At the end of the 14-day trial period, your payment method will be automatically charged for the subscription plan you selected unless you cancel before the trial ends. You may cancel at any time during the trial period through your account settings, and you will not be charged.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#2d2a26] mb-2">5.2 Paid Plans</h3>
                <p>
                  HeyMeg offers monthly and annual subscription plans. Billing occurs on a recurring basis. Each billing cycle begins on the date of purchase.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#2d2a26] mb-2">5.3 Payment</h3>
                <p>
                  All payments are processed through Stripe, a third-party payment processor. Charges are applied to your chosen payment method at the applicable rate. All prices are stated in U.S. dollars unless otherwise specified. Applicable taxes may apply.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#2d2a26] mb-2">5.4 Price Changes</h3>
                <p>
                  We reserve the right to change our pricing. We will provide at least 30 days' notice before any price changes take effect for your next billing cycle. We encourage you to fully evaluate the Service during your trial period.
                </p>
              </div>
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
                Cancellation and Refunds
              </h2>
            </div>
            <div className="space-y-4 text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                <strong>6.1 Cancellation.</strong> You may cancel your subscription at any time. Upon cancellation, you will retain access to the Service until the end of your current billing period. Cancellations are non-reversible and are limited to non-refundable terms.
              </p>
              <p>
                <strong>6.2 Refunds.</strong> Because we encourage you to fully evaluate the Service during the free trial, unused portions of paid subscriptions are generally non-refundable. We do not issue refunds for downgrades. In exceptional circumstances, refund requests may be considered on a case-by-case basis. To request a refund, please contact us.
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
                Content and Intellectual Property
              </h2>
            </div>
            <div className="space-y-5 text-[15px] leading-relaxed text-[#4d3e48]">
              <div>
                <h3 className="font-semibold text-[#2d2a26] mb-2">7.1 Ownership</h3>
                <p>
                  You retain all ownership rights to the content you upload or create within the Service. This includes but is not limited to scripts, calendar entries, marketing materials, and any other content you produce. We claim no intellectual property rights over your content.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#2d2a26] mb-2">7.2 License to HeyMeg</h3>
                <p>
                  By using the Service, you grant HeyMeg a non-exclusive, worldwide, royalty-free license to host, display, reproduce, and deliver your content for the purpose of operating and providing the Service. This license exists only as long as your account is active.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#2d2a26] mb-2">7.3 AI-Generated Content</h3>
                <p>
                  The Service includes AI-assisted tools that provide suggestions and deliverables. You retain full permission to use, edit, and publish AI-generated content. However, you acknowledge that AI-generated content should always be reviewed for suitability and accuracy before use. You are responsible for ensuring your content complies with applicable laws and regulations.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#2d2a26] mb-2">7.4 Data Export</h3>
                <p>
                  You may export Your Content at any time while your account is active. After cancellation or termination, you will have 30 days to export Your Content. After that 30-day window, we may permanently delete Your Content.
                </p>
              </div>
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
                Acceptable Use
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-[#4d3e48]">
              <p className="mb-3">You agree to use the Service only for lawful purposes and in accordance with these Terms. You may not:</p>
              <ul className="space-y-2 ml-1">
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span>Use the Service to transmit, distribute, or store material that is harmful, defamatory, obscene, or otherwise objectionable.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span>Attempt to gain unauthorized access to any part of the Service, its systems, or networks.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span>Interfere with or disrupt the Service infrastructure or overburden or impair its performance.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span>Use automated means (such as scrapers, crawlers, or bots) to access the Service without prior written permission.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span>Reverse engineer, decompile, or disassemble any part of the Service.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#8b6a7e] mt-1.5 flex-shrink-0">&#8226;</span>
                  <span>Resell, sublicense, or commercially exploit the Service in any manner not expressly authorized.</span>
                </li>
              </ul>
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
                AI Features and Limitations
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                You acknowledge that AI-generated content, including suggestions and recommendations, should be reviewed, edited, and verified for accuracy and suitability before use. AI outputs are provided as original creative assistance and do not constitute professional, legal, or financial advice. You are solely responsible for how you use AI-generated content. While AI features are available as part of the Service, no guarantee is made that they will be permanently available or error-free.
              </p>
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
                Trademarks and Third-Party Services
              </h2>
            </div>
            <div className="space-y-4 text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                HeyMeg and its logos, trademarks, and service marks ("Marks") are the property of HeyMeg. You may not use our Marks without prior written permission.
              </p>
              <p>
                The Service may integrate with or contain links to third-party services, including Google Calendar and Stripe. Your use of such third-party services is governed by their respective terms and privacy policies. We are not responsible for the content, practices, or availability of third-party services.
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
                Privacy
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                Your use of the Service is also governed by our{' '}
                <a href="/privacy" className="font-medium hover:underline" style={{ color: '#612a4f' }}>
                  Privacy Policy
                </a>
                , which explains how we collect, use, and protect your personal information. By using the Service, you consent to the practices described in the Privacy Policy.
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
                Suspension and Termination
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                We may suspend or terminate your access to the Service at any time if you violate these Terms or engage in conduct that we determine, in our sole discretion, is harmful to the Service or other users. Upon termination, the provisions of these Terms that by their nature should survive (including but not limited to Sections on intellectual property, disclaimers, limitation of liability, indemnification, and governing law) shall remain in full force and effect. Any available remedies shall not be considered an exclusive remedy and shall operate independently.
              </p>
            </div>
          </section>

          {/* Section 13 - Disclaimer */}
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
                Disclaimers
              </h2>
            </div>
            <div
              className="p-5 rounded-xl text-[14px] leading-relaxed"
              style={{
                background: 'linear-gradient(145deg, rgba(139, 106, 126, 0.08) 0%, rgba(74, 52, 66, 0.05) 100%)',
                border: '1px solid rgba(139, 115, 130, 0.1)',
                color: '#4d3e48',
              }}
            >
              <p className="uppercase font-semibold text-[13px] tracking-wide mb-3" style={{ color: '#612a4f' }}>
                Important Legal Notice
              </p>
              <p>
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
              </p>
              <p className="mt-3">
                We do not warrant that the Service will be uninterrupted, error-free, or completely reliable. Your use of the Service is at your own risk.
              </p>
            </div>
          </section>

          {/* Section 14 - Limitation of Liability */}
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
                14
              </span>
              <h2
                className="text-xl text-[#2d2a26]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Limitation of Liability
              </h2>
            </div>
            <div
              className="p-5 rounded-xl text-[14px] leading-relaxed"
              style={{
                background: 'linear-gradient(145deg, rgba(139, 106, 126, 0.08) 0%, rgba(74, 52, 66, 0.05) 100%)',
                border: '1px solid rgba(139, 115, 130, 0.1)',
                color: '#4d3e48',
              }}
            >
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL HEYMEG, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
              </p>
              <p className="mt-3">
                HEYMEG'S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING UNDER THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU HAVE PAID TO HEYMEG IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
              </p>
            </div>
          </section>

          {/* Section 15 */}
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
                15
              </span>
              <h2
                className="text-xl text-[#2d2a26]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Indemnification
              </h2>
            </div>
            <div className="text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                You agree to indemnify, defend, and hold harmless HeyMeg, its officers, directors, employees, agents, and licensors from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to your use of the Service, your violation of these Terms, or your infringement of any third-party rights. To the fullest extent permitted by law, this obligation survives termination of your account.
              </p>
            </div>
          </section>

          {/* Section 16 */}
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
                16
              </span>
              <h2
                className="text-xl text-[#2d2a26]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Dispute Resolution
              </h2>
            </div>
            <div className="space-y-4 text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                <strong>16.1 Informal Resolution.</strong> Most disputes can be resolved through good-faith communication. If you have a concern, please contact us first so we may attempt to resolve it informally.
              </p>
              <p>
                <strong>16.2 Governing Law.</strong> These Terms are governed by and construed in accordance with the laws of the State of Florida, United States, without regard to its conflict of law principles.
              </p>
              <p>
                <strong>16.3 Jurisdiction.</strong> If informal resolution is unsuccessful, any disputes shall be resolved in the courts located in the State of Florida.
              </p>
            </div>
          </section>

          {/* Section 17 */}
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
                17
              </span>
              <h2
                className="text-xl text-[#2d2a26]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                General Provisions
              </h2>
            </div>
            <div className="space-y-4 text-[15px] leading-relaxed text-[#4d3e48]">
              <p>
                <strong>17.1 Entire Agreement.</strong> These Terms, together with the Privacy Policy, constitute the entire agreement between you and HeyMeg regarding your use of the Service and supersede all prior agreements.
              </p>
              <p>
                <strong>17.2 Severability.</strong> If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>
              <p>
                <strong>17.3 Waiver.</strong> Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.
              </p>
              <p>
                <strong>17.4 Assignment.</strong> You may not assign or transfer your rights under these Terms without our prior written consent. We may assign our rights at any time.
              </p>
              <p>
                <strong>17.5 Force Majeure.</strong> HeyMeg shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to natural disasters, internet outages, cyberattacks, or acts of government.
              </p>
            </div>
          </section>

          {/* Section 18 */}
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
                18
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
                If you have questions or concerns about these Terms of Service, please contact us:
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

          {/* Governing Law footer */}
          <div
            className="p-5 rounded-xl text-center"
            style={{
              background: 'linear-gradient(145deg, rgba(97, 42, 79, 0.06) 0%, rgba(139, 106, 126, 0.03) 100%)',
              border: '1px solid rgba(139, 115, 130, 0.08)',
            }}
          >
            <p className="text-sm text-[#8B7082]">
              <strong>Governing Law:</strong> These Terms of Service are governed by the laws of the State of Florida, United States.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
