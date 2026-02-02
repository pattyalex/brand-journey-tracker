
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  HelpCircle,
  MessageCircle,
  Book,
  ChevronRight,
  ChevronDown,
  Send,
  Mail,
  FileText,
  Video,
  Lightbulb,
  ExternalLink
} from 'lucide-react';

const faqs = [
  {
    question: "How do I schedule content on the calendar?",
    answer: "Navigate to 'Planner and Calendar' from the sidebar. Click on any date to add a new task or content item. You can drag and drop items to reschedule them, and use the weekly or monthly views to plan ahead."
  },
  {
    question: "How do I track brand partnerships?",
    answer: "Go to 'Partnerships' in the sidebar to manage all your brand deals. You can add new partnerships, track deliverables, set deadlines, and monitor payment status all in one place."
  },
  {
    question: "Can I connect my social media accounts?",
    answer: "Yes! Go to Settings > Integrations to connect your Google Calendar. Social media platform connections for auto-posting are coming soon in a future update."
  },
  {
    question: "How do I set my content goals?",
    answer: "Visit 'Strategy and Goals' to define your mission statement, set monthly goals, and track your top priorities. This helps you stay focused on what matters most for your brand growth."
  },
  {
    question: "How do I change my timezone?",
    answer: "Go to Settings > Preferences and select your preferred timezone from the list. Your planner and calendar will automatically adjust to show times in your selected timezone."
  },
  {
    question: "How do I export my data?",
    answer: "Navigate to Settings > Data where you can export all your account data as JSON or download your content calendar as a CSV or iCal file."
  },
];

const resources = [
  {
    icon: Book,
    title: "Getting Started Guide",
    description: "Learn the basics of HeyMeg",
    link: "#"
  },
  {
    icon: Video,
    title: "Video Tutorials",
    description: "Watch step-by-step guides",
    link: "#"
  },
  {
    icon: Lightbulb,
    title: "Best Practices",
    description: "Tips for content creators",
    link: "#"
  },
  {
    icon: FileText,
    title: "Release Notes",
    description: "See what's new",
    link: "#"
  },
];

const Help = () => {
  const [activeSection, setActiveSection] = useState('faq');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  const sections = [
    { id: 'faq', label: 'FAQs', icon: HelpCircle },
    { id: 'contact', label: 'Contact Us', icon: MessageCircle },
    { id: 'resources', label: 'Resources', icon: Book },
  ];

  return (
    <Layout>
      <ScrollArea className="h-full" style={{ background: '#f9f7f5' }}>
        <div className="min-h-screen" style={{ background: '#f9f7f5' }}>
          <div className="max-w-5xl mx-auto px-6 md:px-8 pt-8 pb-16">
            {/* Header */}
            <div className="mb-8">
              <h1
                className="text-4xl mb-2"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 600,
                  color: '#2d2a26'
                }}
              >
                Help Center
              </h1>
              <p
                className="text-[15px] text-[#8B7082]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Find answers, get support, and learn how to make the most of HeyMeg
              </p>
            </div>

            <div className="flex gap-8">
              {/* Sidebar Navigation */}
              <div className="w-56 flex-shrink-0">
                <nav className="space-y-1 sticky top-8">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                        activeSection === section.id
                          ? "bg-white text-[#612a4f] shadow-sm"
                          : "text-[#8B7082] hover:bg-white/50 hover:text-[#612a4f]"
                      )}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      <section.icon className={cn(
                        "w-4 h-4",
                        activeSection === section.id ? "text-[#612a4f]" : "text-[#8B7082]"
                      )} />
                      {section.label}
                      {activeSection === section.id && (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                  ))}
                </nav>

                {/* Quick Contact Card */}
                <div
                  className="mt-6 p-4 rounded-xl"
                  style={{
                    background: 'linear-gradient(145deg, rgba(97, 42, 79, 0.08) 0%, rgba(74, 52, 66, 0.05) 100%)',
                    border: '1px solid rgba(97, 42, 79, 0.1)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-[#612a4f]" />
                    <span className="text-sm font-medium text-[#612a4f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Need help fast?
                    </span>
                  </div>
                  <p className="text-xs text-[#8B7082] mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Email us directly at
                  </p>
                  <a
                    href="mailto:support@heymeg.com"
                    className="text-sm font-medium text-[#612a4f] hover:underline"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    support@heymeg.com
                  </a>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 space-y-6">
                {/* ========== FAQ SECTION ========== */}
                {activeSection === 'faq' && (
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
                        <HelpCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2
                          className="text-lg text-[#2d2a26]"
                          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                        >
                          Frequently Asked Questions
                        </h2>
                        <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          Quick answers to common questions
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {faqs.map((faq, index) => (
                        <div
                          key={index}
                          className={cn(
                            "rounded-xl border transition-all",
                            expandedFaq === index
                              ? "border-[#612a4f]/20 bg-[#612a4f]/5"
                              : "border-[#E8E4E6] hover:border-[#8B7082]/30"
                          )}
                        >
                          <button
                            onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                            className="w-full flex items-center justify-between p-4 text-left"
                          >
                            <span
                              className={cn(
                                "text-sm font-medium",
                                expandedFaq === index ? "text-[#612a4f]" : "text-[#2d2a26]"
                              )}
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {faq.question}
                            </span>
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 transition-transform",
                                expandedFaq === index ? "rotate-180 text-[#612a4f]" : "text-[#8B7082]"
                              )}
                            />
                          </button>
                          {expandedFaq === index && (
                            <div className="px-4 pb-4">
                              <p
                                className="text-sm text-[#8B7082] leading-relaxed"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                              >
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ========== CONTACT SECTION ========== */}
                {activeSection === 'contact' && (
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
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2
                          className="text-lg text-[#2d2a26]"
                          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                        >
                          Contact Us
                        </h2>
                        <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          We'd love to hear from you
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label
                            className="text-sm font-medium text-[#2d2a26]"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          >
                            Your Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your name"
                            className="w-full h-11 px-4 rounded-xl border border-[#E8E4E6] bg-white text-sm focus:border-[#612a4f] focus:ring-2 focus:ring-[#612a4f]/20 outline-none transition-all"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            className="text-sm font-medium text-[#2d2a26]"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          >
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                            className="w-full h-11 px-4 rounded-xl border border-[#E8E4E6] bg-white text-sm focus:border-[#612a4f] focus:ring-2 focus:ring-[#612a4f]/20 outline-none transition-all"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          className="text-sm font-medium text-[#2d2a26]"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          Subject
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          placeholder="What's this about?"
                          className="w-full h-11 px-4 rounded-xl border border-[#E8E4E6] bg-white text-sm focus:border-[#612a4f] focus:ring-2 focus:ring-[#612a4f]/20 outline-none transition-all"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          className="text-sm font-medium text-[#2d2a26]"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          Message
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          placeholder="Tell us how we can help..."
                          className="w-full px-4 py-3 rounded-xl border border-[#E8E4E6] bg-white text-sm focus:border-[#612a4f] focus:ring-2 focus:ring-[#612a4f]/20 outline-none transition-all resize-none"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-11 px-6 rounded-xl text-white font-medium flex items-center gap-2"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          background: 'linear-gradient(145deg, #612a4f 0%, #4a3442 100%)',
                        }}
                      >
                        <Send className="w-4 h-4" />
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </div>
                )}

                {/* ========== RESOURCES SECTION ========== */}
                {activeSection === 'resources' && (
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
                        <Book className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2
                          className="text-lg text-[#2d2a26]"
                          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                        >
                          Resources
                        </h2>
                        <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          Guides, tutorials, and more
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.link}
                          className="group flex items-start gap-3 p-4 rounded-xl border border-[#E8E4E6] hover:border-[#612a4f]/20 hover:bg-[#612a4f]/5 transition-all"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#8B7082]/10 flex items-center justify-center group-hover:bg-[#612a4f]/10 transition-colors">
                            <resource.icon className="w-5 h-5 text-[#8B7082] group-hover:text-[#612a4f] transition-colors" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1">
                              <h3
                                className="text-sm font-medium text-[#2d2a26] group-hover:text-[#612a4f] transition-colors"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                              >
                                {resource.title}
                              </h3>
                              <ExternalLink className="w-3 h-3 text-[#8B7082] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p
                              className="text-xs text-[#8B7082] mt-0.5"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {resource.description}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>

                    {/* Coming Soon Banner */}
                    <div
                      className="mt-6 p-4 rounded-xl flex items-center gap-3"
                      style={{
                        background: 'linear-gradient(145deg, rgba(139, 106, 126, 0.08) 0%, rgba(74, 52, 66, 0.05) 100%)',
                        border: '1px solid rgba(139, 115, 130, 0.1)',
                      }}
                    >
                      <Lightbulb className="w-5 h-5 text-[#612a4f]" />
                      <div>
                        <p className="text-sm font-medium text-[#612a4f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          More resources coming soon!
                        </p>
                        <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          We're working on video tutorials, templates, and more.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Layout>
  );
};

export default Help;
