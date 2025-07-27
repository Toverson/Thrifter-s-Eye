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
      console.log('🔄 ScanService: getUserScans called');
      console.log('🔄 ScanService: Current user:', user ? user.uid : 'No user');
      console.log('🔄 ScanService: Full user object:', user);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🔄 ScanService: Querying scans for userId:', user.uid);
      console.log('🔄 ScanService: Auth state:', {
        isAnonymous: user.isAnonymous,
        uid: user.uid,
        email: user.email
      });

      // First, let's try to get ALL scans to see what's in the database
      console.log('🔍 DEBUG: Fetching ALL scans to debug...');
      const allScansQuery = query(collection(db, 'scans'));
      const allScansSnapshot = await getDocs(allScansQuery);
      console.log('🔍 DEBUG: Total scans in database:', allScansSnapshot.docs.length);
      
      allScansSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log('🔍 DEBUG: Found scan:', {
          id: doc.id,
          userId: data.userId,
          timestamp: data.timestamp,
          itemName: data.itemName || 'No name'
        });
      });

      // Now query for user-specific scans
      const scansQuery = query(
        collection(db, 'scans'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      console.log('🔄 ScanService: Executing user-specific query...');
      const scansSnapshot = await getDocs(scansQuery);
      console.log('🔄 ScanService: User-specific query returned', scansSnapshot.docs.length, 'documents');
      
      const scans = scansSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('🔄 ScanService: Processing user scan:', doc.id, '- userId:', data.userId);
        return {
          id: doc.id,
          ...data,
          // Convert Firestore timestamp to date for display
          timestamp: data.timestamp?.toDate() || new Date(),
        };
      });

      console.log('✅ ScanService: Processed', scans.length, 'user scans successfully');
      return scans;
    } catch (error) {
      console.error('❌ ScanService: Error getting user scans:', error);
      console.error('❌ ScanService: Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // If it's a Firestore rules error, log more details
      if (error.code === 'permission-denied') {
        console.error('❌ ScanService: Permission denied - check Firestore security rules');
      }
      
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