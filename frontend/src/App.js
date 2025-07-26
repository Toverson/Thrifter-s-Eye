import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';
import { UserService } from './services/UserService';

// Import screens
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import LoadingScreen from './screens/LoadingScreen';
import ResultsScreen from './screens/ResultsScreen';
import HistoryScreen from './screens/HistoryScreen';
import PaywallScreen from './screens/PaywallScreen';
import SettingsScreen from './screens/SettingsScreen';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authAttempted, setAuthAttempted] = useState(false);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User signed in: ${user.uid}` : 'No user');
      
      if (user) {
        console.log('User details:', {
          uid: user.uid,
          isAnonymous: user.isAnonymous,
          email: user.email
        });
        
        try {
          // Create user document if it doesn't exist
          await UserService.createUserIfNotExists(user.uid, user.email || 'anonymous@thrifterseye.com');
          if (mounted) {
            setUser(user);
            setError(null);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error creating user document:', error);
          if (mounted) {
            setError('Failed to initialize user data');
            setLoading(false);
          }
        }
      } else if (!authAttempted) {
        // No user signed in, try to sign in anonymously
        console.log('No user found, attempting anonymous sign-in...');
        setAuthAttempted(true);
        
        try {
          await signInAnonymously(auth);
          console.log('Anonymous sign-in initiated');
        } catch (error) {
          console.error('Anonymous sign-in failed:', error);
          if (mounted) {
            setError(`Authentication failed: ${error.message}`);
            setLoading(false);
          }
        }
      } else {
        // Authentication was attempted but failed
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [authAttempted]);

  const retryAuth = async () => {
    setLoading(true);
    setError(null);
    setAuthAttempted(false);
    
    try {
      console.log('Retrying anonymous authentication...');
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Retry failed:', error);
      setError(`Retry failed: ${error.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-8"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Thrifter's Eye...</h2>
          <p className="text-blue-100">Setting up your anonymous session...</p>
          
          {/* Debug info */}
          <div className="mt-8 bg-white bg-opacity-10 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-100 text-sm">
              Debug: Auth attempted: {authAttempted ? 'Yes' : 'No'}
            </p>
            <p className="text-blue-100 text-sm">
              Current user: {auth.currentUser ? 'Found' : 'None'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Error</h2>
          <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4 mb-6">
            <p className="text-red-100 text-sm">{error}</p>
          </div>
          
          <button
            onClick={retryAuth}
            className="bg-white hover:bg-gray-100 text-purple-600 font-bold py-3 px-6 rounded-full transition-colors"
          >
            Retry Authentication
          </button>
          
          <div className="mt-6 bg-white bg-opacity-10 rounded-lg p-4">
            <p className="text-blue-100 text-xs">
              If this persists, check that Anonymous authentication is enabled in Firebase Console
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-blue-100 mb-6">Unable to create anonymous session</p>
          
          <button
            onClick={retryAuth}
            className="bg-white hover:bg-gray-100 text-purple-600 font-bold py-3 px-6 rounded-full transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/camera" element={<CameraScreen />} />
          <Route path="/loading" element={<LoadingScreen />} />
          <Route path="/results" element={<ResultsScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/paywall" element={<PaywallScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;