import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { UserService } from '../services/UserService';
import { LocationService } from '../services/LocationService';
import { useTheme } from '../contexts/ThemeContext';

export default function HomeScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    loadUserData();
    getCurrentLocation();
  }, []);

  const loadUserData = async () => {
    const user = auth().currentUser;
    if (user) {
      const data = await UserService.getUserData(user.uid);
      setUserData(data);
    }
  };

  const getCurrentLocation = async () => {
    const locationData = await LocationService.getCurrentLocation();
    setLocation(locationData);
  };

  const handleScanPress = async () => {
    const user = auth().currentUser;
    if (!user) return;

    // Check if user can scan
    const canScan = await UserService.canUserScan(user.uid);
    
    if (!canScan) {
      // Redirect to paywall
      navigation.navigate('Paywall');
      return;
    }

    // Navigate to camera with location data
    navigation.navigate('Camera', { location });
  };

  const handleHistoryPress = () => {
    navigation.navigate('History');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header with settings */}
        <View style={styles.header}>
          <View style={styles.headerLeft}></View>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
            <Text style={styles.settingsText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Logo and title */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>👁️</Text>
          </View>
        </View>
        <Text style={styles.appName}>Thrifter's Eye</Text>
        <Text style={styles.tagline}>AI-powered item identification and valuation</Text>
        
        {/* Location indicator */}
        {location && (
          <Text style={styles.locationText}>
            📍 {location.countryCode} • Pricing in {location.currencyCode}
          </Text>
        )}

        {/* User status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{getScanCountDisplay()}</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.scanButton} 
            onPress={handleScanPress}
          >
            <Text style={styles.scanButtonText}>📸 Scan Item</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.historyButton} 
            onPress={handleHistoryPress}
          >
            <Text style={styles.historyButtonText}>📋 View History</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    width: 40,
  },
  settingsButton: {
    padding: 10,
  },
  settingsText: {
    fontSize: 24,
    color: 'white',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 20,
  },
  statusContainer: {
    marginBottom: 30,
  },
  statusText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  scanButton: {
    backgroundColor: 'white',
    paddingVertical: 18,
    borderRadius: 30,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scanButtonText: {
    color: '#667eea',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  historyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
  historyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});