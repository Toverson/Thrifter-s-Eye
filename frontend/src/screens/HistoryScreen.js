import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { ScanService } from '../services/ScanService';
import { useTheme } from '../contexts/ThemeContext';

export default function HistoryScreen() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Wait for authentication state to be confirmed
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔄 HistoryScreen: Auth state changed:', currentUser ? currentUser.uid : 'No user');
      setUser(currentUser);
      
      if (currentUser) {
        loadScans(currentUser);
      } else {
        setLoading(false);
        setScans([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadScans = async (currentUser = user) => {
    try {
      setLoading(true);
      console.log('🔄 HistoryScreen: Loading scans for user:', currentUser?.uid);
      
      if (!currentUser) {
        console.log('❌ HistoryScreen: No authenticated user found');
        setScans([]);
        return;
      }

      const userScans = await ScanService.getUserScans(10); // Limit to 10 most recent
      console.log('✅ HistoryScreen: Loaded', userScans.length, 'scans');
      setScans(userScans);
    } catch (error) {
      console.error('❌ HistoryScreen: Error loading scans:', error);
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateToResult = (scan) => {
    navigate('/results', {
      state: {
        scanResult: scan,
        imagePreview: `data:image/jpeg;base64,${scan.imageBase64}`,
      }
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderEmptyState = () => (
    <div className="text-center py-16">
      <div className="text-6xl mb-6">📋</div>
      <h3 className={`text-2xl font-bold ${theme.colors.text} mb-4`}>No scans yet</h3>
      <p className={`${theme.colors.textSecondary} mb-8 max-w-md mx-auto`}>
        Start by scanning your first item to see your history here!
      </p>
      <button
        onClick={() => navigate('/')}
        className={`${theme.colors.primary} ${theme.colors.primaryText} font-bold py-3 px-8 rounded-full transition-colors`}
      >
        📸 Scan Your First Item
      </button>
    </div>
  );

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
          <h1 className={`flex-1 text-center text-xl font-bold ${theme.colors.text}`}>Scan History</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className={theme.colors.textSecondary}>Loading your scan history...</p>
          </div>
        ) : scans.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-4">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => navigateToResult(scan)}
                  className={`${theme.colors.surface} rounded-lg shadow-md p-4 cursor-pointer ${theme.colors.cardHover} transition-shadow ${theme.colors.border} border`}
                >
                  <div className="flex items-center">
                    <img
                      src={`data:image/jpeg;base64,${scan.imageBase64}`}
                      alt={scan.itemName}
                      className="w-16 h-16 object-cover rounded-lg mr-4"
                    />
                    <div className="flex-1">
                      <h3 className={`font-bold ${theme.colors.text} text-lg`}>{scan.itemName || 'Unknown Item'}</h3>
                      <p className="text-green-600 font-semibold">{scan.estimatedValue || 'Value unknown'}</p>
                      <p className={`${theme.colors.textMuted} text-sm`}>{formatDate(scan.timestamp)}</p>
                    </div>
                    <div className={`${theme.colors.textMuted} text-xl`}>→</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons - Always visible */}
        <div className="flex justify-center items-center space-x-6 mt-8">
          <button
            onClick={loadScans}
            className="text-purple-600 hover:text-purple-800 font-semibold"
          >
            🔄 Refresh
          </button>
          
          <button
            onClick={async () => {
              console.log('🔄 Clear History button clicked');
              
              const confirmed = window.confirm('Are you sure you want to clear all scan history? This action cannot be undone.');
              console.log('🔄 User confirmation:', confirmed);
              
              if (!confirmed) {
                console.log('❌ User cancelled confirmation dialog');
                return;
              }
              
              try {
                console.log('🗑️ Starting scan history clearing process...');
                const result = await ScanService.clearUserHistory();
                console.log('✅ Scan history cleared successfully:', result);
                
                // Show success message
                const message = `Successfully cleared ${result.deleted_count} scans from your history.`;
                console.log('✅ Showing success message:', message);
                alert(message);
                
                // Reload the history to show empty state
                console.log('🔄 Reloading scan history...');
                await loadScans();
                console.log('✅ Scan history reloaded');
              } catch (error) {
                console.error('❌ Failed to clear history - Full error details:', error);
                console.error('❌ Error message:', error.message);
                console.error('❌ Error stack:', error.stack);
                alert('Failed to clear scan history. Please try again.');
              }
            }}
            className="text-red-600 hover:text-red-800 font-semibold"
          >
            🗑️ Clear History
          </button>
            🗑️ Clear History
          </button>
        </div>
      </div>
    </div>
  );
}