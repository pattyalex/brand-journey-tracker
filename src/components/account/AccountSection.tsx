import React from 'react';
import { Button } from "@/components/ui/button";
import { User, Lock, Trash2, Camera, AlertTriangle, Download } from 'lucide-react';

interface AccountSectionProps {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  loading: boolean;
  updatingProfile: boolean;
  handleProfileUpdate: (e: React.FormEvent) => void;
  currentPassword: string;
  setCurrentPassword: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  changingPassword: boolean;
  handlePasswordChange: (e: React.FormEvent) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (v: boolean) => void;
  deleteEmailInput: string;
  setDeleteEmailInput: (v: string) => void;
  deletingAccount: boolean;
  handleDeleteAccount: () => void;
}

const AccountSection = ({
  name, setName, email, setEmail, loading, updatingProfile, handleProfileUpdate,
  currentPassword, setCurrentPassword, newPassword, setNewPassword,
  confirmPassword, setConfirmPassword, changingPassword, handlePasswordChange,
  showDeleteDialog, setShowDeleteDialog, deleteEmailInput, setDeleteEmailInput,
  deletingAccount, handleDeleteAccount,
}: AccountSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Profile Info */}
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
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              Account
            </h2>
            <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Your personal information
            </p>
          </div>
        </div>

        {/* Profile Photo */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#8B7082]/10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8b6a7e] to-[#4a3442] flex items-center justify-center text-white text-2xl font-semibold">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-lg border-[#8B7082]/30 text-[#612a4f] hover:bg-[#612a4f]/5 mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <Camera className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
            <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              JPG, PNG or GIF. Max 2MB.
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                placeholder="Enter your name"
                className="w-full h-11 px-4 rounded-xl border border-[#E8E4E6] bg-white text-sm focus:border-[#612a4f] focus:ring-2 focus:ring-[#612a4f]/20 outline-none transition-all disabled:opacity-50"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="Enter your email"
                className="w-full h-11 px-4 rounded-xl border border-[#E8E4E6] bg-white text-sm focus:border-[#612a4f] focus:ring-2 focus:ring-[#612a4f]/20 outline-none transition-all disabled:opacity-50"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading || updatingProfile}
            className="h-11 px-6 rounded-xl text-white font-medium"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              background: 'linear-gradient(145deg, #612a4f 0%, #4a3442 100%)',
            }}
          >
            {updatingProfile ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>

      {/* Change Password */}
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
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              Change Password
            </h2>
            <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Keep your account secure
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={changingPassword}
              placeholder="••••••••••"
              className="w-full h-11 px-4 rounded-xl border border-[#E8E4E6] bg-white text-sm focus:border-[#612a4f] focus:ring-2 focus:ring-[#612a4f]/20 outline-none transition-all disabled:opacity-50"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={changingPassword}
                placeholder="••••••••••"
                className="w-full h-11 px-4 rounded-xl border border-[#E8E4E6] bg-white text-sm focus:border-[#612a4f] focus:ring-2 focus:ring-[#612a4f]/20 outline-none transition-all disabled:opacity-50"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={changingPassword}
                placeholder="••••••••••"
                className="w-full h-11 px-4 rounded-xl border border-[#E8E4E6] bg-white text-sm focus:border-[#612a4f] focus:ring-2 focus:ring-[#612a4f]/20 outline-none transition-all disabled:opacity-50"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{
              background: 'linear-gradient(145deg, rgba(139, 106, 126, 0.08) 0%, rgba(74, 52, 66, 0.05) 100%)',
              border: '1px solid rgba(139, 115, 130, 0.1)',
            }}
          >
            <p className="text-sm text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Password must be at least 10 characters with one uppercase letter and one special character.
            </p>
          </div>

          <Button
            type="submit"
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
            variant="outline"
            className="h-11 px-6 rounded-xl font-medium border-[#8B7082]/30 text-[#612a4f] hover:bg-[#612a4f]/5 hover:border-[#612a4f]/30 disabled:opacity-50"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {changingPassword ? 'Changing...' : 'Update Password'}
          </Button>
        </form>
      </div>

      {/* Delete Account */}
      <div
        className="bg-white/80 rounded-[20px] p-6"
        style={{
          boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
          border: '1px solid rgba(220, 38, 38, 0.1)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Delete Account
              </h3>
              <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Permanently deletes your account and all data immediately
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setDeleteEmailInput(''); setShowDeleteDialog(true); }}
            className="h-9 px-4 rounded-lg border-red-200 text-red-500 hover:bg-red-50"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div
            className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl"
            style={{ border: '1px solid rgba(220, 38, 38, 0.15)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                  Delete your account?
                </h2>
                <p className="text-xs text-red-500 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  This cannot be undone
                </p>
              </div>
            </div>

            {/* Warning box */}
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-6 space-y-2">
              <p className="text-sm font-medium text-red-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Everything will be deleted immediately:
              </p>
              <ul className="text-sm text-red-600 space-y-1 list-disc list-inside" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <li>Your profile and account info</li>
                <li>All your content, ideas, and notes</li>
                <li>Your calendar and partnerships</li>
                <li>All settings and preferences</li>
              </ul>
            </div>

            {/* Export nudge */}
            <div className="rounded-xl bg-[#612a4f]/5 border border-[#612a4f]/10 p-4 mb-6 flex items-start gap-3">
              <Download className="w-4 h-4 text-[#612a4f] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#612a4f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <strong>Export your data first.</strong> Go to the Data section in Settings to download everything before you delete. You won't be able to recover it after.
              </p>
            </div>

            {/* Email confirmation */}
            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Type your email address to confirm
              </label>
              <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {email}
              </p>
              <input
                type="email"
                value={deleteEmailInput}
                onChange={(e) => setDeleteEmailInput(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-11 px-4 rounded-xl border border-[#E8E4E6] bg-white text-sm focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 h-11 rounded-xl border-[#8B7082]/30 text-[#8B7082] hover:bg-[#f9f7f5]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteEmailInput.trim().toLowerCase() !== email.trim().toLowerCase()}
                className="flex-1 h-11 rounded-xl text-white font-medium bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {deletingAccount ? 'Deleting...' : 'Yes, delete my account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSection;
