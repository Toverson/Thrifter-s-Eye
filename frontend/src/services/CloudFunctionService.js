// Cloud Function Service for calling the backend (simulated for web testing)
export class CloudFunctionService {
  // For web testing, we'll use the existing backend API
  static baseUrl = process.env.REACT_APP_BACKEND_URL;

  static async scanItem(imageBase64, countryCode, currencyCode) {
    try {
      console.log('🚀 CloudFunction: Starting scan request');
      console.log('📍 CloudFunction: Base URL:', this.baseUrl);
      console.log('📍 CloudFunction: Country/Currency:', countryCode, currencyCode);
      console.log('📍 CloudFunction: Image size:', Math.round(imageBase64.length / 1024), 'KB');

      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏰ CloudFunction: Request timeout after 45 seconds');
        controller.abort();
      }, 45000); // 45-second timeout (longer for mobile)

      const startTime = Date.now();
      
      // Convert base64 to file for our existing API
      const response = await fetch(`${this.baseUrl}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          countryCode,
          currencyCode,
        }),
        signal: controller.signal, // Add abort signal
      });

      clearTimeout(timeoutId); // Clear timeout if request completes
      const requestTime = Date.now() - startTime;
      console.log(`⏱️ CloudFunction: Request completed in ${requestTime}ms`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ CloudFunction: HTTP error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      console.log('✅ CloudFunction: Response received, parsing JSON');
      const data = await response.json();
      console.log('✅ CloudFunction: JSON parsed successfully');
      
      // Transform the response to match the expected format
      const result = {
        itemName: data.item_name,
        estimatedValue: data.estimated_value,
        confidenceScore: data.confidence_score,
        aiAnalysis: data.ai_analysis,
        listingDraft: data.listing_draft,
        similarListings: data.similar_listings || [],
        visionResponse: data.vision_response,
        searchResponse: data.search_response,
      };

      console.log('✅ CloudFunction: Scan completed successfully');
      return result;
      
    } catch (error) {
      console.error('❌ CloudFunction: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 45 seconds. Please check your internet connection and try again.');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw error;
      }
    }
  }
}