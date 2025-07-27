import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Purchases from 'react-native-purchases';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsScreen({ navigation }) {
  const { theme, toggleTheme, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [user] = useState(auth().currentUser);

  const simulateManageSubscriptions = () => {
    // In production, this calls: Purchases.showManageSubscriptions()
    Alert.alert(
      'Manage Subscriptions',
      'This would open your device\'s subscription management screen.\n\nOn iOS: Settings → Apple ID → Subscriptions → Thrifter\'s Eye\n\nThis allows you to cancel, modify, or view your subscription details.'
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginRight: 50,
      color: theme.colors.text,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginVertical: 10,
      marginHorizontal: 20,
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
      color: theme.colors.text,
      marginBottom: 10,
    },
    accountCard: {
      backgroundColor: theme.colors.backgroundTertiary,
      padding: 15,
      borderRadius: 8,
    },
    accountType: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 5,
    },
    accountDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 10,
    },
    userId: {
      fontSize: 12,
      color: theme.colors.textMuted,
      fontFamily: 'monospace',
    },
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    themeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    themeIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    themeTextContainer: {
      flex: 1,
    },
    themeTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    themeSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 15,
      borderRadius: 25,
      marginBottom: 10,
    },
    primaryButtonText: {
      color: theme.colors.primaryText,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    appInfo: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 5,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Theme Toggle */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Appearance</Text>
          <View style={dynamicStyles.themeRow}>
            <View style={dynamicStyles.themeInfo}>
              <Text style={dynamicStyles.themeIcon}>{isDark ? '🌙' : '☀️'}</Text>
              <View style={dynamicStyles.themeTextContainer}>
                <Text style={dynamicStyles.themeTitle}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </Text>
                <Text style={dynamicStyles.themeSubtitle}>
                  Choose your preferred theme
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor={isDark ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Account Status */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Account Status</Text>
          <View style={dynamicStyles.accountCard}>
            <Text style={dynamicStyles.accountType}>
              👤 Anonymous Account
            </Text>
            <Text style={dynamicStyles.accountDescription}>
              Your scan history is private and secure
            </Text>
            <Text style={dynamicStyles.userId}>Session ID: {user?.uid?.substr(0, 8)}...</Text>
          </View>
        </View>

        {/* Subscription Management */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Subscription</Text>
          
          <TouchableOpacity 
            style={dynamicStyles.primaryButton}
            onPress={simulateManageSubscriptions}
            disabled={loading}
          >
            <Text style={dynamicStyles.primaryButtonText}>
              ⚙️ Manage Subscription
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Information */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>App Information</Text>
          <Text style={dynamicStyles.appInfo}>Thrifter's Eye v1.0</Text>
          <Text style={dynamicStyles.appInfo}>AI-powered item identification & valuation</Text>
          <Text style={dynamicStyles.appInfo}>Theme: {isDark ? 'Dark Mode' : 'Light Mode'}</Text>
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