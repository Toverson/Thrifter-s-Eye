import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme } from '../contexts/ThemeContext';

export default function CameraScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { location } = route.params || {};
  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions needed',
        'Camera and photo library permissions are required to scan items.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const processedImage = await processImage(result.assets[0].uri);
        setSelectedImage(processedImage);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      console.error('Camera error:', error);
    }
  };

  const pickFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const processedImage = await processImage(result.assets[0].uri);
        setSelectedImage(processedImage);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
      console.error('Image picker error:', error);
    }
  };

  const processImage = async (uri) => {
    try {
      // Resize and compress image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      return manipulatedImage;
    } catch (error) {
      console.error('Image processing error:', error);
      return { uri, base64: null };
    }
  };

  const proceedWithScan = () => {
    if (!selectedImage || !selectedImage.base64) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    navigation.navigate('Loading', {
      imageBase64: selectedImage.base64,
      imageUri: selectedImage.uri,
      location,
      description: description.trim(), // Pass the description
    });
  };

  const showImageSourceDialog = () => {
    Alert.alert(
      'Select Image Source',
      'Choose how you want to add an image',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]
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
    title: {
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
      <View style={dynamicStyles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>Scan Item</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
            <TouchableOpacity 
              style={styles.retakeButton} 
              onPress={showImageSourceDialog}
            >
              <Text style={styles.retakeButtonText}>Retake Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>📷</Text>
              <Text style={styles.instructionText}>
                Take a clear photo of the item you want to identify and value
              </Text>
            </View>
          </View>
        )}

        {/* Description input field */}
        <View style={[styles.descriptionContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.descriptionLabel, { color: theme.colors.text }]}>
            Description (optional)
          </Text>
          <TextInput
            style={[styles.descriptionInput, { backgroundColor: theme.colors.backgroundSecondary, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g., 'vintage leather jacket', 'ceramic vase with blue pattern', 'antique wooden chair'..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={3}
            maxLength={200}
            textAlignVertical="top"
          />
          <View style={styles.characterCountContainer}>
            <Text style={[styles.characterCount, { color: theme.colors.textMuted }]}>
              {description.length}/200
            </Text>
          </View>
          <Text style={[styles.descriptionHint, { color: theme.colors.textSecondary }]}>
            💡 Adding a description helps our AI provide more accurate pricing and better listing suggestions
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {!selectedImage ? (
            <TouchableOpacity 
              style={styles.cameraButton} 
              onPress={showImageSourceDialog}
            >
              <Text style={styles.cameraButtonText}>📸 Take Photo</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.scanButton} 
              onPress={proceedWithScan}
            >
              <Text style={styles.scanButtonText}>🔍 Analyze Item</Text>
            </TouchableOpacity>
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  selectedImage: {
    width: 250,
    height: 250,
    borderRadius: 15,
    marginBottom: 15,
  },
  placeholderContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imagePlaceholder: {
    width: 250,
    height: 250,
    backgroundColor: '#e5e5e5',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#d0d0d0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 60,
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  descriptionContainer: {
    marginBottom: 30,
    padding: 20,
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
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 8,
  },
  characterCountContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
  },
  descriptionHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  retakeButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 10,
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scanButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 30,
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
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});