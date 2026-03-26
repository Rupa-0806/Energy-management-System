import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  Bell,
  Palette,
  Save,
  Loader,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor,
  Mail,
  Phone,
  Camera,
  Lock,
  Key,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';
import authApi from '../services/api/authApi';
import { STORAGE_KEYS, USER_ROLES } from '../utils/constants';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

// Tab configuration
const TABS = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Manage your personal information' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Password and authentication' },
  { id: 'preferences', label: 'Preferences', icon: Palette, description: 'Appearance and notifications' },
];

// Form input component
const FormInput = ({ label, icon: Icon, error, type = 'text', required, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label} {required && <span className="text-danger-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            size={18}
          />
        )}
        <input
          {...props}
          type={isPassword && showPassword ? 'text' : type}
          className={cn(
            'w-full py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700/50 dark:text-white transition-all duration-200',
            Icon ? 'pl-10' : 'pl-4',
            isPassword ? 'pr-10' : 'pr-4',
            error
              ? 'border-danger-500 focus:ring-danger-500'
              : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-danger-500 text-xs mt-1 flex items-center gap-1"
        >
          <AlertCircle size={12} />
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Toggle switch component
const ToggleSwitch = ({ label, description, checked, onChange, disabled }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
    <div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-primary-500' : 'bg-gray-300 dark:bg-slate-600',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  </div>
);

// Theme selector component
const ThemeSelector = ({ value, onChange }) => {
  const themes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {themes.map((theme) => {
        const ThemeIcon = theme.icon;
        const isSelected = value === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => onChange(theme.id)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
              isSelected
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
            )}
          >
            <ThemeIcon
              size={24}
              className={cn(isSelected ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400')}
            />
            <span
              className={cn(
                'text-sm font-medium',
                isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
              )}
            >
              {theme.label}
            </span>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center"
              >
                <Check size={12} className="text-white" />
              </motion.div>
            )}
          </button>
        );
      })}
    </div>
  );
};

// Profile Tab Content
const ProfileTab = ({ user, onSave, loading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
      setHasChanges(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {formData.firstName?.[0]?.toUpperCase() || 'U'}
            {formData.lastName?.[0]?.toUpperCase() || ''}
          </div>
          <button
            type="button"
            className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
          >
            <Camera size={14} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {formData.firstName} {formData.lastName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{formData.email}</p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 mt-2">
            {user?.role || 'USER'}
          </span>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          icon={User}
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="John"
          error={errors.firstName}
          required
        />
        <FormInput
          label="Last Name"
          icon={User}
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Doe"
          error={errors.lastName}
          required
        />
        <FormInput
          label="Email Address"
          icon={Mail}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
          error={errors.email}
          required
        />
        <FormInput
          label="Phone Number"
          icon={Phone}
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="+1 (555) 123-4567"
          error={errors.phoneNumber}
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={loading} disabled={!hasChanges || loading}>
          <Save size={18} />
          Save Changes
        </Button>
      </div>
    </form>
  );
};

// Security Tab Content
const SecurityTab = ({ onChangePassword, loading }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    else if (formData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    else if (!/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, number, and special character';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onChangePassword(formData.currentPassword, formData.newPassword);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Change Password Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-warning-100 dark:bg-warning-900/50 rounded-xl flex items-center justify-center">
            <Key className="w-5 h-5 text-warning-600 dark:text-warning-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Update your password regularly for security</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <FormInput
            label="Current Password"
            icon={Lock}
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleChange}
            placeholder="Enter current password"
            error={errors.currentPassword}
            required
          />
          <FormInput
            label="New Password"
            icon={Lock}
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
            error={errors.newPassword}
            required
          />
          <FormInput
            label="Confirm New Password"
            icon={Lock}
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
            error={errors.confirmPassword}
            required
          />
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>
            <Shield size={18} />
            Update Password
          </Button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-success-100 dark:bg-success-900/50 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-success-600 dark:text-success-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
          </div>
        </div>
        <ToggleSwitch
          label="Enable 2FA"
          description="Require a verification code when signing in"
          checked={false}
          onChange={() => toast('Two-factor authentication setup coming soon')}
        />
      </div>

      {/* Active Sessions */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
              <Monitor className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Sessions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your active login sessions</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => toast('Session management coming soon')}>
            View All
          </Button>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor size={20} className="text-success-500" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Session</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {navigator.userAgent.includes('Windows') ? 'Windows' : 'Mac'} • {navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser'}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/50 text-success-700 dark:text-success-300">
              Active Now
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Preferences Tab Content
const PreferencesTab = ({ preferences, onSave }) => {
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const handleChange = (key, value) => {
    setLocalPrefs((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(localPrefs);
    setHasChanges(false);
  };

  return (
    <div className="space-y-8">
      {/* Theme Selection */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Customize how the app looks</p>
          </div>
        </div>
        <ThemeSelector
          value={localPrefs.theme}
          onChange={(theme) => handleChange('theme', theme)}
        />
      </div>

      {/* Notification Settings */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Configure how you receive alerts</p>
          </div>
        </div>
        <div className="space-y-3">
          <ToggleSwitch
            label="Email Notifications"
            description="Receive alerts and updates via email"
            checked={localPrefs.emailNotifications}
            onChange={(value) => handleChange('emailNotifications', value)}
          />
          <ToggleSwitch
            label="Push Notifications"
            description="Receive browser push notifications"
            checked={localPrefs.pushNotifications}
            onChange={(value) => handleChange('pushNotifications', value)}
          />
          <ToggleSwitch
            label="Alert Sounds"
            description="Play sound for critical alerts"
            checked={localPrefs.alertSounds}
            onChange={(value) => handleChange('alertSounds', value)}
          />
          <ToggleSwitch
            label="Daily Digest"
            description="Receive a daily summary email"
            checked={localPrefs.dailyDigest}
            onChange={(value) => handleChange('dailyDigest', value)}
          />
        </div>
      </div>

      {/* Data & Display Settings */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/50 rounded-xl flex items-center justify-center">
            <Monitor className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Display</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Configure data display preferences</p>
          </div>
        </div>
        <div className="space-y-3">
          <ToggleSwitch
            label="Compact Mode"
            description="Use compact layout for tables and lists"
            checked={localPrefs.compactMode}
            onChange={(value) => handleChange('compactMode', value)}
          />
          <ToggleSwitch
            label="Show Tooltips"
            description="Display helpful tooltips on hover"
            checked={localPrefs.showTooltips}
            onChange={(value) => handleChange('showTooltips', value)}
          />
          <ToggleSwitch
            label="Auto-refresh Data"
            description="Automatically refresh dashboard data"
            checked={localPrefs.autoRefresh}
            onChange={(value) => handleChange('autoRefresh', value)}
          />
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end pt-4"
        >
          <Button variant="primary" onClick={handleSave}>
            <Save size={18} />
            Save Preferences
          </Button>
        </motion.div>
      )}
    </div>
  );
};

// Main Settings Page Component
export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    theme: localStorage.getItem(STORAGE_KEYS.THEME) || 'system',
    emailNotifications: true,
    pushNotifications: true,
    alertSounds: true,
    dailyDigest: false,
    compactMode: false,
    showTooltips: true,
    autoRefresh: true,
  });

  // Load saved preferences
  useEffect(() => {
    const savedPrefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (savedPrefs) {
      try {
        setPreferences((prev) => ({ ...prev, ...JSON.parse(savedPrefs) }));
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
    }
  }, []);

  const handleProfileSave = async (profileData) => {
    try {
      setLoading(true);
      const updatedUser = await authApi.updateProfile(profileData);
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (oldPassword, newPassword) => {
    try {
      setLoading(true);
      await authApi.changePassword(oldPassword, newPassword);
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSave = (newPrefs) => {
    setPreferences(newPrefs);
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(newPrefs));

    // Apply theme immediately
    if (newPrefs.theme !== preferences.theme) {
      const root = document.documentElement;
      if (newPrefs.theme === 'dark') {
        root.classList.add('dark');
        localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
      } else if (newPrefs.theme === 'light') {
        root.classList.remove('dark');
        localStorage.setItem(STORAGE_KEYS.THEME, 'light');
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
        localStorage.setItem(STORAGE_KEYS.THEME, 'system');
      }
    }

    toast.success('Preferences saved');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab user={user} onSave={handleProfileSave} loading={loading} />;
      case 'security':
        return <SecurityTab onChangePassword={handleChangePassword} loading={loading} />;
      case 'preferences':
        return <PreferencesTab preferences={preferences} onSave={handlePreferencesSave} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <nav className="space-y-1">
              {TABS.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left',
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                    )}
                  >
                    <TabIcon size={20} />
                    <div>
                      <p className={cn('font-medium', isActive && 'text-primary-600 dark:text-primary-400')}>
                        {tab.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 hidden sm:block">
                        {tab.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          <Card>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </div>
  );
}
