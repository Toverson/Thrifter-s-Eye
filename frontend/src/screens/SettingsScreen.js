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