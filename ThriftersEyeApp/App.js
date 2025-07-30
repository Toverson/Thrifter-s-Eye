import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import { LogBox, StatusBar } from 'react-native';
import Purchases from 'react-native-purchases';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TermsAgreementScreen from './src/screens/TermsAgreementScreen';

// Services
import { UserService } from './src/services/UserService';

// Theme Provider
import { ThemeProvider } from './src/contexts/ThemeContext';

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message

const Stack = createStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    
    if (user) {
      // Initialize RevenueCat with anonymous user ID
      initializeRevenueCat(user.uid);
      // Create user document if needed
      UserService.createUserIfNotExists(user.uid, user.email || 'anonymous@thrifterseye.com');
    }
    
    if (initializing) setInitializing(false);
  }

  const initializeRevenueCat = async (userId) => {
    try {
      // Configure RevenueCat
      Purchases.configure({
        apiKey: 'appl_MMOvAgIufEcRcRFvFipcmykdqnA',
      });

      // Log in the anonymous user to RevenueCat
      await Purchases.logIn(userId);
      console.log('RevenueCat initialized with anonymous user:', userId);
    } catch (error) {
      console.error('RevenueCat initialization error:', error);
    }
  };

  const signInAnonymously = async () => {
    try {
      console.log('Signing in anonymously...');
      await auth().signInAnonymously();
    } catch (error) {
      console.error('Anonymous sign-in error:', error);
    }
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    
    // If no user is signed in on startup, sign in anonymously
    const currentUser = auth().currentUser;
    if (!currentUser) {
      signInAnonymously();
    }

    return subscriber; // unsubscribe on unmount
  }, [initializing]);

  // Show loading screen while initializing
  if (initializing) {
    return null; // You could return a loading screen component here
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Camera" component={CameraScreen} />
          <Stack.Screen name="Loading" component={LoadingScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}