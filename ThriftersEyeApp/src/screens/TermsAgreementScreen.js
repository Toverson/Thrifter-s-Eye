import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import auth from '@react-native-firebase/auth';
import { UserService } from '../services/UserService';
import { useTheme } from '../contexts/ThemeContext';

export default function TermsAgreementScreen({ navigation }) {
  const { theme } = useTheme();
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const canProceed = agreedToPrivacy && agreedToTerms;

  const openPrivacyPolicy = () => {
    Linking.openURL('https://toverson.github.io/Thrifter-s-Eye/privacy.html');
  };

  const openTermsConditions = () => {
    Linking.openURL('https://toverson.github.io/Thrifter-s-Eye/terms.html');
  };

  const handleContinue = async () => {
    if (!canProceed) {
      Alert.alert(
        'Agreement Required',
        'Please read and agree to both the Privacy Policy and Terms & Conditions to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      const user = auth().currentUser;
      
      if (!user) {
        Alert.alert('Error', 'Authentication error. Please try again.');
        return;
      }

      // Record the user's agreement
      const success = await UserService.recordTermsAgreement(user.uid);
      
      if (success) {
        console.log('✅ TermsAgreement (RN): User agreed to terms, proceeding to app');
        // Navigate to Home screen - the app will handle the flow from there
        navigation.replace('Home');
      } else {
        Alert.alert('Error', 'Failed to save your agreement. Please try again.');
      }
    } catch (error) {
      console.error('❌ TermsAgreement (RN): Error processing agreement:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 15,
      padding: 25,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    emoji: {
      fontSize: 60,
      marginBottom: 15,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    documentContainer: {
      backgroundColor: theme.colors.backgroundTertiary,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 15,
    },
    checkboxContainer: {
      marginRight: 15,
      marginTop: 2,
    },
    textContainer: {
      flex: 1,
    },
    documentTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    documentDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    linkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    linkText: {
      fontSize: 14,
      color: '#667eea',
      fontWeight: '600',
      marginLeft: 5,
    },
    continueButton: {
      borderRadius: 12,
      paddingVertical: 18,
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
    continueButtonEnabled: {
      backgroundColor: theme.colors.primary,
    },
    continueButtonDisabled: {
      backgroundColor: '#d1d5db',
    },
    continueButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    continueButtonTextEnabled: {
      color: 'white',
    },
    continueButtonTextDisabled: {
      color: '#9ca3af',
    },
    helpText: {
      fontSize: 12,
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginBottom: 20,
    },
    legalNotice: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 20,
      marginTop: 10,
    },
    legalText: {
      fontSize: 11,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 16,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
      marginLeft: 10,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView contentContainerStyle={dynamicStyles.scrollContent}>
        <View style={dynamicStyles.card}>
          
          {/* Header */}
          <View style={dynamicStyles.headerContainer}>
            <Text style={dynamicStyles.emoji}>📋</Text>
            <Text style={dynamicStyles.headerTitle}>Welcome to Thrifter's Eye</Text>
            <Text style={dynamicStyles.headerSubtitle}>
              Before we get started, please review and accept our policies
            </Text>
          </View>

          {/* Privacy Policy */}
          <View style={dynamicStyles.documentContainer}>
            <View style={dynamicStyles.checkboxRow}>
              <View style={dynamicStyles.checkboxContainer}>
                <CheckBox
                  value={agreedToPrivacy}
                  onValueChange={setAgreedToPrivacy}
                  tintColors={{ true: '#667eea', false: '#d1d5db' }}
                />
              </View>
              <View style={dynamicStyles.textContainer}>
                <Text style={dynamicStyles.documentTitle}>Privacy Policy Agreement</Text>
                <Text style={dynamicStyles.documentDescription}>
                  I have read and agree to the Privacy Policy, which explains how Thrifter's Eye collects, uses, and protects my personal information.
                </Text>
                <TouchableOpacity style={dynamicStyles.linkButton} onPress={openPrivacyPolicy}>
                  <Text>📄</Text>
                  <Text style={dynamicStyles.linkText}>Read Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Terms & Conditions */}
          <View style={dynamicStyles.documentContainer}>
            <View style={dynamicStyles.checkboxRow}>
              <View style={dynamicStyles.checkboxContainer}>
                <CheckBox
                  value={agreedToTerms}
                  onValueChange={setAgreedToTerms}
                  tintColors={{ true: '#667eea', false: '#d1d5db' }}
                />
              </View>
              <View style={dynamicStyles.textContainer}>
                <Text style={dynamicStyles.documentTitle}>Terms & Conditions Agreement</Text>
                <Text style={dynamicStyles.documentDescription}>
                  I have read and agree to the Terms & Conditions, which outline the rules and guidelines for using Thrifter's Eye.
                </Text>
                <TouchableOpacity style={dynamicStyles.linkButton} onPress={openTermsConditions}>
                  <Text>📜</Text>
                  <Text style={dynamicStyles.linkText}>Read Terms & Conditions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              dynamicStyles.continueButton,
              canProceed && !loading
                ? dynamicStyles.continueButtonEnabled
                : dynamicStyles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!canProceed || loading}
          >
            {loading ? (
              <View style={dynamicStyles.loadingContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={dynamicStyles.loadingText}>Processing...</Text>
              </View>
            ) : (
              <Text
                style={[
                  dynamicStyles.continueButtonText,
                  canProceed
                    ? dynamicStyles.continueButtonTextEnabled
                    : dynamicStyles.continueButtonTextDisabled,
                ]}
              >
                ✅ I Agree - Continue to Thrifter's Eye
              </Text>
            )}
          </TouchableOpacity>

          {!canProceed && (
            <Text style={dynamicStyles.helpText}>
              Please check both boxes above to continue
            </Text>
          )}

          {/* Legal Notice */}
          <View style={dynamicStyles.legalNotice}>
            <Text style={dynamicStyles.legalText}>
              By continuing, you acknowledge that you have read, understood, and agree to be bound by our Privacy Policy and Terms & Conditions. 
              These agreements are effective immediately and govern your use of Thrifter's Eye.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}