import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';
import { UserService } from './services/UserService';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Import screens
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import LoadingScreen from './screens/LoadingScreen';
import ResultsScreen from './screens/ResultsScreen';
import HistoryScreen from './screens/HistoryScreen';
import PaywallScreen from './screens/PaywallScreen';
import SettingsScreen from './screens/SettingsScreen';

import './App.css';

const AuthRequiredScreen = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme.colors.gradient} flex items-center justify-center`}>
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
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authAttempted, setAuthAttempted] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ step: 'Initializing', timestamp: Date.now() });

  useEffect(() => {
    let mounted = true;
    let authTimeout;

    console.log('🔧 Auth useEffect starting...');
    setDebugInfo({ step: 'Setting up auth listener', timestamp: Date.now() });

    // Set up a timeout to prevent infinite loading
    const setupAuthTimeout = () => {
      authTimeout = setTimeout(() => {
        if (mounted && loading) {
          console.error('❌ Authentication timeout reached after 15 seconds');
          setError('Authentication timeout - please check your internet connection and try again');
          setLoading(false);
          setDebugInfo({ step: 'Timeout reached', timestamp: Date.now() });
        }
      }, 15000); // 15 second timeout
    };

    setupAuthTimeout();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', user ? `User signed in: ${user.uid}` : 'No user');
      setDebugInfo({ step: 'Auth state changed', user: user ? user.uid : 'none', timestamp: Date.now() });
      
      // Clear the timeout since we got a state change
      if (authTimeout) {
        clearTimeout(authTimeout);
      }
      
      if (user) {
        console.log('✅ User details:', {
          uid: user.uid,
          isAnonymous: user.isAnonymous,
          email: user.email
        });
        
        setDebugInfo({ step: 'Creating user document', userId: user.uid, timestamp: Date.now() });
        
        try {
          // Create user document if it doesn't exist
          console.log('📝 Creating user document for:', user.uid);
          await UserService.createUserIfNotExists(user.uid, user.email || 'anonymous@thrifterseye.com');
          console.log('✅ User document created/verified');
          
          if (mounted) {
            setUser(user);
            setError(null);
            setLoading(false);
            setDebugInfo({ step: 'Authentication complete', userId: user.uid, timestamp: Date.now() });
          }
        } catch (error) {
          console.error('❌ Error creating user document:', error);
          if (mounted) {
            setError(`Failed to initialize user data: ${error.message}`);
            setLoading(false);
            setDebugInfo({ step: 'User document creation failed', error: error.message, timestamp: Date.now() });
          }
        }
      } else if (!authAttempted) {
        // No user signed in, try to sign in anonymously
        console.log('🔐 No user found, attempting anonymous sign-in...');
        setDebugInfo({ step: 'Attempting anonymous sign-in', timestamp: Date.now() });
        setAuthAttempted(true);
        
        try {
          console.log('🚀 Initiating anonymous sign-in...');
          const result = await signInAnonymously(auth);
          console.log('✅ Anonymous sign-in successful:', result.user.uid);
          setDebugInfo({ step: 'Anonymous sign-in successful', userId: result.user.uid, timestamp: Date.now() });
        } catch (error) {
          console.error('❌ Anonymous sign-in failed:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          
          if (mounted) {
            setError(`Authentication failed: ${error.message}`);
            setLoading(false);
            setDebugInfo({ step: 'Anonymous sign-in failed', error: error.message, timestamp: Date.now() });
          }
        }
      } else {
        // Authentication was attempted but failed
        console.log('⚠️ Authentication was attempted but no user found');
        if (mounted) {
          setLoading(false);
          setDebugInfo({ step: 'Authentication failed - no user', timestamp: Date.now() });
        }
      }
    });

    // Test Firebase connection
    console.log('🔧 Firebase auth instance:', auth);
    console.log('🔧 Firebase config:', auth.app.options);

    return () => {
      console.log('🧹 Cleaning up auth effect...');
      mounted = false;
      if (authTimeout) {
        clearTimeout(authTimeout);
      }
      unsubscribe();
    };
  }, [authAttempted]);

  const retryAuth = async () => {
    console.log('🔄 Retrying authentication...');
    setLoading(true);
    setError(null);
    setAuthAttempted(false);
    setDebugInfo({ step: 'Retrying authentication', timestamp: Date.now() });
    
    try {
      console.log('🚀 Retrying anonymous authentication...');
      const result = await signInAnonymously(auth);
      console.log('✅ Retry successful:', result.user.uid);
      setDebugInfo({ step: 'Retry successful', userId: result.user.uid, timestamp: Date.now() });
    } catch (error) {
      console.error('❌ Retry failed:', error);
      setError(`Retry failed: ${error.message}`);
      setLoading(false);
      setDebugInfo({ step: 'Retry failed', error: error.message, timestamp: Date.now() });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-8"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Thrifter's Eye...</h2>
          <p className="text-blue-100">Setting up your anonymous session...</p>
          
          {/* Enhanced Debug info */}
          <div className="mt-8 bg-white bg-opacity-10 rounded-lg p-4 max-w-lg mx-auto text-left">
            <h3 className="text-white font-semibold mb-2">Debug Information:</h3>
            <p className="text-blue-100 text-sm mb-1">
              <strong>Current Step:</strong> {debugInfo.step}
            </p>
            <p className="text-blue-100 text-sm mb-1">
              <strong>Auth Attempted:</strong> {authAttempted ? 'Yes' : 'No'}
            </p>
            <p className="text-blue-100 text-sm mb-1">
              <strong>Current User:</strong> {auth.currentUser ? `${auth.currentUser.uid} (${auth.currentUser.isAnonymous ? 'Anonymous' : 'Authenticated'})` : 'None'}
            </p>
            <p className="text-blue-100 text-sm mb-1">
              <strong>Firebase Connected:</strong> {auth.app ? 'Yes' : 'No'}
            </p>
            <p className="text-blue-100 text-sm">
              <strong>Timestamp:</strong> {new Date(debugInfo.timestamp).toLocaleTimeString()}
            </p>
            {debugInfo.userId && (
              <p className="text-blue-100 text-sm">
                <strong>User ID:</strong> {debugInfo.userId.substring(0, 8)}...
              </p>
            )}
          </div>
          
          {/* Manual retry button if taking too long */}
          <div className="mt-6">
            <button
              onClick={retryAuth}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Force Retry
            </button>
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
            <p className="text-blue-100 text-xs mb-2">
              If this persists, check that Anonymous authentication is enabled in Firebase Console:
            </p>
            <p className="text-blue-100 text-xs mb-1">
              1. Go to Firebase Console → Authentication → Sign-in method
            </p>
            <p className="text-blue-100 text-xs mb-1">
              2. Enable "Anonymous" provider
            </p>
            <p className="text-blue-100 text-xs">
              3. Make sure your Firebase project is active
            </p>
            
            {debugInfo.error && (
              <div className="mt-3 p-2 bg-red-500 bg-opacity-20 rounded">
                <p className="text-red-200 text-xs">
                  <strong>Error:</strong> {debugInfo.error}
                </p>
              </div>
            )}
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
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={user ? <HomeScreen /> : <AuthRequiredScreen />} />
          <Route path="/camera" element={user ? <CameraScreen /> : <AuthRequiredScreen />} />
          <Route path="/loading" element={user ? <LoadingScreen /> : <AuthRequiredScreen />} />
          <Route path="/results" element={user ? <ResultsScreen /> : <AuthRequiredScreen />} />
          <Route path="/history" element={user ? <HistoryScreen /> : <AuthRequiredScreen />} />
          <Route path="/paywall" element={user ? <PaywallScreen /> : <AuthRequiredScreen />} />
          <Route path="/settings" element={user ? <SettingsScreen /> : <AuthRequiredScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;