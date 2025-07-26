import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CameraScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { location: userLocation } = location.state || {};
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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
      }
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="text-purple-600 hover:text-purple-800 font-semibold"
          >
            ← Back to Home
          </button>
          <h1 className="flex-1 text-center text-xl font-bold">Scan Item</h1>
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
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transition-colors"
              >
                🔍 Analyze Item
              </button>
              
              <button
                onClick={triggerFileInput}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-colors"
              >
                📷 Choose Different Photo
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-80 h-80 mx-auto bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-400">
                <div className="text-center">
                  <span className="text-6xl text-gray-400 block mb-4">📷</span>
                  <p className="text-gray-600">
                    Take a clear photo of the item you want to identify and value
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={triggerFileInput}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transition-colors"
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
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-800 mb-3">📋 Tips for Best Results</h3>
            <ul className="text-blue-700 space-y-2 text-sm">
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