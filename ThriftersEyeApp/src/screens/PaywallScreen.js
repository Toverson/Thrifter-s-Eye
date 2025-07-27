import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Purchases from 'react-native-purchases';
import auth from '@react-native-firebase/auth';
import { UserService } from '../services/UserService';
import { LocationService } from '../services/LocationService';
import { CurrencyService } from '../services/CurrencyService';
import { useTheme } from '../contexts/ThemeContext';

export default function PaywallScreen({ navigation }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState({
    formatted: '$9.61', // Fallback price
    originalCAD: '$12.99',
    currencyCode: 'USD'
  });
  const [pricingLoading, setPricingLoading] = useState(true);

  // Load user's location and calculate pricing
  useEffect(() => {
    const loadPricing = async () => {
      try {
        console.log('💰 PaywallScreen: Loading user location for pricing...');
        
        // Get user's location
        const userLocation = await LocationService.getCurrentLocation();
        console.log('📍 PaywallScreen: User location:', userLocation);
        
        // Get user's currency
        const userCurrency = CurrencyService.getUserCurrency(userLocation);
        console.log('💰 PaywallScreen: User currency:', userCurrency);
        
        // Convert price to user's currency
        const convertedPricing = CurrencyService.convertPrice(userCurrency);
        console.log('💰 PaywallScreen: Converted pricing:', convertedPricing);
        
        setPricing(convertedPricing);
      } catch (error) {
        console.error('❌ PaywallScreen: Error loading pricing:', error);
        
        // Fallback to USD pricing
        const fallbackPricing = CurrencyService.convertPrice('USD');
        setPricing(fallbackPricing);
      } finally {
        setPricingLoading(false);
      }
    };
    
    loadPricing();
  }, []);

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

  const features = [
    '📷 Unlimited item scans',
    '💎 Premium AI analysis', 
    '📊 Advanced market insights',
    '🏷️ Detailed listing recommendations',
    '📈 Price history tracking',
    '🔄 Scan history backup',
  ];

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.primary,
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
    pricingContainer: {
      alignItems: 'center',
      marginBottom: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: 20,
      borderRadius: 15,
    },
    pricingTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 10,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      marginBottom: 5,
    },
    priceText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: 'white',
    },
    perMonthText: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.9)',
      marginLeft: 8,
    },
    originalPriceText: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: 5,
    },
    pricingSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    featuresContainer: {
      width: '100%',
      marginBottom: 30,
    },
    featuresTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 20,
      textAlign: 'center',
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: 15,
      borderRadius: 10,
    },
    featureIcon: {
      fontSize: 20,
      marginRight: 12,
      width: 25,
    },
    featureText: {
      fontSize: 16,
      color: 'white',
      fontWeight: '500',
      flex: 1,
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
      color: theme.colors.primary,
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
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView contentContainerStyle={dynamicStyles.scrollContent}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <TouchableOpacity 
            style={dynamicStyles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={dynamicStyles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Main content */}
        <View style={dynamicStyles.content}>
          {/* Logo */}
          <View style={dynamicStyles.logoContainer}>
            <View style={dynamicStyles.logoPlaceholder}>
              <Text style={dynamicStyles.logoText}>💎</Text>
            </View>
            <Text style={dynamicStyles.proTitle}>Thrifter's Eye Pro</Text>
          </View>

          {/* Limit message */}
          <View style={dynamicStyles.limitMessage}>
            <Text style={dynamicStyles.limitTitle}>You've reached your limit</Text>
            <Text style={dynamicStyles.limitSubtitle}>
              You've used all 5 free scans. Upgrade to Pro for unlimited access and premium features.
            </Text>
          </View>

          {/* Pricing */}
          <View style={dynamicStyles.pricingContainer}>
            <Text style={dynamicStyles.pricingTitle}>Monthly Subscription</Text>
            
            {pricingLoading ? (
              <View style={dynamicStyles.loadingContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={[dynamicStyles.perMonthText, {marginLeft: 10}]}>Loading pricing...</Text>
              </View>
            ) : (
              <>
                <View style={dynamicStyles.priceRow}>
                  <Text style={dynamicStyles.priceText}>{pricing.formatted}</Text>
                  <Text style={dynamicStyles.perMonthText}>/month</Text>
                </View>
                
                {pricing.currencyCode !== 'CAD' && (
                  <Text style={dynamicStyles.originalPriceText}>
                    Original price: {pricing.originalCAD} CAD/month
                  </Text>
                )}
                
                <Text style={dynamicStyles.pricingSubtitle}>
                  Cancel anytime • {pricing.currencyCode}
                </Text>
              </>
            )}
          </View>

          {/* Features */}
          <View style={dynamicStyles.featuresContainer}>
            <Text style={dynamicStyles.featuresTitle}>Pro Features</Text>
            
            {features.map((feature, index) => (
              <View key={index} style={dynamicStyles.feature}>
                <View style={styles.featureCheck}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
                <Text style={dynamicStyles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Action buttons */}
          <View style={dynamicStyles.buttonContainer}>
            <TouchableOpacity 
              style={[dynamicStyles.upgradeButton, loading && dynamicStyles.disabledButton]} 
              onPress={handleUpgrade}
              disabled={loading}
            >
              <Text style={dynamicStyles.upgradeButtonText}>
                {loading ? 'Processing...' : '🚀 Upgrade to Pro Now'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={dynamicStyles.restoreButton} 
              onPress={restorePurchases}
              disabled={loading}
            >
              <Text style={dynamicStyles.restoreButtonText}>Restore Purchases</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <View style={dynamicStyles.termsContainer}>
            <Text style={dynamicStyles.termsText}>
              Subscription managed through the App Store. Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  featureCheck: {
    width: 24,
    height: 24,
    backgroundColor: '#10b981',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});