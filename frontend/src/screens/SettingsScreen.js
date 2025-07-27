import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [user] = useState(auth.currentUser);

  const simulateManageSubscriptions = () => {
    // In the iOS app, this would call: Purchases.showManageSubscriptions()
    alert(
      'Manage Subscriptions\n\n' +
      'This would open your device\'s subscription management screen.\n\n' +
      'On iOS: Settings → Apple ID → Subscriptions → Thrifter\'s Eye\n\n' +
      'This allows you to cancel, modify, or view your subscription details.'
    );
  };

  return (
    <div className={`min-h-screen ${theme.colors.backgroundSecondary}`}>
      {/* Header */}
      <div className={`${theme.colors.surface} shadow-sm ${theme.colors.border} border-b`}>
        <div className="container mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="text-purple-600 hover:text-purple-800 font-semibold"
          >
            ← Back to Home
          </button>
          <h1 className={`flex-1 text-center text-xl font-bold ${theme.colors.text}`}>Settings</h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        
        {/* Theme Toggle */}
        <div className={`${theme.colors.surface} rounded-lg shadow-lg p-6 mb-6 border ${theme.colors.border}`}>
          <h2 className={`text-xl font-bold ${theme.colors.text} mb-4`}>Appearance</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{isDark ? '🌙' : '☀️'}</span>
              <div>
                <h3 className={`font-semibold ${theme.colors.text}`}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </h3>
                <p className={`${theme.colors.textSecondary} text-sm`}>
                  Choose your preferred theme
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDark ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDark ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Account Status */}
        <div className={`${theme.colors.surface} rounded-lg shadow-lg p-6 mb-6 border ${theme.colors.border}`}>
          <h2 className={`text-xl font-bold ${theme.colors.text} mb-4`}>Account Status</h2>
          <div className={`${theme.colors.backgroundTertiary} rounded-lg p-4`}>
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">👤</span>
              <div>
                <h3 className={`font-semibold ${theme.colors.text}`}>
                  Anonymous Account
                </h3>
                <p className={`${theme.colors.textSecondary} text-sm`}>
                  Your scan history is private and secure
                </p>
              </div>
            </div>
            <p className={`text-xs ${theme.colors.textMuted} font-mono mt-2`}>
              Session ID: {user?.uid?.substr(0, 8)}...
            </p>
          </div>
        </div>

        {/* Subscription Management */}
        <div className={`${theme.colors.surface} rounded-lg shadow-lg p-6 mb-6 border ${theme.colors.border}`}>
          <h2 className={`text-xl font-bold ${theme.colors.text} mb-4`}>Subscription</h2>
          
          <button
            onClick={simulateManageSubscriptions}
            disabled={loading}
            className={`w-full ${theme.colors.primary} ${theme.colors.primaryText} font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50`}
          >
            ⚙️ Manage Subscription
          </button>
        </div>

        {/* App Information */}
        <div className={`${theme.colors.surface} rounded-lg shadow-lg p-6 border ${theme.colors.border}`}>
          <h2 className={`text-xl font-bold ${theme.colors.text} mb-4`}>App Information</h2>
          <div className={`${theme.colors.textSecondary} space-y-1`}>
            <p>Thrifter's Eye v1.0</p>
            <p>AI-powered item identification & valuation</p>
            <p>Theme: {isDark ? 'Dark Mode' : 'Light Mode'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}