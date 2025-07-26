import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { UserService } from './services/UserService';

// Import screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import LoadingScreen from './screens/LoadingScreen';
import ResultsScreen from './screens/ResultsScreen';
import HistoryScreen from './screens/HistoryScreen';
import PaywallScreen from './screens/PaywallScreen';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Create user document if it doesn't exist
        await UserService.createUserIfNotExists(user.uid, user.email);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-8"></div>
          <h2 className="text-2xl font-bold text-white">Loading Thrifter's Eye...</h2>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {user ? (
            // User is signed in
            <>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/camera" element={<CameraScreen />} />
              <Route path="/loading" element={<LoadingScreen />} />
              <Route path="/results" element={<ResultsScreen />} />
              <Route path="/history" element={<HistoryScreen />} />
              <Route path="/paywall" element={<PaywallScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            // User is not signed in
            <>
              <Route path="/login" element={<LoginScreen />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;