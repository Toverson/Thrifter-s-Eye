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
import Purchases from 'react-native-purchases';
import auth from '@react-native-firebase/auth';
import { UserService } from '../services/UserService';

export default function PaywallScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      
      // Get offerings from RevenueCat
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current !== null) {
        // Find the monthly product
        const monthlyProduct = offerings.current.monthly;
        
        if (monthlyProduct) {
          // Make the purchase
          const { customerInfo } = await Purchases.purchaseProduct(monthlyProduct.identifier);
          
          // Check if user now has Pro entitlement
          if (customerInfo.entitlements.active.Pro) {
            // Update user status in Firestore
            const user = auth().currentUser;
            if (user) {
              await UserService.updateProStatus(user.uid, true);
            }
            
            Alert.alert(
              'Success!',
              'Welcome to Thrifter\'s Eye Pro! You now have unlimited scans.',
              [
                {
                  text: 'Start Scanning',
                  onPress: () => navigation.navigate('Home'),
                },
              ]
            );
          }
        }
      }
    } catch (error) {
      if (error.userCancelled) {
        // User cancelled, don't show error
        return;
      }
      
      console.error('Purchase error:', error);
      Alert.alert('Error', 'Failed to process purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const restorePurchases = async () => {
    try {
      setLoading(true);
      
      const customerInfo = await Purchases.restorePurchases();
      
      if (customerInfo.entitlements.active.Pro) {
        // Update user status in Firestore
        const user = auth().currentUser;
        if (user) {
          await UserService.updateProStatus(user.uid, true);
        }
        
        Alert.alert(
          'Restored!',
          'Your Pro subscription has been restored.',
          [
            {
              text: 'Continue',
              onPress: () => navigation.navigate('Home'),
            },
          ]
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>👁️</Text>
            </View>
            <Text style={styles.proTitle}>Thrifter's Eye Pro</Text>
          </View>

          {/* Limit message */}
          <View style={styles.limitMessage}>
            <Text style={styles.limitTitle}>You've reached your limit</Text>
            <Text style={styles.limitSubtitle}>
              Free users can scan up to 5 items. Upgrade to Pro for unlimited scanning!
            </Text>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Pro Benefits</Text>
            
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>🔄</Text>
              <Text style={styles.benefitText}>Unlimited item scans</Text>
            </View>
            
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>🌍</Text>
              <Text style={styles.benefitText}>Global marketplace pricing</Text>
            </View>
            
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>🎯</Text>
              <Text style={styles.benefitText}>Enhanced AI accuracy</Text>
            </View>
            
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>📈</Text>
              <Text style={styles.benefitText}>Detailed market analysis</Text>
            </View>
            
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>⚡</Text>
              <Text style={styles.benefitText}>Priority processing</Text>
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            <Text style={styles.pricingTitle}>Monthly Subscription</Text>
            <Text style={styles.pricingSubtitle}>Cancel anytime</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.upgradeButton, loading && styles.disabledButton]} 
              onPress={handleUpgrade}
              disabled={loading}
            >
              <Text style={styles.upgradeButtonText}>
                {loading ? 'Processing...' : '⭐ Upgrade to Pro'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.restoreButton} 
              onPress={restorePurchases}
              disabled={loading}
            >
              <Text style={styles.restoreButtonText}>Restore Purchases</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 5,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoText: {
    fontSize: 40,
  },
  proTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  limitMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    alignItems: 'center',
  },
  limitTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  limitSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  benefitText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  pricingContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  pricingSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  upgradeButton: {
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
  disabledButton: {
    opacity: 0.7,
  },
  upgradeButtonText: {
    color: '#667eea',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  restoreButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
  },
  restoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  termsContainer: {
    paddingHorizontal: 10,
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 16,
  },
});