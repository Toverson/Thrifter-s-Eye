import { collection, addDoc, query, where, orderBy, limit, getDocs, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export class ScanService {
  static async saveScan(scanData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const scanWithUser = {
        ...scanData,
        userId: user.uid,
        timestamp: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'scans'), scanWithUser);
      return docRef.id;
    } catch (error) {
      console.error('Error saving scan:', error);
      throw error;
    }
  }

  static async getUserScans(limitCount = 10) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const scansQuery = query(
        collection(db, 'scans'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const scansSnapshot = await getDocs(scansQuery);
      return scansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to date for display
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error getting user scans:', error);
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