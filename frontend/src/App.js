import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [scanHistory, setScanHistory] = useState([]);
  const fileInputRef = useRef(null);

  const loadingMessages = [
    'Identifying object...',
    'Searching marketplaces...',
    'Analyzing value...',
    'Finalizing appraisal...'
  ];

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if (file) {
      scanItem(file);
    }
  };

  const scanItem = async (file) => {
    setLoading(true);
    setCurrentScreen('loading');
    let messageIndex = 0;
    
    const messageInterval = setInterval(() => {
      if (messageIndex < loadingMessages.length) {
        setLoadingMessage(loadingMessages[messageIndex]);
        messageIndex++;
      }
    }, 2000);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/api/scan`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      clearInterval(messageInterval);
      setScanResult(response.data);
      setCurrentScreen('results');
    } catch (error) {
      clearInterval(messageInterval);
      console.error('Scan failed:', error);
      alert('Scan failed. Please try again.');
      setCurrentScreen('home');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/history`);
      setScanHistory(response.data);
      setCurrentScreen('history');
    } catch (error) {
      console.error('Failed to load history:', error);
      alert('Failed to load history');
    }
  };

  const viewScanResult = (scan) => {
    setScanResult(scan);
    setCurrentScreen('results');
  };

  const HomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">Thrifter's Eye</h1>
        <p className="text-xl text-blue-100">AI-powered item identification and valuation</p>
      </div>

      <div className="space-y-4 w-full max-w-sm">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-white hover:bg-gray-100 text-purple-600 font-bold py-4 px-8 rounded-full text-xl shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          📸 Scan Item
        </button>
        
        <button
          onClick={loadHistory}
          className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-200"
        >
          📋 View History
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files[0])}
        className="hidden"
      />
    </div>
  );

  const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-8"></div>
        <h2 className="text-3xl font-bold text-white mb-4">Analyzing Item...</h2>
        <p className="text-xl text-blue-100">{loadingMessage}</p>
      </div>
    </div>
  );

  const ResultsScreen = () => (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <button
              onClick={() => setCurrentScreen('home')}
              className="mb-4 text-white hover:text-gray-200"
            >
              ← Back to Home
            </button>
            <h1 className="text-3xl font-bold">{scanResult?.item_name}</h1>
            <p className="text-lg text-blue-100">Estimated Value: {scanResult?.estimated_value}</p>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Scanned Image</h3>
                <img
                  src={`data:image/jpeg;base64,${scanResult?.image_base64}`}
                  alt="Scanned item"
                  className="w-full rounded-lg shadow-md"
                />
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Analysis</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-800">{scanResult?.ai_analysis}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Confidence Score</h3>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"
                      style={{ width: `${scanResult?.confidence_score}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{scanResult?.confidence_score}% confident</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-3">Listing Draft</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">{scanResult?.listing_draft?.title}</h4>
                <p className="text-green-700">{scanResult?.listing_draft?.description}</p>
              </div>
            </div>

            {scanResult?.similar_listings?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-3">Similar Listings</h3>
                <div className="space-y-3">
                  {scanResult.similar_listings.map((listing, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800">{listing.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{listing.snippet}</p>
                      <a
                        href={listing.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                      >
                        View Listing →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const HistoryScreen = () => (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <button
              onClick={() => setCurrentScreen('home')}
              className="mb-4 text-white hover:text-gray-200"
            >
              ← Back to Home
            </button>
            <h1 className="text-3xl font-bold">Scan History</h1>
          </div>

          <div className="p-6">
            {scanHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No scans yet. Start by scanning your first item!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {scanHistory.map((scan) => (
                  <div
                    key={scan.id}
                    onClick={() => viewScanResult(scan)}
                    className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <img
                      src={`data:image/jpeg;base64,${scan.image_base64}`}
                      alt={scan.item_name}
                      className="w-16 h-16 object-cover rounded-lg mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{scan.item_name}</h3>
                      <p className="text-sm text-gray-600">{scan.estimated_value}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(scan.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-gray-400">→</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'loading' && <LoadingScreen />}
      {currentScreen === 'results' && <ResultsScreen />}
      {currentScreen === 'history' && <HistoryScreen />}
    </div>
  );
}

export default App;