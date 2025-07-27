import { collection, addDoc, query, where, orderBy, limit, getDocs, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export class ScanService {
  static async saveScan(scanData) {
    try {
      const user = auth.currentUser;
      console.log('🔄 ScanService: saveScan called');
      console.log('🔄 ScanService: Current user:', user ? user.uid : 'No user');
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const scanWithUser = {
        ...scanData,
        userId: user.uid,
        timestamp: serverTimestamp(),
      };

      console.log('🔄 ScanService: Preparing to save scan with userId:', user.uid);
      console.log('🔄 ScanService: Scan data keys:', Object.keys(scanWithUser));

      const docRef = await addDoc(collection(db, 'scans'), scanWithUser);
      console.log('✅ ScanService: Scan saved successfully with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ ScanService: Error saving scan:', error);
      console.error('❌ ScanService: Error details:', {
        code: error.code,
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