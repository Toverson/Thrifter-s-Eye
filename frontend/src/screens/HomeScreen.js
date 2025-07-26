import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { UserService } from '../services/UserService';
import { LocationService } from '../services/LocationService';
import { useTheme } from '../contexts/ThemeContext';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    getCurrentLocation();
  }, []);

  const loadUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const data = await UserService.getUserData(user.uid);
      setUserData(data);
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    const locationData = await LocationService.getCurrentLocation();
    setLocation(locationData);
  };

  const handleScanPress = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // Check if user can scan
    const canScan = await UserService.canUserScan(user.uid);
    
    if (!canScan) {
      // Redirect to paywall
      navigate('/paywall');
      return;
    }

    // Navigate to camera with location data
    navigate('/camera', { state: { location } });
  };

  const getScanCountDisplay = () => {
    if (!userData) return '';
    
    if (userData.isProSubscriber) {
      return 'Pro - Unlimited Scans';
    } else {
      const remaining = Math.max(0, 5 - userData.scanCount);
      return `${remaining} free scans remaining`;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.colors.gradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 py-8">
        {/* Header with settings */}
        <div className="flex justify-between items-center mb-8">
          <div></div>
          <button
            onClick={() => navigate('/settings')}
            className="text-white hover:text-blue-200 text-2xl p-2"
            title="Settings"
          >
            ⚙️
          </button>
        </div>

        {/* Main content */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
              <span className="text-5xl">👁️</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Thrifter's Eye</h1>
          <p className="text-xl text-blue-100 mb-6">AI-powered item identification and valuation</p>
          
          {/* Anonymous session indicator */}
          <div className="inline-block bg-white bg-opacity-20 px-4 py-2 rounded-full mb-4">
            <span className="text-white text-sm">🔒 Anonymous Session Active</span>
          </div>
          
          {/* Location indicator */}
          {location && (
            <div className="inline-block bg-white bg-opacity-20 px-4 py-2 rounded-full mb-4 ml-2">
              <span className="text-white">📍 {location.countryCode} • Pricing in {location.currencyCode}</span>
            </div>
          )}
        </div>

        {/* User status */}
        <div className="text-center mb-8">
          <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
            <p className="text-white font-semibold">{getScanCountDisplay()}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="max-w-md mx-auto space-y-4">
          <button
            onClick={handleScanPress}
            className="w-full bg-white hover:bg-gray-100 text-purple-600 font-bold py-4 px-8 rounded-full text-xl shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            📸 Scan Item
          </button>
          
          <button
            onClick={() => navigate('/history')}
            className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-200"
          >
            📋 View History
          </button>
        </div>

        {/* Web testing info */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg p-4">
            <h3 className="font-bold text-blue-100 mb-2">Web Testing Mode</h3>
            <p className="text-blue-100 text-sm">
              You're now using anonymous authentication - the same flow as the iOS app. 
              Your session ID: <code className="bg-black bg-opacity-20 px-1 rounded text-xs">
                {auth.currentUser?.uid?.substr(0, 8)}...
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}