// Cloud Function Service for calling the backend API
import { REACT_APP_BACKEND_URL } from '@env';

export class CloudFunctionService {
  // Use environment variable for backend URL
  static baseUrl = REACT_APP_BACKEND_URL;

  static async scanItem(imageBase64, countryCode, currencyCode, userId, description = '') {
    try {
      console.log('🚀 CloudFunction (RN): Starting scan request');
      console.log('📍 CloudFunction (RN): Base URL:', this.baseUrl);
      console.log('📍 CloudFunction (RN): Country/Currency:', countryCode, currencyCode);
      console.log('📍 CloudFunction (RN): User ID:', userId);
      console.log('📝 CloudFunction (RN): Description:', description || 'None provided');
      console.log('📍 CloudFunction (RN): Image size:', Math.round(imageBase64.length / 1024), 'KB');

      if (!userId) {
        throw new Error('User ID is required for scan requests');
      }

      const response = await fetch(`${this.baseUrl}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          countryCode,
          currencyCode,
          userId,  // Include userId in the request
          description: description || '',  // Include optional description
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ CloudFunction (RN): Backend API error:', response.status, errorText);
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ CloudFunction (RN): Scan completed successfully');
      
      return result;
    } catch (error) {
      console.error('❌ CloudFunction (RN): Error calling scan function:', error);
      throw error;
    }
  }
}