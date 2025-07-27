import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { ScanService } from '../services/ScanService';
import { useTheme } from '../contexts/ThemeContext';

export default function HistoryScreen({ navigation }) {
  const { theme } = useTheme();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      setLoading(true);
      const userScans = await ScanService.getUserScans(10); // Limit to 10 most recent
      setScans(userScans);
    } catch (error) {
      console.error('Error loading scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScans();
    setRefreshing(false);
  };

  const clearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all scan history? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Clearing scan history...');
              const result = await ScanService.clearUserHistory();
              console.log('✅ Scan history cleared:', result);
              
              // Show success message
              Alert.alert(
                'Success',
                `Successfully cleared ${result.deleted_count} scans from your history.`
              );
              
              // Reload the history to show empty state
              await loadScans();
            } catch (error) {
              console.error('❌ Failed to clear history:', error);
              Alert.alert('Error', 'Failed to clear scan history. Please try again.');
            }
          }
        }
      ]
    );
  };

  const navigateToResult = (scan) => {
    navigation.navigate('Results', {
      scanResult: scan,
      imageUri: `data:image/jpeg;base64,${scan.imageBase64}`,
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    // Handle Firestore timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderScanItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.scanItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} 
      onPress={() => navigateToResult(item)}
    >
      <Image 
        source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
        style={styles.scanImage}
      />
      <View style={styles.scanInfo}>
        <Text style={[styles.scanTitle, { color: theme.colors.text }]} numberOfLines={2}>
          {item.itemName || 'Unknown Item'}
        </Text>
        <Text style={styles.scanValue}>
          {item.estimatedValue || 'Value unknown'}
        </Text>
        <Text style={[styles.scanDate, { color: theme.colors.textMuted }]}>
          {formatDate(item.timestamp)}
        </Text>
      </View>
      <View style={styles.arrowContainer}>
        <Text style={[styles.arrow, { color: theme.colors.textMuted }]}>→</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No scans yet</Text>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        Start by scanning your first item to see your history here!
      </Text>
      <TouchableOpacity 
        style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.scanButtonText}>📸 Scan Your First Item</Text>
      </TouchableOpacity>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
        onPress={onRefresh}
      >
        <Text style={styles.actionButtonText}>🔄 Refresh</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.clearButton]}
        onPress={clearHistory}
      >
        <Text style={[styles.actionButtonText, styles.clearButtonText]}>🗑️ Clear History</Text>
      </TouchableOpacity>
    </View>
  );

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
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Scan History</Text>
      </View>

      {/* Scan list */}
      <FlatList
        data={scans}
        renderItem={renderScanItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        ListFooterComponent={renderActionButtons}
        contentContainerStyle={scans.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  list: {
    padding: 10,
  },
  emptyList: {
    flex: 1,
  },
  scanItem: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  scanImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  scanInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  scanTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  scanValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 2,
  },
  scanDate: {
    fontSize: 12,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
  },
  arrow: {
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  scanButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 120,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#dc3545',
  },
  clearButtonText: {
    color: 'white',
  },
});