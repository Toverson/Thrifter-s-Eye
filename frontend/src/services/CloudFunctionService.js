// Cloud Function Service for calling the backend (simulated for web testing)
export class CloudFunctionService {
  // For web testing, we'll use the existing backend API
  static baseUrl = process.env.REACT_APP_BACKEND_URL;

  static async scanItem(imageBase64, countryCode, currencyCode) {
    try {
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
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the response to match the expected format
      return {
        itemName: data.item_name,
        estimatedValue: data.estimated_value,
        confidenceScore: data.confidence_score,
        aiAnalysis: data.ai_analysis,
        listingDraft: data.listing_draft,
        similarListings: data.similar_listings || [],
        visionResponse: data.vision_response,
        searchResponse: data.search_response,
      };
    } catch (error) {
      console.error('Error calling scan function:', error);
      throw error;
    }
  }
}