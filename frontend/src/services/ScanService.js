import { auth } from '../firebase';

export class ScanService {
  static async saveScan(scanData) {
    try {
      const user = auth.currentUser;
      console.log('🔄 ScanService: saveScan called - USING BACKEND API');
      console.log('🔄 ScanService: Current user:', user ? user.uid : 'No user');
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🔄 ScanService: Using backend API POST /api/scan');
      console.log('🔄 ScanService: Scan data keys:', Object.keys(scanData));

      // Use backend API instead of direct Firestore
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: scanData.imageBase64,
          countryCode: scanData.countryCode || 'US',
          currencyCode: scanData.currencyCode || 'USD'
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ ScanService: Scan saved successfully via backend API with ID:', result.id);
      
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
      console.log('🔄 ScanService: getUserScans called - USING BACKEND API');
      console.log('🔄 ScanService: Current user:', user ? user.uid : 'No user');
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🔄 ScanService: Fetching scans from backend API GET /api/history');

      // Use backend API instead of Firestore
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const scans = await response.json();
      console.log('🔄 ScanService: Backend API returned', scans.length, 'total scans');

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

      console.log('✅ ScanService: Processed', formattedScans.length, 'scans from backend API');
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
      const scanDoc = await getDoc(doc(db, 'scans', scanId));

      if (scanDoc.exists()) {
        return {
          id: scanDoc.id,
          ...scanDoc.data(),
          timestamp: scanDoc.data().timestamp?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting scan by ID:', error);
      return null;
    }
  }
}