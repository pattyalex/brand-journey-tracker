
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  CreditCard, User, Lock, ChevronRight, Crown, Check, Plus, Shield, LogOut,
  Bell, Globe, Calendar, Download, Trash2, Smartphone, Mail, DollarSign,
  FileText, Camera, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentUser, updateUserProfile, updateUserPassword, logout } from '@/lib/supabase';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { StorageKeys, getString, setString } from "@/lib/storage";
import APIKeySettings from "@/components/settings/APIKeySettings";
import OpenAISettings from "@/components/settings/OpenAISettings";
import ClaudeAPISettings from "@/components/settings/ClaudeAPISettings";

// Timezone options
const TIMEZONES = [
  { value: 'America/Los_Angeles', label: 'PST', name: 'Pacific Time', offset: 'UTC-8' },
  { value: 'America/Denver', label: 'MST', name: 'Mountain Time', offset: 'UTC-7' },
  { value: 'America/Chicago', label: 'CST', name: 'Central Time', offset: 'UTC-6' },
  { value: 'America/New_York', label: 'EST', name: 'Eastern Time', offset: 'UTC-5' },
  { value: 'Europe/London', label: 'GMT', name: 'Greenwich Mean Time', offset: 'UTC+0' },
  { value: 'Europe/Paris', label: 'CET', name: 'Central European Time', offset: 'UTC+1' },
  { value: 'Europe/Bucharest', label: 'EET', name: 'Eastern European Time', offset: 'UTC+2' },
  { value: 'Asia/Tokyo', label: 'JST', name: 'Japan Standard Time', offset: 'UTC+9' },
  { value: 'Australia/Sydney', label: 'AEST', name: 'Australian Eastern Time', offset: 'UTC+10' },
];

const MyAccount = () => {
  const navigate = useNavigate();
  const { openLoginModal } = useAuth();

  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Preferences state
  const [selectedTimezone, setSelectedTimezone] = useState(() => {
    return getString(StorageKeys.selectedTimezone) || 'auto';
  });
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState('monday');

  // Notification state
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [dealReminders, setDealReminders] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        const { user } = await getCurrentUser();
        if (user) {
          setName(user.user_metadata?.full_name || '');
          setEmail(user.email || '');
          setBio(user.user_metadata?.bio || '');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Could not load profile information');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);

    try {
      await updateUserProfile({ full_name: name, email, bio });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{10,})/;
    if (!passwordRegex.test(newPassword)) {
      toast.error('Password must be at least 10 characters and include at least one uppercase letter and one special character');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setChangingPassword(true);

    try {
      await updateUserPassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password. Please check your current password and try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleTimezoneChange = (timezone: string) => {
    setSelectedTimezone(timezone);
    setString(StorageKeys.selectedTimezone, timezone);
    toast.success('Timezone updated');
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
      toast.success("You've officially signed out");
      setTimeout(() => {
        openLoginModal();
      }, 500);
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'membership', label: 'Membership', icon: Crown },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'integrations', label: 'Integrations', icon: Calendar },
    { id: 'data', label: 'Data', icon: Download },
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
                {/* ========== PROFILE SECTION ========== */}
                {activeSection === 'profile' && (
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
                        <h2
                          className="text-lg text-[#2d2a26]"
                          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                        >
                          Profile
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

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          Bio
                        </label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          disabled={loading}
                          placeholder="Tell us a little about yourself..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-[#E8E4E6] bg-white text-sm focus:border-[#612a4f] focus:ring-2 focus:ring-[#612a4f]/20 outline-none transition-all disabled:opacity-50 resize-none"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        />
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
                )}

                {/* ========== ACCOUNT SECTION ========== */}
                {activeSection === 'account' && (
                  <div className="space-y-6">
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

                    {/* Two-Factor Authentication */}
                    <div
                      className="bg-white/80 rounded-[20px] p-6"
                      style={{
                        boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
                        border: '1px solid rgba(139, 115, 130, 0.06)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#8B7082]/10 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-[#612a4f]" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              Two-Factor Authentication
                            </h3>
                            <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              Add an extra layer of security
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-4 rounded-lg border-[#8B7082]/30 text-[#612a4f] hover:bg-[#612a4f]/5"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          Enable
                        </Button>
                      </div>
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
                              Permanently delete your account and all data
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-4 rounded-lg border-red-200 text-red-500 hover:bg-red-50"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========== MEMBERSHIP SECTION ========== */}
                {activeSection === 'membership' && (
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
                              7-day trial ends on May 30, 2025
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
                            •••• •••• •••• 4242
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
                )}

                {/* ========== NOTIFICATIONS SECTION ========== */}
                {activeSection === 'notifications' && (
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
                        <Bell className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                          Notifications
                        </h2>
                        <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          Manage how you receive notifications
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-[#2d2a26] mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        Email Preferences
                      </h3>

                      {[
                        { id: 'weekly', icon: Mail, title: 'Weekly Digest', description: 'Summary of your content performance', checked: weeklyDigest, onChange: setWeeklyDigest },
                        { id: 'deals', icon: DollarSign, title: 'Deal Reminders', description: 'Notifications about brand deal deadlines', checked: dealReminders, onChange: setDealReminders },
                        { id: 'payment', icon: CreditCard, title: 'Payment Alerts', description: 'Billing and payment notifications', checked: paymentAlerts, onChange: setPaymentAlerts },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-[#8B7082]/5 hover:bg-[#8B7082]/8 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                              <item.icon className="w-4 h-4 text-[#8B7082]" />
                            </div>
                            <div>
                              <h4 className="font-medium text-[#2d2a26] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                {item.title}
                              </h4>
                              <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={item.checked}
                            onCheckedChange={item.onChange}
                            className="data-[state=checked]:bg-[#612a4f]"
                          />
                        </div>
                      ))}

                      <div className="h-px bg-[#8B7082]/10 my-6"></div>

                      <h3 className="text-sm font-medium text-[#2d2a26] mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        Push Notifications
                      </h3>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-[#8B7082]/5 hover:bg-[#8B7082]/8 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                            <Smartphone className="w-4 h-4 text-[#8B7082]" />
                          </div>
                          <div>
                            <h4 className="font-medium text-[#2d2a26] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              Push Notifications
                            </h4>
                            <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              Receive notifications in your browser
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={pushNotifications}
                          onCheckedChange={setPushNotifications}
                          className="data-[state=checked]:bg-[#612a4f]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ========== PREFERENCES SECTION ========== */}
                {activeSection === 'preferences' && (
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
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                          Preferences
                        </h2>
                        <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          Customize your experience
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Timezone */}
                      <div>
                        <label className="text-sm font-medium text-[#2d2a26] mb-3 block" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          Timezone
                        </label>
                        <div className="space-y-1">
                          <button
                            onClick={() => handleTimezoneChange('auto')}
                            className={cn(
                              "w-full text-left px-4 py-3 text-sm rounded-xl transition-all",
                              selectedTimezone === 'auto'
                                ? "bg-[#612a4f]/10 text-[#612a4f] font-medium"
                                : "text-[#2d2a26] hover:bg-[#8B7082]/5"
                            )}
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          >
                            <div className="flex items-center justify-between">
                              <span>Auto (detect from browser)</span>
                              {selectedTimezone === 'auto' && (
                                <div className="w-5 h-5 rounded-full bg-[#612a4f] flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          </button>

                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {TIMEZONES.map((tz) => (
                              <button
                                key={tz.value}
                                onClick={() => handleTimezoneChange(tz.value)}
                                className={cn(
                                  "text-left px-3 py-2 text-sm rounded-xl transition-all",
                                  selectedTimezone === tz.value
                                    ? "bg-[#612a4f]/10 text-[#612a4f]"
                                    : "text-[#2d2a26] hover:bg-[#8B7082]/5"
                                )}
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                              >
                                <span className={cn("font-medium", selectedTimezone === tz.value && "text-[#612a4f]")}>
                                  {tz.label}
                                </span>
                                <p className="text-[10px] text-[#8B7082]">{tz.offset}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-[#8B7082]/10"></div>

                      {/* Date Format */}
                      <div>
                        <label className="text-sm font-medium text-[#2d2a26] mb-3 block" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          Date Format
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map((format) => (
                            <button
                              key={format}
                              onClick={() => setDateFormat(format)}
                              className={cn(
                                "px-4 py-3 text-sm rounded-xl transition-all",
                                dateFormat === format
                                  ? "bg-[#612a4f]/10 text-[#612a4f] font-medium"
                                  : "text-[#2d2a26] hover:bg-[#8B7082]/5 border border-[#E8E4E6]"
                              )}
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {format}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-[#8B7082]/10"></div>

                      {/* First Day of Week */}
                      <div>
                        <label className="text-sm font-medium text-[#2d2a26] mb-3 block" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          First Day of Week
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'monday', label: 'Monday' },
                            { value: 'sunday', label: 'Sunday' },
                          ].map((day) => (
                            <button
                              key={day.value}
                              onClick={() => setFirstDayOfWeek(day.value)}
                              className={cn(
                                "px-4 py-3 text-sm rounded-xl transition-all",
                                firstDayOfWeek === day.value
                                  ? "bg-[#612a4f]/10 text-[#612a4f] font-medium"
                                  : "text-[#2d2a26] hover:bg-[#8B7082]/5 border border-[#E8E4E6]"
                              )}
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* ========== INTEGRATIONS SECTION ========== */}
                {activeSection === 'integrations' && (
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
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                            Integrations
                          </h2>
                          <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            Connect external services
                          </p>
                        </div>
                      </div>

                      {/* Google Calendar */}
                      <div className="flex items-center justify-between p-4 rounded-xl border border-[#E8E4E6] hover:border-[#8B7082]/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-[#2d2a26] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              Google Calendar
                            </p>
                            <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              Sync your schedule for better planning
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="h-9 px-4 rounded-lg border-[#8B7082]/30 text-[#612a4f] hover:bg-[#612a4f]/5 hover:border-[#612a4f]/30"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          Connect
                        </Button>
                      </div>
                    </div>

                    {/* AI Assistants */}
                    <div
                      className="bg-white/80 rounded-[20px] p-6"
                      style={{
                        boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
                        border: '1px solid rgba(139, 115, 130, 0.06)',
                      }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-sm font-medium text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          AI Assistants
                        </h3>
                      </div>

                      <div
                        className="p-4 rounded-xl mb-4"
                        style={{
                          background: 'linear-gradient(145deg, rgba(139, 106, 126, 0.08) 0%, rgba(74, 52, 66, 0.05) 100%)',
                          border: '1px solid rgba(139, 115, 130, 0.1)',
                        }}
                      >
                        <p className="text-sm text-[#612a4f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          Connect AI providers to unlock content generation features
                        </p>
                      </div>

                      <div className="space-y-4">
                        <ClaudeAPISettings />
                        <APIKeySettings />
                        <OpenAISettings />
                      </div>
                    </div>
                  </div>
                )}

                {/* ========== DATA SECTION ========== */}
                {activeSection === 'data' && (
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
                        <Download className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                          Data
                        </h2>
                        <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          Export and download your data
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-[#E8E4E6] hover:border-[#8B7082]/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#8B7082]/10 flex items-center justify-center">
                            <Download className="w-4 h-4 text-[#612a4f]" />
                          </div>
                          <div>
                            <p className="font-medium text-[#2d2a26] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              Export All Data
                            </p>
                            <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              Download all your account data as JSON
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="h-9 px-4 rounded-lg border-[#8B7082]/30 text-[#612a4f] hover:bg-[#612a4f]/5 hover:border-[#612a4f]/30"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          Export
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl border border-[#E8E4E6] hover:border-[#8B7082]/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#8B7082]/10 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-[#612a4f]" />
                          </div>
                          <div>
                            <p className="font-medium text-[#2d2a26] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              Download Content Calendar
                            </p>
                            <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              Export your content calendar as CSV or iCal
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="h-9 px-4 rounded-lg border-[#8B7082]/30 text-[#612a4f] hover:bg-[#612a4f]/5 hover:border-[#612a4f]/30"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          Download
                        </Button>
                      </div>
                    </div>

                    <div
                      className="mt-6 p-4 rounded-xl flex items-start gap-3"
                      style={{
                        background: 'linear-gradient(145deg, rgba(139, 106, 126, 0.08) 0%, rgba(74, 52, 66, 0.05) 100%)',
                        border: '1px solid rgba(139, 115, 130, 0.1)',
                      }}
                    >
                      <AlertTriangle className="w-4 h-4 text-[#612a4f] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        Exported data may contain sensitive information. Please store it securely and do not share with others.
                      </p>
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

export default MyAccount;
