import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, linkWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { UserService } from '../services/UserService';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [user] = useState(auth.currentUser);

  const linkWithEmailPassword = async () => {
    const email = prompt('Enter your email:');
    if (!email) return;

    const password = prompt('Enter a password:');
    if (!password) return;

    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(user, credential);
      alert('Account linked successfully! Your anonymous account has been upgraded to a permanent account.');
    } catch (error) {
      console.error('Account linking error:', error);
      alert('Failed to link account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const linkWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const credential = result.credential;
      
      if (credential) {
        await linkWithCredential(user, credential);
        alert('Google account linked successfully! Your anonymous account has been upgraded.');
      }
    } catch (error) {
      console.error('Google linking error:', error);
      alert('Failed to link Google account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const simulateManageSubscriptions = () => {
    // In the iOS app, this would call: Purchases.showManageSubscriptions()
    alert(
      'Manage Subscriptions\n\n' +
      'This would open your device\'s subscription management screen.\n\n' +
      'On iOS: Settings → Apple ID → Subscriptions → Thrifter\'s Eye\n\n' +
      'This allows you to cancel, modify, or view your subscription details.'
    );
  };

  const isAnonymous = user?.isAnonymous;

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
              <span className="text-2xl mr-3">{isAnonymous ? '👤' : '🔐'}</span>
              <div>
                <h3 className={`font-semibold ${theme.colors.text}`}>
                  {isAnonymous ? 'Anonymous Account' : 'Permanent Account'}
                </h3>
                <p className={`${theme.colors.textSecondary} text-sm`}>
                  {isAnonymous 
                    ? 'Your data is saved locally but not backed up.'
                    : 'Your account is protected and backed up.'}
                </p>
              </div>
            </div>
            <p className={`text-xs ${theme.colors.textMuted} font-mono mt-2`}>
              User ID: {user?.uid?.substr(0, 8)}...
            </p>
          </div>
        </div>

        {/* Account Protection */}
        {isAnonymous && (
          <div className={`${theme.colors.surface} rounded-lg shadow-lg p-6 mb-6 border ${theme.colors.border}`}>
            <h2 className={`text-xl font-bold ${theme.colors.text} mb-4`}>Protect Your Scans</h2>
            <p className={`${theme.colors.textSecondary} mb-6`}>
              Create a permanent account to protect your scan history and subscription across devices.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={linkWithEmailPassword}
                disabled={loading}
                className={`w-full ${theme.colors.primary} ${theme.colors.primaryText} font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50`}
              >
                📧 Link with Email & Password
              </button>
              
              <button
                onClick={linkWithGoogle}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                🔗 Link with Google
              </button>
            </div>
          </div>
        )}

        {/* Subscription Management */}
        <div className={`${theme.colors.surface} rounded-lg shadow-lg p-6 mb-6 border ${theme.colors.border}`}>
          <h2 className={`text-xl font-bold ${theme.colors.text} mb-4`}>Subscription</h2>
          
          <div className="space-y-3">
            <button
              onClick={simulateManageSubscriptions}
              disabled={loading}
              className={`w-full ${theme.colors.primary} ${theme.colors.primaryText} font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50`}
            >
              ⚙️ Manage Subscription
            </button>
            
            <button
              onClick={simulateRestorePurchases}
              disabled={loading}
              className={`w-full ${theme.colors.success} text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50`}
            >
              🔄 Restore Purchases (Demo)
            </button>
          </div>
          
          <p className={`${theme.colors.textSecondary} text-sm mt-4`}>
            <strong>iOS App Behavior:</strong><br/>
            • "Manage Subscription" opens your device's Apple ID subscription management<br/>
            • "Restore Purchases" syncs your subscription status with RevenueCat
          </p>
        </div>

        {/* Web Testing Info */}
        <div className={`${isDark ? 'bg-blue-900' : 'bg-blue-50'} ${isDark ? 'border-blue-700' : 'border-blue-200'} border rounded-lg p-6 mb-6`}>
          <h2 className={`text-lg font-bold ${isDark ? 'text-blue-300' : 'text-blue-800'} mb-3`}>Web Testing Mode</h2>
          <div className={`space-y-2 text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
            <p>• Anonymous authentication is working correctly</p>
            <p>• All Firestore operations use your anonymous user ID</p>
            <p>• Account linking simulates the iOS app flow</p>
            <p>• RevenueCat features are simulated for web testing</p>
            <p>• Theme switching persists across sessions</p>
          </div>
        </div>

        {/* App Info */}
        <div className={`${theme.colors.surface} rounded-lg shadow-lg p-6 border ${theme.colors.border}`}>
          <h2 className={`text-xl font-bold ${theme.colors.text} mb-4`}>App Information</h2>
          <div className={`${theme.colors.textSecondary} space-y-1`}>
            <p>Thrifter's Eye v1.0</p>
            <p>AI-powered item identification</p>
            <p>Web testing version mirroring iOS app</p>
            <p>Theme: {isDark ? 'Dark Mode' : 'Light Mode'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}