import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getCurrentUser, updateUserProfile, updateUserPassword, supabase } from '@/lib/supabase';
import { StorageKeys, getString, setString } from "@/lib/storage";
import { getUserPreferences, updateTimezone } from '@/services/preferencesService';
import { API_BASE } from '@/lib/api-base';

export function useMyAccount() {
  const navigate = useNavigate();
  const { user, session, openLoginModal, logout } = useAuth();

  // Profile state — initialize from auth user to avoid empty flash
  const userMeta = user?.user_metadata || {};
  const [name, setName] = useState(userMeta.full_name || userMeta.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(userMeta.avatar_url || userMeta.picture || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('account');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [accountDeleted, setAccountDeleted] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const hasLoadedRef = useRef(false);

  // Preferences state
  const [selectedTimezone, setSelectedTimezone] = useState(() => {
    return getString(StorageKeys.selectedTimezone) || 'auto';
  });
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(() => {
    return getString(StorageKeys.firstDayOfWeek) || 'sunday';
  });

  // Load profile data ONCE when user becomes available.
  // Do NOT re-run on tab switches or token refreshes.
  useEffect(() => {
    if (!user || hasLoadedRef.current) return;

    const loadUserData = async () => {
      setLoading(true);
      try {
        const meta = user.user_metadata || {};
        const authName = meta.full_name || meta.name || '';
        const authEmail = user.email || '';

        const accessToken = session?.access_token;
        let profileName = '';
        let profileEmail = '';
        let profileAvatarUrl = '';

        if (accessToken) {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const res = await fetch(
            `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=full_name,email,avatar_url`,
            {
              headers: {
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );
          if (res.ok) {
            const rows = await res.json();
            if (rows.length > 0) {
              profileName = rows[0].full_name || '';
              profileEmail = rows[0].email || '';
              profileAvatarUrl = rows[0].avatar_url || '';
            }
          }
        }

        setName(profileName || authName || '');
        setEmail(profileEmail || authEmail || '');
        setAvatarUrl(profileAvatarUrl || meta.avatar_url || meta.picture || null);
        hasLoadedRef.current = true;
      } catch (error) {
        console.error('Error loading user data:', error);
        const meta = user.user_metadata || {};
        setName(meta.full_name || meta.name || '');
        setEmail(user.email || '');
        hasLoadedRef.current = true;
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, session]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdatingProfile(true);

    try {
      const updateFields: Record<string, string> = { full_name: name };
      if (email) updateFields.email = email;

      // Bypass the Supabase JS client entirely — its internal auth lock is
      // corrupted and causes all requests to hang. Use a direct REST call.
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(updateFields),
        }
      );

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`${res.status}: ${errBody}`);
      }

      // Update auth.users metadata (name and/or email)
      const authUpdateBody: Record<string, any> = {};
      if (name !== (user.user_metadata?.full_name || user.user_metadata?.name || '')) {
        authUpdateBody.data = { full_name: name, name: name };
      }
      if (email && email !== user.email) {
        authUpdateBody.email = email;
      }

      if (Object.keys(authUpdateBody).length > 0) {
        const authRes = await fetch(
          `${supabaseUrl}/auth/v1/user`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(authUpdateBody),
          }
        );
        if (authUpdateBody.email) {
          if (authRes.ok) {
            toast.success('Profile updated. Check your new email to confirm the address change.');
          } else {
            toast.success('Profile updated, but email change needs confirmation — check your inbox.');
          }
        } else {
          toast.success('Profile updated successfully');
        }
      } else {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user || !session?.access_token) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, or GIF)');
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `${user.id}/avatar.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add cache buster so the browser shows the new image
      const avatarUrlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;

      // Update profiles table
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ avatar_url: publicUrl }),
      });

      // Update auth metadata so it shows in Supabase Users dashboard
      const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ data: { avatar_url: publicUrl, picture: publicUrl } }),
      });
      if (!authRes.ok) {
        console.error('Failed to update auth metadata:', await authRes.text());
      }

      setAvatarUrl(avatarUrlWithCacheBuster);
      toast.success('Photo updated');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      const msg = error?.message || '';
      if (msg.includes('Payload too large') || msg.includes('file size') || msg.includes('too large')) {
        toast.error('Image is too large. Please choose a smaller file (under 10MB).');
      } else if (msg.includes('mime') || msg.includes('type')) {
        toast.error('Unsupported file type. Please upload a JPG, PNG, or GIF.');
      } else {
        toast.error(`Failed to upload photo: ${msg || 'please try again'}`);
      }
    } finally {
      setUploadingAvatar(false);
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

  const handleTimezoneChange = async (timezone: string) => {
    setSelectedTimezone(timezone);
    setString(StorageKeys.selectedTimezone, timezone);
    if (user?.id) {
      try {
        await getUserPreferences(user.id);
        await updateTimezone(user.id, timezone);
      } catch (e) {
        console.error('Failed to save timezone:', e);
      }
    }
    toast.success('Timezone updated');
  };

  const handleFirstDayChange = (day: string) => {
    setFirstDayOfWeek(day);
    setString(StorageKeys.firstDayOfWeek, day);
    toast.success(`Week now starts on ${day === 'monday' ? 'Monday' : 'Sunday'}`);
  };

  const handleSignOut = () => {
    Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k); });
    localStorage.removeItem('supabase.auth.token');
    supabase.auth.signOut().catch(() => {});
    window.location.href = '/landing.html';
  };

  const handleDeleteAccount = async () => {
    if (deleteEmailInput.trim().toLowerCase() !== email.trim().toLowerCase()) return;
    setDeletingAccount(true);
    try {
      // Send deletion emails BEFORE deleting the account
      const firstName = name ? name.split(' ')[0] : 'there';
      try {
        // Email to the user
        const authHeaders = {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        };
        await fetch(`${API_BASE}/api/send-email`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            to: email,
            subject: 'Your HeyMeg account has been deleted',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Account Deleted</h1>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">Hi ${firstName},</p>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">Your HeyMeg account and all associated data have been permanently deleted as requested.</p>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">We're sorry to see you go. If you ever want to come back, you're always welcome to create a new account at <strong>heymeg.ai</strong>.</p>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">Thank you for being part of HeyMeg.</p>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">— The HeyMeg Team</p>
                <p style="color: #999; font-size: 12px; line-height: 1.4; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">This is an automated message. Please do not reply to this email. If you need help, contact us at contact@heymeg.ai.</p>
              </div>
            `,
          }),
        });
        // Email to Patricia (admin notification)
        await fetch(`${API_BASE}/api/send-email`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            to: 'contact@heymeg.ai',
            subject: `Account Deleted: ${name || 'Unknown'} (${email})`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">User Account Deleted</h1>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">A user has deleted their HeyMeg account.</p>
                <table style="border-collapse: collapse; margin: 20px 0;">
                  <tr><td style="padding: 8px 16px; font-weight: bold; color: #333;">Name:</td><td style="padding: 8px 16px; color: #555;">${name || 'N/A'}</td></tr>
                  <tr><td style="padding: 8px 16px; font-weight: bold; color: #333;">Email:</td><td style="padding: 8px 16px; color: #555;">${email}</td></tr>
                  <tr><td style="padding: 8px 16px; font-weight: bold; color: #333;">User ID:</td><td style="padding: 8px 16px; color: #555;">${user?.id || 'N/A'}</td></tr>
                  <tr><td style="padding: 8px 16px; font-weight: bold; color: #333;">Deleted at:</td><td style="padding: 8px 16px; color: #555;">${new Date().toLocaleString()}</td></tr>
                </table>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error('Error sending deletion emails:', emailErr);
        // Continue with deletion even if emails fail
      }

      // Server handles everything: Stripe cancellation, all table cleanup, auth user deletion
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (token) {
        const res = await fetch('/api/delete-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to delete account');
        }
      }
      localStorage.clear();
      await supabase.auth.signOut();
      window.location.replace('/login?deleted=true');
    } catch (err) {
      console.error('Error deleting account:', err);
      await supabase.auth.signOut();
      window.location.replace('/login?deleted=true');
    }
  };

  const handleExportAllData = () => {
    try {
      const sensitiveKeys = [
        StorageKeys.openaiApiKey, StorageKeys.openaiApiKeyMasked, StorageKeys.openaiKeySet,
        StorageKeys.anthropicApiKey, StorageKeys.anthropicApiKeyMasked, StorageKeys.anthropicKeySet,
        StorageKeys.firecrawlApiKey,
        StorageKeys.googleCalendarTokens,
      ];

      const exportData: Record<string, unknown> = {};

      for (const [name, key] of Object.entries(StorageKeys)) {
        if (sensitiveKeys.includes(key)) continue;
        const raw = localStorage.getItem(key);
        if (raw === null) continue;
        try {
          exportData[name] = JSON.parse(raw);
        } catch {
          exportData[name] = raw;
        }
      }

      for (const ck of ['editor-checklist-items', 'editor-checklist-items-image']) {
        const raw = localStorage.getItem(ck);
        if (raw) {
          try { exportData[ck] = JSON.parse(raw); } catch { exportData[ck] = raw; }
        }
      }

      const lines: string[] = [];
      const hr = '\u2500'.repeat(60);
      lines.push('HeyMeg \u2014 Your Data Export');
      lines.push(`Exported on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
      lines.push(hr);

      const get = (key: string) => exportData[key];

      const mission = get('missionStatement');
      const brandVals = get('brandValues');
      if (mission || brandVals) {
        lines.push('\n\ud83d\udccc BRAND STRATEGY\n');
        if (mission) lines.push(`Mission Statement: ${mission}`);
        if (brandVals) {
          const vals = Array.isArray(brandVals) ? brandVals : [];
          if (vals.length) lines.push(`Brand Values: ${vals.join(', ')}`);
        }
        lines.push(hr);
      }

      const pillars = get('contentPillars') || get('pillars');
      if (pillars && Array.isArray(pillars) && pillars.length) {
        lines.push('\n\ud83d\udcc2 CONTENT PILLARS\n');
        for (const p of pillars) {
          lines.push(`  \u2022 ${typeof p === 'string' ? p : p.name || p.title || JSON.stringify(p)}`);
        }
        lines.push(hr);
      }

      const shortGoals = get('shortTermGoals');
      const longGoals = get('longTermGoals');
      const monthlyGoals = get('monthlyGoalsData');
      if (shortGoals || longGoals || monthlyGoals) {
        lines.push('\n\ud83c\udfaf GOALS\n');
        if (shortGoals && Array.isArray(shortGoals) && shortGoals.length) {
          lines.push('Short-term Goals:');
          for (const g of shortGoals) lines.push(`  \u2022 ${typeof g === 'string' ? g : g.text || g.title || JSON.stringify(g)}`);
        }
        if (longGoals && Array.isArray(longGoals) && longGoals.length) {
          lines.push('\nLong-term Goals:');
          for (const g of longGoals) lines.push(`  \u2022 ${typeof g === 'string' ? g : g.text || g.title || JSON.stringify(g)}`);
        }
        if (monthlyGoals && typeof monthlyGoals === 'object') {
          lines.push('\nMonthly Goals:');
          for (const [key, goals] of Object.entries(monthlyGoals)) {
            if (Array.isArray(goals) && goals.length) {
              lines.push(`  ${key}:`);
              for (const g of goals) lines.push(`    \u2022 ${typeof g === 'string' ? g : (g as Record<string, unknown>).text || JSON.stringify(g)}`);
            }
          }
        }
        lines.push(hr);
      }

      const ideas = get('contentIdeas');
      const bankIdeas = get('bankOfIdeas');
      if ((ideas && Array.isArray(ideas) && ideas.length) || (bankIdeas && Array.isArray(bankIdeas) && bankIdeas.length)) {
        lines.push('\n\ud83d\udca1 CONTENT IDEAS\n');
        if (ideas && Array.isArray(ideas)) {
          for (const idea of ideas) {
            const title = idea.title || idea.name || 'Untitled';
            lines.push(`  \u2022 ${title}`);
            if (idea.description) lines.push(`    ${idea.description}`);
          }
        }
        if (bankIdeas && Array.isArray(bankIdeas) && bankIdeas.length) {
          lines.push('\nIdea Bank:');
          for (const idea of bankIdeas) {
            lines.push(`  \u2022 ${typeof idea === 'string' ? idea : idea.title || idea.text || JSON.stringify(idea)}`);
          }
        }
        lines.push(hr);
      }

      const kanban = get('productionKanban');
      if (kanban) {
        lines.push('\n\ud83c\udfa5 PRODUCTION CONTENT\n');
        const columns = Array.isArray(kanban) ? kanban : (kanban as Record<string, unknown>).columns || Object.values(kanban);
        if (Array.isArray(columns)) {
          for (const col of columns) {
            const colObj = col as Record<string, unknown>;
            const colName = (colObj.title || colObj.name || colObj.id || 'Column') as string;
            const cards = (colObj.cards || []) as Array<Record<string, unknown>>;
            if (cards.length === 0) continue;
            lines.push(`\n  ${colName.toUpperCase()} (${cards.length} items)`);
            for (const card of cards) {
              const title = (card.title || card.hook || 'Untitled') as string;
              lines.push(`\n    "${title}"`);
              if (card.hook && card.hook !== card.title) lines.push(`      Hook: ${card.hook}`);
              if (card.script) lines.push(`      Script: ${(card.script as string).slice(0, 200)}${(card.script as string).length > 200 ? '...' : ''}`);
              if (card.caption) lines.push(`      Caption: ${(card.caption as string).slice(0, 200)}${(card.caption as string).length > 200 ? '...' : ''}`);
              if (card.contentType) lines.push(`      Type: ${card.contentType}`);
              if (card.formats && (card.formats as string[]).length) lines.push(`      Format: ${(card.formats as string[]).join(', ')}`);
              if (card.platforms && (card.platforms as string[]).length) lines.push(`      Platforms: ${(card.platforms as string[]).join(', ')}`);
              if (card.scheduledDate) lines.push(`      Scheduled: ${card.scheduledDate}`);
              if (card.locationText) lines.push(`      Location: ${card.locationText}`);
              if (card.outfitText) lines.push(`      Outfit: ${card.outfitText}`);
              if (card.propsText) lines.push(`      Props: ${card.propsText}`);
              if (card.filmingNotes) lines.push(`      Notes: ${card.filmingNotes}`);
            }
          }
        }
        lines.push('\n' + hr);
      }

      const plannerData = get('plannerData');
      if (plannerData && typeof plannerData === 'object') {
        const entries = Object.entries(plannerData);
        if (entries.length) {
          lines.push('\n\ud83d\udcc5 PLANNER\n');
          for (const [date, tasks] of entries) {
            if (Array.isArray(tasks) && tasks.length) {
              lines.push(`  ${date}:`);
              for (const t of tasks) {
                const text = typeof t === 'string' ? t : t.text || t.title || t.name || JSON.stringify(t);
                lines.push(`    \u2022 ${text}`);
              }
            }
          }
          lines.push(hr);
        }
      }

      const journal = get('journalEntries');
      if (journal && Array.isArray(journal) && journal.length) {
        lines.push('\n\ud83d\udcd3 JOURNAL ENTRIES\n');
        for (const entry of journal) {
          const date = entry.date || entry.createdAt || '';
          const text = entry.content || entry.text || entry.body || '';
          if (date) lines.push(`  [${date}]`);
          lines.push(`  ${text}\n`);
        }
        lines.push(hr);
      }

      const deals = get('collabBrands');
      if (deals && Array.isArray(deals) && deals.length) {
        lines.push('\n\ud83e\udd1d BRAND DEALS & COLLABORATIONS\n');
        for (const d of deals) {
          lines.push(`  \u2022 ${d.name || d.brand || d.title || JSON.stringify(d)}`);
        }
        lines.push(hr);
      }

      const notes = get('quickNotes');
      if (notes && Array.isArray(notes) && notes.length) {
        lines.push('\n\ud83d\udcdd QUICK NOTES\n');
        for (const n of notes) {
          lines.push(`  \u2022 ${typeof n === 'string' ? n : n.text || n.content || JSON.stringify(n)}`);
        }
        lines.push(hr);
      }

      lines.push('\n\nEnd of export.\n');

      const readableText = lines.join('\n');

      const txtBlob = new Blob([readableText], { type: 'text/plain' });
      const txtUrl = URL.createObjectURL(txtBlob);
      const txtLink = document.createElement('a');
      txtLink.href = txtUrl;
      txtLink.download = `heymeg-export-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(txtLink);
      txtLink.click();
      document.body.removeChild(txtLink);
      URL.revokeObjectURL(txtUrl);

      const jsonData = { exportedAt: new Date().toISOString(), version: '1.0', ...exportData };
      const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `heymeg-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(jsonLink);
      setTimeout(() => {
        jsonLink.click();
        document.body.removeChild(jsonLink);
        URL.revokeObjectURL(jsonUrl);
      }, 100);

      toast.success('Data exported as .txt and .json');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export data');
    }
  };

  const handleDownloadCalendar = () => {
    try {
      const kanbanRaw = localStorage.getItem(StorageKeys.productionKanban);
      const scheduledRaw = localStorage.getItem(StorageKeys.scheduledContent);

      interface CalendarEvent {
        title: string;
        date: string;
        platforms?: string[];
        status?: string;
        type: string;
      }

      const events: CalendarEvent[] = [];

      if (kanbanRaw) {
        try {
          const kanban = JSON.parse(kanbanRaw);
          const columns = kanban.columns || kanban;
          const allCards = Array.isArray(columns)
            ? columns.flatMap((col: { cards?: unknown[] }) => col.cards || [])
            : Object.values(columns).flatMap((col: unknown) => (col as { cards?: unknown[] }).cards || []);
          for (const card of allCards as Array<{ scheduledDate?: string; title?: string; hook?: string; platforms?: string[]; status?: string }>) {
            if (card.scheduledDate) {
              events.push({
                title: card.title || card.hook || 'Untitled',
                date: card.scheduledDate,
                platforms: card.platforms,
                status: card.status,
                type: 'production',
              });
            }
          }
        } catch { /* ignore parse errors */ }
      }

      if (scheduledRaw) {
        try {
          const items = JSON.parse(scheduledRaw);
          for (const item of items as Array<{ scheduledDate?: string; date?: string; title?: string; name?: string; platforms?: string[]; status?: string }>) {
            if (item.scheduledDate || item.date) {
              events.push({
                title: item.title || item.name || 'Untitled',
                date: (item.scheduledDate || item.date)!,
                platforms: item.platforms,
                status: item.status,
                type: 'scheduled',
              });
            }
          }
        } catch { /* ignore parse errors */ }
      }

      if (events.length === 0) {
        toast.error('No scheduled content to export');
        return;
      }

      const csvRows = [
        ['Title', 'Date', 'Platforms', 'Status', 'Type'],
        ...events.map(e => [
          `"${(e.title || '').replace(/"/g, '""')}"`,
          e.date,
          `"${(e.platforms || []).join(', ')}"`,
          e.status || '',
          e.type,
        ]),
      ];
      const csv = csvRows.map(r => r.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `heymeg-calendar-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Calendar exported (${events.length} events)`);
    } catch (err) {
      console.error('Calendar export failed:', err);
      toast.error('Failed to export calendar');
    }
  };

  const faqs = [
    { question: "How do I schedule content on the calendar?", answer: "Navigate to 'Planner and Calendar' from the sidebar. Click on any date to add a new task or content item. You can drag and drop items to reschedule them, and use the weekly or monthly views to plan ahead." },
    { question: "How do I track brand partnerships?", answer: "Go to 'Partnerships' in the sidebar to manage all your brand deals. You can add new partnerships, track deliverables, set deadlines, and monitor payment status all in one place." },
    { question: "How do I set my content goals?", answer: "Visit 'Strategy' to define your mission statement, set monthly goals, and track your top priorities. This helps you stay focused on what matters most for your brand growth." },
    { question: "How do I change my timezone?", answer: "Go to Settings > Preferences and select your preferred timezone from the list. Your planner and calendar will automatically adjust to show times in your selected timezone." },
    { question: "How do I export my data?", answer: "Navigate to Settings > Data where you can export all your account data as JSON or download your content calendar as a CSV or iCal file." },
  ];

  return {
    navigate,
    // Profile
    name, setName,
    email, setEmail,
    avatarUrl, uploadingAvatar, handleAvatarUpload,
    loading,
    activeSection, setActiveSection,
    expandedFaq, setExpandedFaq,
    showDeleteDialog, setShowDeleteDialog,
    deleteEmailInput, setDeleteEmailInput,
    deletingAccount,
    accountDeleted,
    // Password
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    changingPassword,
    updatingProfile,
    // Preferences
    selectedTimezone, handleTimezoneChange,
    firstDayOfWeek, handleFirstDayChange,
    // Handlers
    handleProfileUpdate,
    handlePasswordChange,
    handleSignOut,
    handleDeleteAccount,
    handleExportAllData,
    handleDownloadCalendar,
    // Data
    faqs,
  };
}
