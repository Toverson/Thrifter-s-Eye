// Cloud Function Service for calling the backend
export class CloudFunctionService {
  static baseUrl = 'https://us-central1-thrifters-eye-app.cloudfunctions.net';

  static async scanItem(imageBase64, countryCode, currencyCode) {
    try {
      const response = await fetch(`${this.baseUrl}/scanItem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          countryCode,
          currencyCode,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling scan function:', error);
      throw error;
    }
  }
}