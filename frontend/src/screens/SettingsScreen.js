import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, linkWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { UserService } from '../services/UserService';

export default function SettingsScreen() {
  const navigate = useNavigate();
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

  const simulateRestorePurchases = async () => {
    try {
      setLoading(true);
      // Simulate restore purchases for web testing
      await UserService.updateProStatus(user.uid, true);
      alert('Purchases restored! (This is a web demo - in the real app, this would use RevenueCat)');
    } catch (error) {
      console.error('Restore error:', error);
      alert('Failed to restore purchases.');
    } finally {
      setLoading(false);
    }
  };

  const isAnonymous = user?.isAnonymous;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="text-purple-600 hover:text-purple-800 font-semibold"
          >
            ← Back to Home
          </button>
          <h1 className="flex-1 text-center text-xl font-bold">Settings</h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Account Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Account Status</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">{isAnonymous ? '👤' : '🔐'}</span>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {isAnonymous ? 'Anonymous Account' : 'Permanent Account'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isAnonymous 
                    ? 'Your data is saved locally but not backed up.'
                    : 'Your account is protected and backed up.'}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-2">
              User ID: {user?.uid?.substr(0, 8)}...
            </p>
          </div>
        </div>

        {/* Account Protection */}
        {isAnonymous && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Protect Your Scans</h2>
            <p className="text-gray-600 mb-6">
              Create a permanent account to protect your scan history and subscription across devices.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={linkWithEmailPassword}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
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

        {/* Purchases */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Purchases</h2>
          
          <button
            onClick={simulateRestorePurchases}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 mb-3"
          >
            🔄 Restore Purchases (Demo)
          </button>
          
          <p className="text-gray-600 text-sm">
            In the actual iOS app, this would restore your subscription from the App Store via RevenueCat.
          </p>
        </div>

        {/* Web Testing Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-blue-800 mb-3">Web Testing Mode</h2>
          <div className="space-y-2 text-sm text-blue-700">
            <p>• Anonymous authentication is working correctly</p>
            <p>• All Firestore operations use your anonymous user ID</p>
            <p>• Account linking simulates the iOS app flow</p>
            <p>• RevenueCat features are simulated for web testing</p>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">App Information</h2>
          <div className="text-gray-600 space-y-1">
            <p>Thrifter's Eye v1.0</p>
            <p>AI-powered item identification</p>
            <p>Web testing version mirroring iOS app</p>
          </div>
        </div>
      </div>
    </div>
  );
}