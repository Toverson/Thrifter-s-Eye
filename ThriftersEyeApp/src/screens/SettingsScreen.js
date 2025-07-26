import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Purchases from 'react-native-purchases';
import { UserService } from '../services/UserService';

export default function SettingsScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(auth().currentUser);

  const restorePurchases = async () => {
    try {
      setLoading(true);
      
      const customerInfo = await Purchases.restorePurchases();
      
      if (customerInfo.entitlements.active.Pro) {
        // Update user status in Firestore
        if (user) {
          await UserService.updateProStatus(user.uid, true);
        }
        
        Alert.alert(
          'Restored!',
          'Your Pro subscription has been restored.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('No Purchases', 'No active Pro subscription found.');
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const linkWithEmailPassword = async () => {
    Alert.prompt(
      'Create Permanent Account',
      'Enter your email and password to protect your scans:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Account',
          onPress: async (email) => {
            Alert.prompt(
              'Password',
              'Enter a password:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Link Account',
                  onPress: async (password) => {
                    await linkAccount('email', { email, password });
                  }
                }
              ],
              'secure-text'
            );
          }
        }
      ],
      'plain-text'
    );
  };

  const linkWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await linkAccount('google', googleCredential);
    } catch (error) {
      Alert.alert('Error', 'Google sign-in failed');
    }
  };

  const linkAccount = async (provider, credentials) => {
    try {
      setLoading(true);
      
      if (provider === 'email') {
        const credential = auth.EmailAuthProvider.credential(
          credentials.email,
          credentials.password
        );
        await user.linkWithCredential(credential);
      } else if (provider === 'google') {
        await user.linkWithCredential(credentials);
      }
      
      Alert.alert(
        'Account Linked!',
        'Your anonymous account has been upgraded to a permanent account. Your scans and subscription are now protected.',
        [{ text: 'OK' }]
      );
      
      setUser(auth().currentUser);
    } catch (error) {
      console.error('Account linking error:', error);
      Alert.alert('Error', 'Failed to link account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAnonymous = user?.isAnonymous;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Account Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Status</Text>
          <View style={styles.accountCard}>
            <Text style={styles.accountType}>
              {isAnonymous ? '👤 Anonymous Account' : '🔐 Permanent Account'}
            </Text>
            <Text style={styles.accountDescription}>
              {isAnonymous 
                ? 'Your data is saved locally but not backed up.'
                : 'Your account is protected and backed up.'}
            </Text>
            <Text style={styles.userId}>User ID: {user?.uid?.substr(0, 8)}...</Text>
          </View>
        </View>

        {/* Account Protection */}
        {isAnonymous && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Protect Your Scans</Text>
            <Text style={styles.sectionDescription}>
              Create a permanent account to protect your scan history and subscription across devices.
            </Text>
            
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={linkWithEmailPassword}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                📧 Link with Email & Password
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.googleButton}
              onPress={linkWithGoogle}
              disabled={loading}
            >
              <Text style={styles.googleButtonText}>
                🔗 Link with Google
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Purchases */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purchases</Text>
          
          <TouchableOpacity 
            style={styles.restoreButton}
            onPress={restorePurchases}
            disabled={loading}
          >
            <Text style={styles.restoreButtonText}>
              🔄 Restore Purchases
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.restoreDescription}>
            If you've previously purchased Pro on this device, tap here to restore your subscription.
          </Text>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <Text style={styles.appInfo}>Thrifter's Eye v1.0</Text>
          <Text style={styles.appInfo}>AI-powered item identification</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  accountCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  accountType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  accountDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  userId: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  primaryButton: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  googleButton: {
    backgroundColor: '#db4437',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  restoreButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
  },
  restoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  restoreDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  appInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});