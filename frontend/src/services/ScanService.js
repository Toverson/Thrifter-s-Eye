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
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🔄 ScanService: Querying scans for userId:', user.uid);

      const scansQuery = query(
        collection(db, 'scans'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const scansSnapshot = await getDocs(scansQuery);
      console.log('🔄 ScanService: Query returned', scansSnapshot.docs.length, 'documents');
      
      const scans = scansSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('🔄 ScanService: Processing scan:', doc.id, '- userId:', data.userId);
        return {
          id: doc.id,
          ...data,
          // Convert Firestore timestamp to date for display
          timestamp: data.timestamp?.toDate() || new Date(),
        };
      });

      console.log('✅ ScanService: Processed', scans.length, 'scans successfully');
      return scans;
    } catch (error) {
      console.error('❌ ScanService: Error getting user scans:', error);
      console.error('❌ ScanService: Error details:', {
        code: error.code,
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