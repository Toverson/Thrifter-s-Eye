import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ResultsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { scanResult, imagePreview } = location.state || {};

  if (!scanResult) {
    navigate('/');
    return null;
  }

  const renderConfidenceBar = () => {
    const confidence = scanResult.confidenceScore || 0;
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Confidence Score</span>
          <span className="text-sm text-gray-600">{confidence}% confident</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${confidence}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const renderSimilarListings = () => {
    if (!scanResult.similarListings || scanResult.similarListings.length === 0) {
      return null;
    }

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Similar Listings</h3>
        <div className="space-y-3">
          {scanResult.similarListings.map((listing, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="font-semibold text-gray-800 text-sm mb-1" style={{ lineHeight: '1.3' }}>
                {listing.title}
              </h4>
              <p className="text-gray-600 text-xs mb-2" style={{ lineHeight: '1.4' }}>
                {listing.snippet}
              </p>
              {listing.link && (
                <a
                  href={listing.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  View Listing →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:text-blue-200 font-semibold mb-4 block"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold mb-2">{scanResult.itemName}</h1>
          <p className="text-xl text-blue-100">Estimated Value: {scanResult.estimatedValue}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Image */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Scanned Image</h3>
              <img
                src={imagePreview || `data:image/jpeg;base64,${scanResult.imageBase64}`}
                alt="Scanned item"
                className="w-full rounded-lg shadow-md"
              />
            </div>

            {renderConfidenceBar()}
          </div>

          {/* Right Column - Analysis */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">AI Analysis</h3>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-gray-800 leading-relaxed">{scanResult.aiAnalysis}</p>
              </div>
            </div>

            {scanResult.listingDraft && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Suggested Listing</h3>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <h4 className="font-bold text-green-800 mb-2">{scanResult.listingDraft.title}</h4>
                  <p className="text-green-700 leading-relaxed">{scanResult.listingDraft.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Listings - Full Width */}
        {renderSimilarListings()}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mt-8">
          <button
            onClick={() => navigate('/camera')}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full text-center transition-colors"
          >
            📸 Scan Another Item
          </button>
          
          <button
            onClick={() => navigate('/history')}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full text-center transition-colors"
          >
            📋 View History
          </button>
        </div>
      </div>
    </div>
  );
}