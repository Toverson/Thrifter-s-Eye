import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ScrollView, Alert } from 'react-native';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');

  const showAlert = (title, message) => {
    if (typeof window !== 'undefined') {
      window.alert(`${title}: ${message}`);
    }
  };

  const HomeScreen = () => (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>👁️</Text>
            </View>
            <Text style={styles.appName}>Thrifter's Eye</Text>
            <Text style={styles.version}>React Native v1.0</Text>
            <Text style={styles.tagline}>AI-powered item identification and valuation</Text>
          </View>

          {/* Web Preview Notice */}
          <View style={styles.noticeContainer}>
            <Text style={styles.noticeTitle}>📱 Native iOS App Preview</Text>
            <Text style={styles.noticeText}>
              This is a web preview of the React Native iOS app. The actual app includes:
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>✨ New Features in v1.0</Text>
          
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🌍</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Geolocation-Aware Pricing</Text>
              <Text style={styles.featureDescription}>
                Automatically detects your location and provides pricing in your local currency (USD, CAD, GBP, etc.)
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>⭐</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Freemium Subscription</Text>
              <Text style={styles.featureDescription}>
                5 free scans for new users, unlimited scans with Pro subscription via RevenueCat
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📱</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Native iOS Experience</Text>
              <Text style={styles.featureDescription}>
                Built with React Native for true native performance and App Store distribution
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔥</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Firebase Backend</Text>
              <Text style={styles.featureDescription}>
                Cloud Functions, Firestore database, and Firebase Authentication
              </Text>
            </View>
          </View>
        </View>

        {/* Demo Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => showAlert('Camera', 'In the native app, this opens the camera to scan items')}
          >
            <Text style={styles.primaryButtonText}>📸 Scan Item (Demo)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => showAlert('History', 'In the native app, this shows your scan history with Firestore integration')}
          >
            <Text style={styles.secondaryButtonText}>📋 View History (Demo)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.proButton} 
            onPress={() => showAlert('Pro Upgrade', 'In the native app, this shows the RevenueCat paywall for Pro subscription')}
          >
            <Text style={styles.proButtonText}>⭐ Upgrade to Pro (Demo)</Text>
          </TouchableOpacity>
        </View>

        {/* Architecture Info */}
        <View style={styles.archContainer}>
          <Text style={styles.archTitle}>🏗️ Technical Architecture</Text>
          <View style={styles.archGrid}>
            <View style={styles.archItem}>
              <Text style={styles.archLabel}>Frontend</Text>
              <Text style={styles.archValue}>React Native</Text>
            </View>
            <View style={styles.archItem}>
              <Text style={styles.archLabel}>Backend</Text>
              <Text style={styles.archValue}>Firebase Functions</Text>
            </View>
            <View style={styles.archItem}>
              <Text style={styles.archLabel}>Database</Text>
              <Text style={styles.archValue}>Firestore</Text>
            </View>
            <View style={styles.archItem}>
              <Text style={styles.archLabel}>Auth</Text>
              <Text style={styles.archValue}>Firebase Auth</Text>
            </View>
            <View style={styles.archItem}>
              <Text style={styles.archLabel}>Payments</Text>
              <Text style={styles.archValue}>RevenueCat</Text>
            </View>
            <View style={styles.archItem}>
              <Text style={styles.archLabel}>AI</Text>
              <Text style={styles.archValue}>Vision + Gemini</Text>
            </View>
          </View>
        </View>

        {/* Deployment Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>🚀 Deployment Ready</Text>
          <Text style={styles.statusText}>
            • iOS app configured for App Store distribution{'\n'}
            • Firebase project set up with Cloud Functions{'\n'}
            • RevenueCat subscription system integrated{'\n'}
            • Google APIs configured (Vision, Search, Gemini){'\n'}
            • User authentication and data management ready
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  return <HomeScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  logoText: {
    fontSize: 50,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  version: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  noticeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 20,
    borderRadius: 15,
    marginVertical: 20,
    alignItems: 'center',
  },
  noticeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  noticeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 30,
    marginRight: 15,
    minWidth: 40,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  primaryButton: {
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
    shadowRadius: 4,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#667eea',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  proButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  proButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  archContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  archTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  archGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  archItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  archLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 5,
  },
  archValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
});