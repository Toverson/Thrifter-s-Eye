import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function ResultsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { scanResult, imagePreview } = location.state || {};
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  if (!scanResult) {
    return (
      <div className={`min-h-screen ${theme.colors.backgroundSecondary} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className={`text-2xl font-bold ${theme.colors.text} mb-4`}>No Results Found</h2>
          <p className={`${theme.colors.textSecondary} mb-6`}>
            Something went wrong. Please try scanning again.
          </p>
          <button
            onClick={() => navigate('/camera')}
            className={`${theme.colors.primary} ${theme.colors.primaryText} font-bold py-3 px-6 rounded-full transition-colors`}
          >
            📸 Scan Again
          </button>
        </div>
      </div>
    );
  }

  const confidenceColor = scanResult.confidenceScore >= 70 
    ? 'text-green-600' 
    : scanResult.confidenceScore >= 40 
    ? 'text-yellow-600' 
    : 'text-red-600';

  const confidenceText = scanResult.confidenceScore >= 70 
    ? 'High Confidence' 
    : scanResult.confidenceScore >= 40 
    ? 'Medium Confidence' 
    : 'Low Confidence';

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
          <h1 className={`flex-1 text-center text-xl font-bold ${theme.colors.text}`}>Scan Results</h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Image and Basic Info */}
        <div className={`${theme.colors.surface} rounded-lg shadow-lg overflow-hidden mb-8 ${theme.colors.border} border`}>
          <div className="md:flex">
            <div className="md:w-1/2">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt={scanResult.itemName}
                  className="w-full h-80 md:h-full object-cover"
                />
              )}
            </div>
            <div className="md:w-1/2 p-6">
              <h2 className={`text-3xl font-bold ${theme.colors.text} mb-4`}>
                {scanResult.itemName || 'Unknown Item'}
              </h2>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-lg ${theme.colors.textSecondary}`}>Estimated Value:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {scanResult.estimatedValue || 'Value unknown'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme.colors.textSecondary}`}>Confidence:</span>
                  <span className={`text-sm font-semibold ${confidenceColor}`}>
                    {scanResult.confidenceScore || 0}% - {confidenceText}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/camera')}
                  className={`w-full ${theme.colors.primary} ${theme.colors.primaryText} font-bold py-3 px-6 rounded-lg transition-colors`}
                >
                  📸 Scan Another Item
                </button>
                
                <button
                  onClick={() => navigate('/history')}
                  className={`w-full ${theme.colors.secondary} ${theme.colors.secondaryText} font-bold py-3 px-6 rounded-lg transition-colors`}
                >
                  📱 View All Scans
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className={`${theme.colors.surface} rounded-lg shadow-lg p-6 mb-8 ${theme.colors.border} border`}>
          <h3 className={`text-xl font-bold ${theme.colors.text} mb-4`}>AI Analysis</h3>
          <div className={`${theme.colors.backgroundTertiary} rounded-lg p-4`}>
            <p className={`${theme.colors.textSecondary} leading-relaxed`}>
              {showFullAnalysis 
                ? scanResult.aiAnalysis || 'No detailed analysis available.'
                : (scanResult.aiAnalysis?.substring(0, 200) + '...' || 'No analysis available.')
              }
            </p>
            {scanResult.aiAnalysis && scanResult.aiAnalysis.length > 200 && (
              <button
                onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                className="text-purple-600 hover:text-purple-800 font-medium mt-2 text-sm"
              >
                {showFullAnalysis ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
        </div>

        {/* Marketplace Listing Draft */}
        {scanResult.listingDraft && (
          <div className={`${theme.colors.surface} rounded-lg shadow-lg p-6 mb-8 ${theme.colors.border} border`}>
            <h3 className={`text-xl font-bold ${theme.colors.text} mb-4`}>📝 Suggested Listing</h3>
            <div className={`${theme.colors.backgroundTertiary} rounded-lg p-4`}>
              <h4 className={`font-semibold ${theme.colors.text} mb-2`}>Title:</h4>
              <p className={`${theme.colors.textSecondary} mb-4`}>
                {scanResult.listingDraft.title || 'No title available'}
              </p>
              
              <h4 className={`font-semibold ${theme.colors.text} mb-2`}>Description:</h4>
              <p className={`${theme.colors.textSecondary} text-sm leading-relaxed`}>
                {scanResult.listingDraft.description || 'No description available'}
              </p>
            </div>
          </div>
        )}

        {/* Similar Listings */}
        {scanResult.similarListings && scanResult.similarListings.length > 0 && (
          <div className={`${theme.colors.surface} rounded-lg shadow-lg p-6 ${theme.colors.border} border`}>
            <h3 className={`text-xl font-bold ${theme.colors.text} mb-4`}>🛒 Similar Marketplace Listings</h3>
            <div className="space-y-4">
              {scanResult.similarListings.slice(0, 5).map((listing, index) => (
                <div key={index} className={`${theme.colors.backgroundTertiary} rounded-lg p-4`}>
                  <h4 className={`font-semibold ${theme.colors.text} mb-1 text-sm`}>
                    {listing.title || 'Untitled Listing'}
                  </h4>
                  <p className={`${theme.colors.textSecondary} text-xs mb-2`}>
                    {listing.snippet || 'No description available'}
                  </p>
                  {listing.link && (
                    <a
                      href={listing.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                    >
                      View Listing →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}