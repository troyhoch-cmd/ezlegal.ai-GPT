import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Phone, Briefcase, Building2, FileText, Bell, Lock, Save, Camera, Download, Trash2, Shield, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  bio: string;
  avatar_url: string;
  notification_email: boolean;
  notification_sms: boolean;
}

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const { t, language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'security' | 'data'>('profile');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    bio: '',
    avatar_url: '',
    notification_email: true,
    notification_sms: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [dataExporting, setDataExporting] = useState(false);
  const [dataDeleting, setDataDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exportRequests, setExportRequests] = useState<Array<{
    id: string;
    status: string;
    requested_at: string;
    completed_at: string | null;
  }>>([]);
  const [deletionRequests, setDeletionRequests] = useState<Array<{
    id: string;
    status: string;
    request_type: string;
    scheduled_for: string | null;
    created_at: string;
  }>>([]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'data') {
      loadDataRequests();
    }
  }, [user, activeTab]);

  const loadDataRequests = async () => {
    if (!user) return;

    const [exportRes, deletionRes] = await Promise.all([
      supabase
        .from('data_export_requests')
        .select('id, status, requested_at, completed_at')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false })
        .limit(5),
      supabase
        .from('data_deletion_requests')
        .select('id, status, request_type, scheduled_for, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    if (exportRes.data) setExportRequests(exportRes.data);
    if (deletionRes.data) setDeletionRequests(deletionRes.data);
  };

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          email: data.email || user?.email || '',
          phone: data.phone || '',
          company: data.company || '',
          job_title: data.job_title || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          notification_email: data.notification_email ?? true,
          notification_sms: data.notification_sms ?? false,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const trimmedEmail = profileData.email.trim().toLowerCase();
      const emailChanged = !!user?.email && trimmedEmail && trimmedEmail !== user.email.toLowerCase();
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

      if (emailChanged && !emailValid) {
        setMessage({ type: 'error', text: 'Please enter a valid email address.' });
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          company: profileData.company,
          job_title: profileData.job_title,
          bio: profileData.bio,
          notification_email: profileData.notification_email,
          notification_sms: profileData.notification_sms,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      if (emailChanged) {
        const { error: emailErr } = await supabase.auth.updateUser({ email: trimmedEmail });
        if (emailErr) throw emailErr;
        setMessage({
          type: 'success',
          text: 'Profile saved. Check your new inbox to confirm the email change.',
        });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      }

      await refreshProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      const text = error instanceof Error ? error.message : 'Failed to update profile';
      setMessage({ type: 'error', text });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'Failed to update password' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv' = 'json') => {
    if (!user) return;
    setDataExporting(true);
    setMessage(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/data-export`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            format,
            includeChatHistory: true,
            includeDocuments: true,
            includeProfile: true,
            includeActivityLogs: false,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ezlegal_data_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: 'Your data has been exported successfully' });
      loadDataRequests();
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to export data' });
    } finally {
      setDataExporting(false);
    }
  };

  const handleRequestDeletion = async (immediate: boolean = false) => {
    if (!user || deleteConfirmText !== 'DELETE') return;
    setDataDeleting(true);
    setMessage(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/data-deletion`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestType: 'chat_only',
            reason: 'User requested deletion',
            legalBasis: 'user_request',
            immediate,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Deletion request failed');
      }

      if (result.blockedByLegalHold) {
        setMessage({ type: 'error', text: result.message });
      } else if (result.status === 'scheduled') {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'success', text: 'Your data has been deleted successfully' });
      }

      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      loadDataRequests();
    } catch (error) {
      console.error('Deletion error:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to request deletion' });
    } finally {
      setDataDeleting(false);
    }
  };

  const handleCancelDeletion = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('data_deletion_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Deletion request cancelled' });
      loadDataRequests();
    } catch (error) {
      console.error('Cancel error:', error);
      setMessage({ type: 'error', text: 'Failed to cancel deletion request' });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2097152) {
      setMessage({ type: 'error', text: 'File size must be less than 2MB' });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Only JPEG, PNG, WebP, and GIF images are allowed' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const updatedProfileData = { ...profileData, avatar_url: publicUrl };
      setProfileData(updatedProfileData);

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
        });

      if (updateError) throw updateError;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile photo updated successfully' });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', text: 'Failed to upload photo' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900">{t('profile.title')}</h1>
          <p className="mt-2 text-navy-600">{t('profile.subtitle')}</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-navy-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-navy-600 hover:text-navy-900 hover:border-navy-300'
                }`}
              >
                <User className="w-5 h-5 inline-block mr-2" />
                {t('profile.tabProfile')}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-navy-600 hover:text-navy-900 hover:border-navy-300'
                }`}
              >
                <Bell className="w-5 h-5 inline-block mr-2" />
                {t('profile.tabPreferences')}
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'security'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-navy-600 hover:text-navy-900 hover:border-navy-300'
                }`}
              >
                <Lock className="w-5 h-5 inline-block mr-2" />
                {t('profile.tabSecurity')}
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'data'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-navy-600 hover:text-navy-900 hover:border-navy-300'
                }`}
              >
                <Shield className="w-5 h-5 inline-block mr-2" />
                {t('profile.tabData')}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-navy-200">
                  <div className="relative">
                    {profileData.avatar_url ? (
                      <img
                        src={profileData.avatar_url}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-navy-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-3xl font-semibold">
                        {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-navy-200 hover:bg-navy-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Upload photo"
                    >
                      <Camera className="w-4 h-4 text-navy-600" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-900">{t('profile.photoTitle')}</h3>
                    <p className="text-sm text-navy-600 mt-1">
                      {uploading ? t('profile.photoUploading') : t('profile.photoDesc')}
                    </p>
                    <p className="text-xs text-navy-500 mt-1">{t('profile.photoFormats')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <User className="w-4 h-4 inline-block mr-1" />
                      {t('profile.fullName')}
                    </label>
                    <input
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <Mail className="w-4 h-4 inline-block mr-1" />
                      {t('profile.emailAddress')}
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      inputMode="email"
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-navy-900"
                    />
                    <p className="mt-1 text-xs text-navy-500">
                      Changing your email sends a confirmation link to the new address. The change
                      takes effect after you confirm it.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <Phone className="w-4 h-4 inline-block mr-1" />
                      {t('profile.phoneNumber')}
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <Briefcase className="w-4 h-4 inline-block mr-1" />
                      {t('profile.jobTitle')}
                    </label>
                    <input
                      type="text"
                      value={profileData.job_title}
                      onChange={(e) => setProfileData({ ...profileData, job_title: e.target.value })}
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Senior Attorney"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <Building2 className="w-4 h-4 inline-block mr-1" />
                      {t('profile.company')}
                    </label>
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="ABC Organization"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <FileText className="w-4 h-4 inline-block mr-1" />
                      {t('profile.bio')}
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                      placeholder={t('profile.bioPlaceholder')}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-navy-200">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? t('profile.saving') : t('profile.saveChanges')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">{t('profile.notifTitle')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-navy-50 rounded-lg">
                      <div>
                        <div className="font-medium text-navy-900">{t('profile.emailNotif')}</div>
                        <div className="text-sm text-navy-600 mt-1">
                          {t('profile.emailNotifDesc')}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileData.notification_email}
                          onChange={(e) =>
                            setProfileData({ ...profileData, notification_email: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-navy-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-navy-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-navy-50 rounded-lg">
                      <div>
                        <div className="font-medium text-navy-900">{t('profile.smsNotif')}</div>
                        <div className="text-sm text-navy-600 mt-1">
                          {t('profile.smsNotifDesc')}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileData.notification_sms}
                          onChange={(e) =>
                            setProfileData({ ...profileData, notification_sms: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-navy-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-navy-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-navy-200">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? t('profile.saving') : t('profile.savePreferences')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">{t('profile.changePassword')}</h3>
                  <p className="text-sm text-navy-600 mb-6">
                    {t('profile.changePasswordDesc')}
                  </p>

                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        {t('profile.newPassword')}
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        {t('profile.confirmPassword')}
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleChangePassword}
                        disabled={saving || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        {saving ? t('profile.updating') : t('profile.updatePassword')}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-navy-200">
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">{t('profile.accountInfo')}</h3>
                  <div className="space-y-2 text-sm text-navy-600">
                    <p>
                      <span className="font-medium text-navy-700">{t('profile.accountId')}</span> {user?.id}
                    </p>
                    <p>
                      <span className="font-medium text-navy-700">{t('profile.emailLabel')}</span> {user?.email}
                    </p>
                    <p>
                      <span className="font-medium text-navy-700">{t('profile.accountCreated')}</span>{' '}
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-8">
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Shield className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-navy-900 mb-2">{t('profile.dataRights')}</h3>
                      <p className="text-sm text-navy-600">
                        {t('profile.dataRightsDesc')}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">{t('profile.exportTitle')}</h3>
                  <p className="text-sm text-navy-600 mb-4">
                    {t('profile.exportDesc')}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleExportData('json')}
                      disabled={dataExporting}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {dataExporting ? t('profile.exportingData') : t('profile.exportJSON')}
                    </button>
                    <button
                      onClick={() => handleExportData('csv')}
                      disabled={dataExporting}
                      className="px-4 py-2 bg-white text-navy-700 border border-navy-300 rounded-lg font-medium hover:bg-navy-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {dataExporting ? t('profile.exportingData') : t('profile.exportCSV')}
                    </button>
                  </div>

                  {exportRequests.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-navy-700 mb-2">{t('profile.recentExports')}</h4>
                      <div className="space-y-2">
                        {exportRequests.map((req) => (
                          <div key={req.id} className="flex items-center gap-3 text-sm text-navy-600 bg-navy-50 p-3 rounded-lg">
                            {req.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : req.status === 'failed' ? (
                              <XCircle className="w-4 h-4 text-red-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-600" />
                            )}
                            <span className="capitalize">{req.status}</span>
                            <span className="text-navy-400">-</span>
                            <span>{new Date(req.requested_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-navy-200">
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">{t('profile.dataRetention')}</h3>
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-navy-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-navy-500" />
                        <span className="font-medium text-navy-700">{t('profile.chatHistory')}</span>
                      </div>
                      <p className="text-sm text-navy-600">{t('profile.chatRetention')}</p>
                    </div>
                    <div className="bg-navy-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-navy-500" />
                        <span className="font-medium text-navy-700">{t('profile.documentsLabel')}</span>
                      </div>
                      <p className="text-sm text-navy-600">{t('profile.docRetention')}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-navy-200">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">{t('profile.deleteTitle')}</h3>
                  <p className="text-sm text-navy-600 mb-4">
                    {t('profile.deleteDesc')}
                  </p>

                  {deletionRequests.some(r => ['pending', 'verified', 'scheduled'].includes(r.status)) ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800">{t('profile.deletionPending')}</p>
                          {deletionRequests.filter(r => ['pending', 'verified', 'scheduled'].includes(r.status)).map((req) => (
                            <div key={req.id} className="mt-2 text-sm text-amber-700">
                              <p>
                                Status: <span className="capitalize font-medium">{req.status}</span>
                                {req.scheduled_for && (
                                  <> - Scheduled for {new Date(req.scheduled_for).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}</>
                                )}
                              </p>
                              <button
                                onClick={() => handleCancelDeletion(req.id)}
                                className="mt-2 text-amber-800 underline hover:no-underline"
                              >
                                {t('profile.cancelRequest')}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : !showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('profile.requestDeletion')}
                    </button>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-800">{t('profile.confirmDeletion')}</p>
                          <p className="text-sm text-red-700 mt-1">
                            {t('profile.confirmDeletionDesc')}
                          </p>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder='Type "DELETE" to confirm'
                        className="w-full max-w-xs px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                      />
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleRequestDeletion(false)}
                          disabled={dataDeleting || deleteConfirmText !== 'DELETE'}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Clock className="w-4 h-4" />
                          {dataDeleting ? t('profile.processing') : t('profile.scheduleDeletion')}
                        </button>
                        <button
                          onClick={() => handleRequestDeletion(true)}
                          disabled={dataDeleting || deleteConfirmText !== 'DELETE'}
                          className="px-4 py-2 bg-red-800 text-white rounded-lg font-medium hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          {dataDeleting ? t('profile.processing') : t('profile.deleteImmediately')}
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText('');
                          }}
                          className="px-4 py-2 bg-white text-navy-700 border border-navy-300 rounded-lg font-medium hover:bg-navy-50 transition-colors"
                        >
                          {t('profile.cancel')}
                        </button>
                      </div>
                    </div>
                  )}

                  {deletionRequests.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-navy-700 mb-2">{t('profile.deletionHistory')}</h4>
                      <div className="space-y-2">
                        {deletionRequests.map((req) => (
                          <div key={req.id} className="flex items-center gap-3 text-sm text-navy-600 bg-navy-50 p-3 rounded-lg">
                            {req.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : req.status === 'blocked' ? (
                              <XCircle className="w-4 h-4 text-red-600" />
                            ) : req.status === 'cancelled' ? (
                              <XCircle className="w-4 h-4 text-navy-400" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-600" />
                            )}
                            <span className="capitalize">{req.status}</span>
                            <span className="text-navy-400">-</span>
                            <span className="capitalize">{req.request_type.replace('_', ' ')}</span>
                            <span className="text-navy-400">-</span>
                            <span>{new Date(req.created_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
