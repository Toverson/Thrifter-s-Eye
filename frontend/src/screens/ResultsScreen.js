import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';

export default function ResultsScreen({ navigation, route }) {
  const { scanResult, imageUri } = route.params;

  const renderConfidenceBar = () => {
    const confidence = scanResult.confidenceScore || 0;
    return (
      <View style={styles.confidenceContainer}>
        <Text style={styles.confidenceLabel}>Confidence Score</Text>
        <View style={styles.confidenceBarContainer}>
          <View 
            style={[
              styles.confidenceBar, 
              { width: `${confidence}%` }
            ]} 
          />
        </View>
        <Text style={styles.confidenceText}>{confidence}% confident</Text>
      </View>
    );
  };

  const renderSimilarListings = () => {
    if (!scanResult.similarListings || scanResult.similarListings.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Similar Listings</Text>
        {scanResult.similarListings.map((listing, index) => (
          <View key={index} style={styles.listingCard}>
            <Text style={styles.listingTitle} numberOfLines={2}>
              {listing.title}
            </Text>
            <Text style={styles.listingSnippet} numberOfLines={2}>
              {listing.snippet}
            </Text>
            {listing.price && (
              <Text style={styles.listingPrice}>{listing.price}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backButtonText}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Results</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Item header */}
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{scanResult.itemName}</Text>
          <Text style={styles.estimatedValue}>{scanResult.estimatedValue}</Text>
        </View>

        {/* Image and basic info */}
        <View style={styles.imageSection}>
          <Image source={{ uri: imageUri }} style={styles.itemImage} />
          {renderConfidenceBar()}
        </View>

        {/* AI Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Analysis</Text>
          <View style={styles.analysisCard}>
            <Text style={styles.analysisText}>{scanResult.aiAnalysis}</Text>
          </View>
        </View>

        {/* Listing Draft */}
        {scanResult.listingDraft && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Listing</Text>
            <View style={styles.listingDraftCard}>
              <Text style={styles.listingDraftTitle}>
                {scanResult.listingDraft.title}
              </Text>
              <Text style={styles.listingDraftDescription}>
                {scanResult.listingDraft.description}
              </Text>
            </View>
          </View>
        )}

        {/* Similar Listings */}
        {renderSimilarListings()}

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.scanAgainButton}
            onPress={() => navigation.navigate('Camera')}
          >
            <Text style={styles.scanAgainText}>📸 Scan Another Item</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.historyButton}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.historyButtonText}>📋 View History</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  itemHeader: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 25,
    alignItems: 'center',
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  estimatedValue: {
    fontSize: 20,
    color: '#f0f0f0',
    fontWeight: '600',
  },
  imageSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  itemImage: {
    width: 250,
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
  },
  confidenceContainer: {
    width: '100%',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  confidenceBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 5,
  },
  confidenceBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  analysisCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  listingDraftCard: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  listingDraftTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a2d',
    marginBottom: 8,
  },
  listingDraftDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4a6741',
  },
  listingCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  listingSnippet: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 5,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  actionButtons: {
    padding: 20,
    paddingTop: 10,
  },
  scanAgainButton: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
  },
  scanAgainText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  historyButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 25,
  },
  historyButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});