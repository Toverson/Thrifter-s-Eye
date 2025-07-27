import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { UserService } from '../services/UserService';
import { LocationService } from '../services/LocationService';
import { CurrencyService } from '../services/CurrencyService';
import { useTheme } from '../contexts/ThemeContext';

export default function PaywallScreen() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [pricing, setPricing] = useState({
    formatted: '$9.59', // Fallback price
    originalCAD: '$12.99',
    currencyCode: 'USD'
  });
  const [loading, setLoading] = useState(true);

  const simulateProUpgrade = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await UserService.updateProStatus(user.uid, true);
        alert('Pro upgrade successful! (This is a web demo - in the real app, this would use RevenueCat)');
        navigate('/');
      }
    } catch (error) {
      console.error('Pro upgrade error:', error);
      alert('Failed to upgrade to Pro. Please try again.');
    }
  };

  // Load user's location and calculate pricing
  useEffect(() => {
    const loadPricing = async () => {
      try {
        console.log('💰 PaywallScreen: Loading user location for pricing...');
        
        // Get user's location
        const userLocation = await LocationService.getCurrentLocation();
        console.log('📍 PaywallScreen: User location:', userLocation);
        
        // Get user's currency
        const userCurrency = CurrencyService.getUserCurrency(userLocation);
        console.log('💰 PaywallScreen: User currency:', userCurrency);
        
        // Convert price to user's currency
        const convertedPricing = CurrencyService.convertPrice(userCurrency);
        console.log('💰 PaywallScreen: Converted pricing:', convertedPricing);
        
        setPricing(convertedPricing);
      } catch (error) {
        console.error('❌ PaywallScreen: Error loading pricing:', error);
        
        // Fallback to USD pricing
        const fallbackPricing = CurrencyService.convertPrice('USD');
        setPricing(fallbackPricing);
      } finally {
        setLoading(false);
      }
    };
    
    loadPricing();
  }, []);

  const features = [
    '📷 Unlimited item scans',
    '💎 Premium AI analysis',
    '📊 Advanced market insights',
    '🏷️ Detailed listing recommendations',
    '📈 Price history tracking',
    '🔄 Scan history backup',
  ];

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
          <h1 className={`flex-1 text-center text-xl font-bold ${theme.colors.text}`}>Upgrade to Pro</h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">💎</div>
          <h2 className={`text-4xl font-bold ${theme.colors.text} mb-4`}>
            Unlock Pro Features
          </h2>
          <p className={`text-xl ${theme.colors.textSecondary} mb-8`}>
            You've used all 5 free scans. Upgrade to Pro for unlimited access and premium features.
          </p>
        </div>

        {/* Pricing Card */}
        <div className={`${theme.colors.surface} rounded-lg shadow-xl p-8 mb-8 ${theme.colors.border} border`}>
          <div className="text-center mb-8">
            <h3 className={`text-2xl font-bold ${theme.colors.text} mb-2`}>Thrifter's Eye Pro</h3>
            
            {loading ? (
              <div className="flex items-baseline justify-center">
                <div className="animate-pulse bg-gray-300 h-10 w-24 rounded"></div>
                <span className={`text-lg ${theme.colors.textSecondary} ml-2`}>/month</span>
              </div>
            ) : (
              <>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-green-600">{pricing.formatted}</span>
                  <span className={`text-lg ${theme.colors.textSecondary} ml-2`}>/month</span>
                </div>
                
                {pricing.currencyCode !== 'CAD' && (
                  <p className={`text-sm ${theme.colors.textMuted} mt-1`}>
                    Original price: {pricing.originalCAD} CAD/month
                  </p>
                )}
                
                <p className={`text-sm ${theme.colors.textMuted} mt-2`}>
                  Cancel anytime • {pricing.currencyCode}
                </p>
              </>
            )}
          </div>

          {/* Features List */}
          <div className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className={theme.colors.text}>{feature}</span>
              </div>
            ))}
          </div>

          {/* Upgrade Button */}
          <button
            onClick={simulateProUpgrade}
            className={`w-full ${theme.colors.success} text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl`}
          >
            🚀 Upgrade to Pro Now
          </button>

          <p className={`text-xs ${theme.colors.textMuted} text-center mt-4`}>
            In the actual iOS app, this would integrate with RevenueCat for subscription management
          </p>
        </div>

        {/* Value Proposition */}
        <div className={`${theme.colors.surface} rounded-lg p-6 ${theme.colors.border} border`}>
          <h4 className={`font-bold ${theme.colors.text} mb-3`}>Why Upgrade?</h4>
          <div className={`space-y-2 text-sm ${theme.colors.textSecondary}`}>
            <p>• <strong>Save Money:</strong> Find valuable items others miss</p>
            <p>• <strong>Make Money:</strong> Price items correctly for maximum profit</p>
            <p>• <strong>Save Time:</strong> Instant AI-powered identification and valuation</p>
            <p>• <strong>Stay Ahead:</strong> Advanced market insights keep you competitive</p>
          </div>
        </div>

        {/* Free Trial Info */}
        <div className="text-center mt-8">
          <p className={`text-sm ${theme.colors.textMuted}`}>
            Your free trial included 5 scans. Upgrade now to continue discovering hidden treasures!
          </p>
        </div>
      </div>
    </div>
  );
}