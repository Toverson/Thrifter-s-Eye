import firestore from '@react-native-firebase/firestore';

export class UserService {
  static async createUserIfNotExists(userId, email) {
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        await firestore()
          .collection('users')
          .doc(userId)
          .set({
            userId,
            email,
            scanCount: 0,
            isProSubscriber: false,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
        console.log('User document created');
      }
    } catch (error) {
      console.error('Error creating user document:', error);
    }
  }

  static async getUserData(userId) {
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(userId)
        .get();

      if (userDoc.exists) {
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
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          scanCount: firestore.FieldValue.increment(1),
        });
    } catch (error) {
      console.error('Error incrementing scan count:', error);
    }
  }

  static async updateProStatus(userId, isProSubscriber) {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
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
      console.log('🔄 UserService (RN): Checking terms agreement for user:', userId);
      const userDoc = await firestore().collection('users').doc(userId).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        const hasAgreed = userData.hasAgreedToTerms === true;
        console.log('✅ UserService (RN): User terms agreement status:', hasAgreed);
        return hasAgreed;
      }
      
      console.log('📝 UserService (RN): User document not found, terms agreement required');
      return false;
    } catch (error) {
      console.error('❌ UserService (RN): Error checking terms agreement:', error);
      return false;
    }
  }

  static async recordTermsAgreement(userId) {
    try {
      console.log('📝 UserService (RN): Recording terms agreement for user:', userId);
      
      await firestore().collection('users').doc(userId).set({
        hasAgreedToTerms: true,
        termsAgreementDate: firestore.Timestamp.now(),
        termsVersion: '1.0', // Track version in case terms change later
      }, { merge: true });
      
      console.log('✅ UserService (RN): Terms agreement recorded successfully');
      return true;
    } catch (error) {
      console.error('❌ UserService (RN): Error recording terms agreement:', error);
      return false;
    }
  }
}