import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export class UserService {
  static async createUserIfNotExists(userId, email) {
    try {
      console.log('📝 UserService: Starting createUserIfNotExists for:', userId);
      console.log('📝 UserService: Email:', email);
      
      const userDocRef = doc(db, 'users', userId);
      console.log('📝 UserService: Getting user document...');
      
      const userDoc = await getDoc(userDocRef);
      console.log('📝 UserService: Document exists:', userDoc.exists());

      if (!userDoc.exists()) {
        console.log('📝 UserService: Creating new user document...');
        await setDoc(userDocRef, {
          userId,
          email,
          scanCount: 0,
          isProSubscriber: false,
          createdAt: serverTimestamp(),
        });
        console.log('✅ UserService: User document created successfully');
      } else {
        console.log('✅ UserService: User document already exists');
      }
    } catch (error) {
      console.error('❌ UserService: Error creating user document:', error);
      console.error('❌ UserService: Error code:', error.code);
      console.error('❌ UserService: Error message:', error.message);
      throw error; // Re-throw so the caller can handle it
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

  static async hasAgreedToTerms(userId) {
    try {
      console.log('🔄 UserService: Checking terms agreement for user:', userId);
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const hasAgreed = userData.hasAgreedToTerms === true;
        console.log('✅ UserService: User terms agreement status:', hasAgreed);
        return hasAgreed;
      }
      
      console.log('📝 UserService: User document not found, terms agreement required');
      return false;
    } catch (error) {
      console.error('❌ UserService: Error checking terms agreement:', error);
      return false;
    }
  }

  static async recordTermsAgreement(userId) {
    try {
      console.log('📝 UserService: Recording terms agreement for user:', userId);
      
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        hasAgreedToTerms: true,
        termsAgreementDate: new Date(),
        termsVersion: '1.0', // Track version in case terms change later
      }, { merge: true });
      
      console.log('✅ UserService: Terms agreement recorded successfully');
      return true;
    } catch (error) {
      console.error('❌ UserService: Error recording terms agreement:', error);
      return false;
    }
  }
}