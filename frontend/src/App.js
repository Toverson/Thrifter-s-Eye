import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');

  const showAlert = (title, message) => {
    alert(`${title}: ${message}`);
  };

  const HomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
              <span className="text-5xl">👁️</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Thrifter's Eye</h1>
          <div className="inline-block bg-white bg-opacity-20 px-4 py-2 rounded-full mb-4">
            <span className="text-white font-semibold">React Native v1.0</span>
          </div>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            AI-powered item identification and valuation - Now available as a native iOS app!
          </p>
        </div>

        {/* Upgrade Notice */}
        <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-lg p-8 mb-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">📱 Native iOS App Preview</h2>
          <p className="text-white text-center mb-6">
            This is a web preview of the React Native iOS app. The actual mobile app has been completely rebuilt with:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="text-lg font-bold text-white mb-2">Geolocation-Aware Pricing</h3>
              <p className="text-blue-100 text-sm">
                Automatically detects your location and provides pricing in your local currency (USD, CAD, GBP, EUR, etc.)
              </p>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="text-lg font-bold text-white mb-2">Freemium Subscription</h3>
              <p className="text-blue-100 text-sm">
                5 free scans for new users, unlimited scans with Pro subscription via RevenueCat
              </p>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <div className="text-3xl mb-3">🔥</div>
              <h3 className="text-lg font-bold text-white mb-2">Firebase Backend</h3>
              <p className="text-blue-100 text-sm">
                Cloud Functions, Firestore database, Firebase Authentication, and real-time sync
              </p>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-lg font-bold text-white mb-2">Native iOS Experience</h3>
              <p className="text-blue-100 text-sm">
                Built with React Native for true native performance and App Store distribution
              </p>
            </div>
          </div>
        </div>

        {/* Demo Buttons */}
        <div className="max-w-md mx-auto space-y-4 mb-8">
          <button
            onClick={() => showAlert('Camera', 'In the native app, this opens the camera to scan items with location-aware pricing')}
            className="w-full bg-white hover:bg-gray-100 text-purple-600 font-bold py-4 px-8 rounded-full text-xl shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            📸 Scan Item (Demo)
          </button>
          
          <button
            onClick={() => showAlert('History', 'In the native app, this shows your scan history with Firestore integration and user-specific filtering')}
            className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-200"
          >
            📋 View History (Demo)
          </button>

          <button
            onClick={() => showAlert('Pro Upgrade', 'In the native app, this shows the RevenueCat paywall for Pro subscription with unlimited scans')}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-200"
          >
            ⭐ Upgrade to Pro (Demo)
          </button>
        </div>

        {/* Architecture */}
        <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-lg p-8 mb-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">🏗️ Technical Architecture</h2>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-xs text-blue-200 mb-1">Frontend</div>
              <div className="text-sm font-bold text-white">React Native</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-xs text-blue-200 mb-1">Backend</div>
              <div className="text-sm font-bold text-white">Firebase Functions</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-xs text-blue-200 mb-1">Database</div>
              <div className="text-sm font-bold text-white">Firestore</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-xs text-blue-200 mb-1">Auth</div>
              <div className="text-sm font-bold text-white">Firebase Auth</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-xs text-blue-200 mb-1">Payments</div>
              <div className="text-sm font-bold text-white">RevenueCat</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-xs text-blue-200 mb-1">AI</div>
              <div className="text-sm font-bold text-white">Vision + Gemini</div>
            </div>
          </div>
        </div>

        {/* Deployment Status */}
        <div className="bg-green-500 bg-opacity-20 border border-green-400 rounded-lg p-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4 text-center">🚀 Deployment Ready</h2>
          <div className="text-white space-y-2 text-sm">
            <div>✅ iOS app configured for App Store distribution</div>
            <div>✅ Firebase project set up with Cloud Functions</div>
            <div>✅ RevenueCat subscription system integrated</div>
            <div>✅ Google APIs configured (Vision, Search, Gemini)</div>
            <div>✅ User authentication and data management ready</div>
            <div>✅ Geolocation-aware content and pricing</div>
            <div>✅ User-specific scan history with Firestore</div>
            <div>✅ Freemium model with 5 free scans</div>
          </div>
        </div>

        {/* Migration Note */}
        <div className="text-center mt-8">
          <div className="bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-blue-100 text-sm">
              <strong>Migration Complete:</strong> Successfully upgraded from React Web + FastAPI + MongoDB 
              to React Native iOS + Firebase + Cloud Functions with all requested features implemented.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      <HomeScreen />
    </div>
  );
}

export default App;