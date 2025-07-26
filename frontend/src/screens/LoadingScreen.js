import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { CloudFunctionService } from '../services/CloudFunctionService';
import { ScanService } from '../services/ScanService';
import { UserService } from '../services/UserService';

export default function LoadingScreen({ navigation, route }) {
  const { imageBase64, imageUri, location } = route.params;
  const [loadingMessage, setLoadingMessage] = useState('Identifying object...');

  const loadingMessages = [
    'Identifying object...',
    'Searching marketplaces...',
    'Analyzing value...',
    'Finalizing appraisal...',
  ];

  useEffect(() => {
    processImage();
  }, []);

  useEffect(() => {
    // Cycle through loading messages
    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex < loadingMessages.length - 1) {
        messageIndex++;
        setLoadingMessage(loadingMessages[messageIndex]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const processImage = async () => {
    try {
      const user = auth().currentUser;
      if (!user) {
        navigation.navigate('Login');
        return;
      }

      // Call the cloud function to analyze the image
      const result = await CloudFunctionService.scanItem(
        imageBase64,
        location?.countryCode || 'US',
        location?.currencyCode || 'USD'
      );

      // Increment user's scan count (for free users)
      const userData = await UserService.getUserData(user.uid);
      if (userData && !userData.isProSubscriber) {
        await UserService.incrementScanCount(user.uid);
      }

      // Save the scan result to Firestore
      const scanData = {
        ...result,
        imageBase64,
        countryCode: location?.countryCode || 'US',
        currencyCode: location?.currencyCode || 'USD',
      };

      const scanId = await ScanService.saveScan(scanData);

      // Navigate to results screen
      navigation.replace('Results', {
        scanResult: { ...scanData, id: scanId },
        imageUri,
      });

    } catch (error) {
      console.error('Processing error:', error);
      // Navigate back with error
      navigation.goBack();
      // Could show an error alert here
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Show the image being processed */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.processingImage} />
        </View>

        {/* Loading indicator and message */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingTitle}>Analyzing Item...</Text>
          <Text style={styles.loadingMessage}>{loadingMessage}</Text>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressText}>This may take 10-30 seconds</Text>
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
    paddingHorizontal: 30,
  },
  imageContainer: {
    marginBottom: 40,
  },
  processingImage: {
    width: 200,
    height: 200,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: 'white',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  loadingMessage: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    width: '70%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});