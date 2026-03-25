import Layout from '@/components/Layout';
import { cn } from "@/lib/utils";
import {
  User, Crown, ChevronRight, LogOut,
  Calendar, Download, FileText, HelpCircle, MessageCircle
} from 'lucide-react';
import { useMyAccount } from '@/components/account/useMyAccount';
import AccountSection from '@/components/account/AccountSection';
import MembershipSection from '@/components/account/MembershipSection';
import PreferencesSection from '@/components/account/PreferencesSection';
import IntegrationsSection from '@/components/account/IntegrationsSection';
import DataSection from '@/components/account/DataSection';
import LegalSection from '@/components/account/LegalSection';
import HelpSection from '@/components/account/HelpSection';
import ContactSection from '@/components/account/ContactSection';

const MyAccount = () => {
  const {
    name, setName,
    email, setEmail,
    loading,
    activeSection, setActiveSection,
    expandedFaq, setExpandedFaq,
    showDeleteDialog, setShowDeleteDialog,
    deleteEmailInput, setDeleteEmailInput,
    deletingAccount,
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    changingPassword,
    updatingProfile,
    selectedTimezone, handleTimezoneChange,
    firstDayOfWeek, handleFirstDayChange,
    handleProfileUpdate,
    handlePasswordChange,
    handleSignOut,
    handleDeleteAccount,
    handleExportAllData,
    handleDownloadCalendar,
    faqs,
  } = useMyAccount();

  const sections = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'membership', label: 'Membership', icon: Crown },
    { id: 'preferences', label: 'Calendar', icon: Calendar },
    { id: 'integrations', label: 'Integrations', icon: Calendar },
    { id: 'data', label: 'Data', icon: Download },
    { id: 'legal', label: 'Legal', icon: FileText },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'contact', label: 'Contact Us', icon: MessageCircle },
  ];

  return (
    <Layout>
        <div className="min-h-screen" style={{ background: '#f9f7f5' }}>
          <div className="max-w-5xl mx-auto px-6 md:px-8 pt-8 pb-16">
            {/* Header */}
            <div className="mb-8">
              <h1
                className="text-3xl mb-2"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 600,
                  color: '#2d2a26'
                }}
              >
                Settings
              </h1>
              <p
                className="text-[15px] text-[#8B7082]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Manage your account, preferences, and subscription
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

                  {/* Sign Out Button */}
                  <div className="pt-4 mt-4 border-t border-[#8B7082]/10">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#8B7082] hover:bg-red-50 hover:text-red-500 transition-all"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 space-y-6">
                {activeSection === 'account' && (
                  <AccountSection
                    name={name}
                    setName={setName}
                    email={email}
                    setEmail={setEmail}
                    loading={loading}
                    updatingProfile={updatingProfile}
                    handleProfileUpdate={handleProfileUpdate}
                    currentPassword={currentPassword}
                    setCurrentPassword={setCurrentPassword}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                    changingPassword={changingPassword}
                    handlePasswordChange={handlePasswordChange}
                    showDeleteDialog={showDeleteDialog}
                    setShowDeleteDialog={setShowDeleteDialog}
                    deleteEmailInput={deleteEmailInput}
                    setDeleteEmailInput={setDeleteEmailInput}
                    deletingAccount={deletingAccount}
                    handleDeleteAccount={handleDeleteAccount}
                  />
                )}

                {activeSection === 'membership' && <MembershipSection />}

                {activeSection === 'preferences' && (
                  <PreferencesSection
                    selectedTimezone={selectedTimezone}
                    handleTimezoneChange={handleTimezoneChange}
                    firstDayOfWeek={firstDayOfWeek}
                    handleFirstDayChange={handleFirstDayChange}
                  />
                )}

                {activeSection === 'integrations' && <IntegrationsSection />}

                {activeSection === 'data' && (
                  <DataSection
                    handleExportAllData={handleExportAllData}
                    handleDownloadCalendar={handleDownloadCalendar}
                  />
                )}

                {activeSection === 'legal' && <LegalSection />}

                {activeSection === 'help' && (
                  <HelpSection
                    faqs={faqs}
                    expandedFaq={expandedFaq}
                    setExpandedFaq={setExpandedFaq}
                  />
                )}

                {activeSection === 'contact' && <ContactSection />}
              </div>
            </div>
          </div>
        </div>
    </Layout>
  );
};

export default MyAccount;
