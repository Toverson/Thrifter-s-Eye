import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export class UserService {
  static async createUserIfNotExists(userId, email) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', userId), {
          userId,
          email,
          scanCount: 0,
          isProSubscriber: false,
          createdAt: serverTimestamp(),
        });
        console.log('User document created');
      }
    } catch (error) {
      console.error('Error creating user document:', error);
    }
  }

  static async getUserData(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  static async incrementScanCount(userId) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        scanCount: increment(1),
      });
    } catch (error) {
      console.error('Error incrementing scan count:', error);
    }
  }

  static async updateProStatus(userId, isProSubscriber) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isProSubscriber,
      });
    } catch (error) {
      console.error('Error updating pro status:', error);
    }
  }

  static async canUserScan(userId) {
    try {
      const userData = await this.getUserData(userId);
      if (!userData) return false;

      // Pro users can always scan
      if (userData.isProSubscriber) return true;

      // Free users can scan up to 5 times
      return userData.scanCount < 5;
    } catch (error) {
      console.error('Error checking scan permissions:', error);
      return false;
    }
  }
}