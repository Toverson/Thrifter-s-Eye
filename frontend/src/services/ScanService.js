import { auth } from '../firebase';

export class ScanService {
  static async saveScan(scanData) {
    try {
      const user = auth.currentUser;
      console.log('🔄 ScanService: saveScan called - USING BACKEND API WITH USER ID');
      console.log('🔄 ScanService: Current user:', user ? user.uid : 'No user');
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🔄 ScanService: Using backend API POST /api/scan with userId:', user.uid);
      console.log('🔄 ScanService: Scan data keys:', Object.keys(scanData));

      // Use backend API with user ID
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: scanData.imageBase64,
          countryCode: scanData.countryCode || 'US',
          currencyCode: scanData.currencyCode || 'USD',
          userId: user.uid  // Send actual Firebase user ID
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ ScanService: Scan saved successfully via backend API with ID:', result.id);
      console.log('✅ ScanService: Scan saved for user:', user.uid);
      
      return result.id;
    } catch (error) {
      console.error('❌ ScanService: Error saving scan via backend API:', error);
      console.error('❌ ScanService: Error details:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  static async getUserScans(limitCount = 10) {
    try {
      const user = auth.currentUser;
      console.log('🔄 ScanService: getUserScans called - USING USER-SPECIFIC BACKEND API');
      console.log('🔄 ScanService: Current user:', user ? user.uid : 'No user');
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🔄 ScanService: Fetching user-specific scans from backend API GET /api/history?user_id=', user.uid);

      // Use backend API with user ID filter
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/history?user_id=${encodeURIComponent(user.uid)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const scans = await response.json();
      console.log('🔄 ScanService: Backend API returned', scans.length, 'scans for user:', user.uid);

      // Convert backend format to frontend format and limit results
      const formattedScans = scans.slice(0, limitCount).map(scan => ({
        id: scan.id,
        itemName: scan.item_name,
        estimatedValue: scan.estimated_value,
        confidenceScore: scan.confidence_score,
        aiAnalysis: scan.ai_analysis,
        listingDraft: scan.listing_draft,
        similarListings: scan.similar_listings,
        imageBase64: scan.image_base64,
        countryCode: scan.country_code,
        currencyCode: scan.currency_code,
        timestamp: new Date(scan.timestamp),
        userId: scan.user_id
      }));

      console.log('✅ ScanService: Processed', formattedScans.length, 'user-specific scans from backend API');
      console.log('✅ ScanService: All scans belong to user:', user.uid);
      
      return formattedScans;
    } catch (error) {
      console.error('❌ ScanService: Error getting user scans from backend API:', error);
      console.error('❌ ScanService: Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      return [];
    }
  }

  static async getScanById(scanId) {
    try {
      console.log('🔄 ScanService: getScanById called - USING BACKEND API');
      console.log('🔄 ScanService: Scan ID:', scanId);

      // Use backend API instead of Firestore
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/scan/${scanId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('❌ ScanService: Scan not found');
          return null;
        }
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const scan = await response.json();
      console.log('✅ ScanService: Retrieved scan by ID from backend API');

      // Convert backend format to frontend format
      return {
        id: scan.id,
        itemName: scan.item_name,
        estimatedValue: scan.estimated_value,
        confidenceScore: scan.confidence_score,
        aiAnalysis: scan.ai_analysis,
        listingDraft: scan.listing_draft,
        similarListings: scan.similar_listings,
        imageBase64: scan.image_base64,
        countryCode: scan.country_code,
        currencyCode: scan.currency_code,
        timestamp: new Date(scan.timestamp),
        userId: scan.user_id
      };
    } catch (error) {
      console.error('❌ ScanService: Error getting scan by ID from backend API:', error);
      return null;
    }
  }
}