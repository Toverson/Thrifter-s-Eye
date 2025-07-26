import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { UserService } from '../services/UserService';

export default function PaywallScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    
    // For web testing, simulate successful upgrade
    try {
      // In the actual React Native app, this would integrate with RevenueCat
      const user = auth.currentUser;
      if (user) {
        await UserService.updateProStatus(user.uid, true);
        alert('Success! You now have unlimited scans. (This is a web demo - in the real app, this would use RevenueCat for payments)');
        navigate('/');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const restorePurchases = () => {
    alert('Restore purchases functionality would be handled by RevenueCat in the native app.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:text-blue-200 font-semibold mb-4 block"
          >
            ← Back to Home
          </button>
        </div>

        {/* Main content */}
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
              <span className="text-4xl">👁️</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Thrifter's Eye Pro</h1>
          </div>

          {/* Limit message */}
          <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-3">You've reached your limit</h2>
            <p className="text-blue-100 text-lg">
              Free users can scan up to 5 items. Upgrade to Pro for unlimited scanning!
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-6">Pro Benefits</h3>
            
            <div className="grid gap-4">
              <div className="flex items-center text-left">
                <span className="text-2xl mr-4">🔄</span>
                <div>
                  <h4 className="font-semibold text-white">Unlimited item scans</h4>
                  <p className="text-blue-100 text-sm">Scan as many items as you want</p>
                </div>
              </div>
              
              <div className="flex items-center text-left">
                <span className="text-2xl mr-4">🌍</span>
                <div>
                  <h4 className="font-semibold text-white">Global marketplace pricing</h4>
                  <p className="text-blue-100 text-sm">Accurate pricing for your location</p>
                </div>
              </div>
              
              <div className="flex items-center text-left">
                <span className="text-2xl mr-4">🎯</span>
                <div>
                  <h4 className="font-semibold text-white">Enhanced AI accuracy</h4>
                  <p className="text-blue-100 text-sm">More detailed analysis and insights</p>
                </div>
              </div>
              
              <div className="flex items-center text-left">
                <span className="text-2xl mr-4">⚡</span>
                <div>
                  <h4 className="font-semibold text-white">Priority processing</h4>
                  <p className="text-blue-100 text-sm">Faster scan results</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing notice */}
          <div className="bg-yellow-500 bg-opacity-20 border border-yellow-400 rounded-lg p-4 mb-8">
            <h3 className="font-bold text-yellow-100 mb-2">Web Demo Notice</h3>
            <p className="text-yellow-100 text-sm">
              This is a web demo. In the actual iOS app, payments are handled securely through RevenueCat and the App Store.
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-purple-600 font-bold py-4 px-8 rounded-full text-xl shadow-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : '⭐ Upgrade to Pro (Demo)'}
            </button>
            
            <button
              onClick={restorePurchases}
              className="w-full bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full transition-colors hover:bg-white hover:text-purple-600"
            >
              Restore Purchases
            </button>
          </div>

          {/* Terms */}
          <div className="mt-8">
            <p className="text-blue-100 text-xs leading-relaxed">
              In the actual app: Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}