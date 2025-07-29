import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function CameraScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { location: userLocation } = location.state || {};
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef(null);

  const compressImage = (file, maxWidth = 1024, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📸 Original file size:', Math.round(file.size / 1024), 'KB');

    try {
      // Compress image for mobile optimization
      const compressedDataUrl = await compressImage(file);
      console.log('📸 Compressed image size:', Math.round(compressedDataUrl.length / 1024), 'KB');
      
      // Set preview
      setImagePreview(compressedDataUrl);
      
      // Extract base64 for processing
      const base64 = compressedDataUrl.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      setSelectedImage(base64);
      
    } catch (error) {
      console.error('Error compressing image:', error);
      // Fallback to original processing if compression fails
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        const base64 = e.target.result.split(',')[1];
        setSelectedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const proceedWithScan = () => {
    if (!selectedImage) {
      alert('Please select an image first');
      return;
    }

    navigate('/loading', {
      state: {
        imageBase64: selectedImage,
        imagePreview,
        location: userLocation,
        description: description.trim(), // Pass the description to the loading screen
      }
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`min-h-screen ${theme.colors.backgroundSecondary}`}>
      {/* Header */}
      <div className={`${theme.colors.surface} shadow-sm ${theme.colors.border} border-b`}>
        <div className="container mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="text-purple-600 hover:text-purple-800 font-semibold"
          >
            ← Back to Home
          </button>
          <h1 className={`flex-1 text-center text-xl font-bold ${theme.colors.text}`}>Scan Item</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {selectedImage ? (
          <div className="text-center">
            <div className="mb-8">
              <img
                src={imagePreview}
                alt="Selected item"
                className="w-80 h-80 object-cover rounded-lg shadow-lg mx-auto"
              />
            </div>
            
            <div className="space-y-4 max-w-md mx-auto">
              <button
                onClick={proceedWithScan}
                className={`w-full ${theme.colors.primary} ${theme.colors.primaryText} font-bold py-4 px-8 rounded-full text-xl shadow-lg transition-colors`}
              >
                🔍 Analyze Item
              </button>
              
              <button
                onClick={triggerFileInput}
                className={`w-full ${theme.colors.secondary} ${theme.colors.secondaryText} font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-colors`}
              >
                📷 Choose Different Photo
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-8">
              <div className={`w-80 h-80 mx-auto ${theme.colors.backgroundTertiary} rounded-lg flex items-center justify-center ${theme.colors.border} border-2 border-dashed`}>
                <div className="text-center">
                  <span className={`text-6xl ${theme.colors.textSecondary} block mb-4`}>📷</span>
                  <p className={theme.colors.textSecondary}>
                    Take a clear photo of the item you want to identify and value
                  </p>
                </div>
              </div>
            </div>
            
            {/* Description input field */}
            <div className="max-w-md mx-auto mb-6">
              <label className={`block ${theme.colors.text} font-medium mb-2 text-left`}>
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., 'vintage leather jacket', 'ceramic vase with blue pattern', 'antique wooden chair'..."
                maxLength={200}
                rows={3}
                className={`w-full px-4 py-3 rounded-lg ${theme.colors.surface} ${theme.colors.border} border-2 ${theme.colors.text} placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-colors resize-none`}
              />
              <div className={`text-right mt-1 ${theme.colors.textMuted} text-sm`}>
                {description.length}/200
              </div>
              <p className={`${theme.colors.textSecondary} text-sm mt-2 text-left`}>
                💡 Adding a description helps our AI provide more accurate pricing and better listing suggestions
              </p>
            </div>

            <button
              onClick={triggerFileInput}
              className={`${theme.colors.primary} ${theme.colors.primaryText} font-bold py-4 px-8 rounded-full text-xl shadow-lg transition-colors`}
            >
              📸 Take Photo
            </button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Instructions */}
        <div className={`mt-12 max-w-2xl mx-auto`}>
          <div className={`${theme.colors.surface} ${theme.colors.border} border rounded-lg p-6`}>
            <h3 className={`font-bold ${theme.colors.text} mb-3`}>📋 Tips for Best Results</h3>
            <ul className={`${theme.colors.textSecondary} space-y-2 text-sm`}>
              <li>• Ensure good lighting on the item</li>
              <li>• Take a clear, focused photo</li>
              <li>• Include any visible text or brand markings</li>
              <li>• Avoid shadows or reflections</li>
              <li>• Center the item in the frame</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}