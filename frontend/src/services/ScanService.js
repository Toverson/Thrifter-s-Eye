import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export class ScanService {
  static async saveScan(scanData) {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('User not authenticated');

      const scanWithUser = {
        ...scanData,
        userId: user.uid,
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await firestore()
        .collection('scans')
        .add(scanWithUser);

      return docRef.id;
    } catch (error) {
      console.error('Error saving scan:', error);
      throw error;
    }
  }

  static async getUserScans(limit = 10) {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('User not authenticated');

      const scansSnapshot = await firestore()
        .collection('scans')
        .where('userId', '==', user.uid)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      return scansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting user scans:', error);
      return [];
    }
  }

  static async getScanById(scanId) {
    try {
      const scanDoc = await firestore()
        .collection('scans')
        .doc(scanId)
        .get();

      if (scanDoc.exists) {
        return {
          id: scanDoc.id,
          ...scanDoc.data(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting scan by ID:', error);
      return null;
    }
  }
}