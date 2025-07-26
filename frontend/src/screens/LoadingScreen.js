import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { CloudFunctionService } from '../services/CloudFunctionService';
import { ScanService } from '../services/ScanService';
import { UserService } from '../services/UserService';

export default function LoadingScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { imageBase64, imagePreview, location: userLocation } = location.state || {};
  const [loadingMessage, setLoadingMessage] = useState('Identifying object...');

  const loadingMessages = [
    'Identifying object...',
    'Searching marketplaces...',
    'Analyzing value...',
    'Finalizing appraisal...',
  ];

  useEffect(() => {
    if (!imageBase64) {
      navigate('/camera');
      return;
    }
    
    processImage();
  }, [imageBase64, navigate]);

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
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      // Call the cloud function to analyze the image
      const result = await CloudFunctionService.scanItem(
        imageBase64,
        userLocation?.countryCode || 'US',
        userLocation?.currencyCode || 'USD'
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
        countryCode: userLocation?.countryCode || 'US',
        currencyCode: userLocation?.currencyCode || 'USD',
      };

      const scanId = await ScanService.saveScan(scanData);

      // Navigate to results screen
      navigate('/results', {
        state: {
          scanResult: { ...scanData, id: scanId },
          imagePreview,
        }
      });

    } catch (error) {
      console.error('Processing error:', error);
      alert('Failed to analyze image. Please try again.');
      navigate('/camera');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="text-center">
        {/* Show the image being processed */}
        {imagePreview && (
          <div className="mb-8">
            <img
              src={imagePreview}
              alt="Processing item"
              className="w-48 h-48 object-cover rounded-lg border-4 border-white shadow-lg mx-auto"
            />
          </div>
        )}

        {/* Loading indicator and message */}
        <div className="mb-8">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-white mb-4">Analyzing Item...</h2>
          <p className="text-xl text-blue-100">{loadingMessage}</p>
        </div>

        {/* Progress indicator */}
        <div className="max-w-md mx-auto">
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mb-4">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-1000"
              style={{ width: '70%' }}
            ></div>
          </div>
          <p className="text-blue-100 text-sm">This may take 10-30 seconds</p>
        </div>
      </div>
    </div>
  );
}