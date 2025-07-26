const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleAuth } = require('google-auth-library');
const vision = require('@google-cloud/vision');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Google Cloud Vision API
const visionClient = new vision.ImageAnnotatorClient();

// Cloud Function for scanning items
exports.scanItem = functions.https.onCall(async (data, context) => {
  try {
    const { imageBase64, countryCode = 'US', currencyCode = 'USD' } = data;

    if (!imageBase64) {
      throw new functions.https.HttpsError('invalid-argument', 'Image data is required');
    }

    // Step 1: Analyze with Google Vision API
    const visionData = await analyzeImageWithVision(imageBase64);
    
    // Step 2: Search marketplaces
    const searchData = await searchMarketplaces(visionData, countryCode);
    
    // Step 3: Analyze with Gemini AI
    const aiResult = await analyzeWithGemini(visionData, searchData, countryCode, currencyCode);

    return {
      ...aiResult,
      visionResponse: visionData,
      searchResponse: searchData,
    };

  } catch (error) {
    console.error('Scan function error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process scan', error.message);
  }
});

async function analyzeImageWithVision(imageBase64) {
  try {
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    
    // Object localization
    const [objectsResult] = await visionClient.objectLocalization({
      image: { content: imageBuffer },
    });
    
    const objects = objectsResult.localizedObjectAnnotations
      ? objectsResult.localizedObjectAnnotations.slice(0, 5).map(obj => obj.name)
      : [];

    // Text detection
    const [textResult] = await visionClient.textDetection({
      image: { content: imageBuffer },
    });
    
    const texts = textResult.textAnnotations
      ? textResult.textAnnotations.slice(0, 3).map(text => text.description)
      : [];

    return {
      objects,
      texts,
      primaryObject: objects[0] || 'unknown item',
    };
  } catch (error) {
    console.error('Vision API error:', error);
    return {
      objects: [],
      texts: [],
      primaryObject: 'unknown item',
    };
  }
}

async function searchMarketplaces(visionData, countryCode) {
  try {
    const searchTerms = [];
    
    if (visionData.texts && visionData.texts.length > 0) {
      searchTerms.push(...visionData.texts.slice(0, 2));
    }
    
    if (visionData.primaryObject) {
      searchTerms.push(visionData.primaryObject);
    }

    const query = searchTerms.length > 0 ? searchTerms.join(' ') : 'vintage collectible';
    
    // Use Google Custom Search API
    const searchUrl = `https://www.googleapis.com/customsearch/v1`;
    const params = new URLSearchParams({
      key: functions.config().google.search_api_key,
      cx: functions.config().google.search_engine_id,
      q: `${query} price value ${countryCode}`,
      num: '5',
    });

    const response = await fetch(`${searchUrl}?${params}`);
    const searchResult = await response.json();

    const similarListings = [];
    if (searchResult.items) {
      for (const item of searchResult.items.slice(0, 5)) {
        similarListings.push({
          title: item.title || '',
          link: item.link || '',
          snippet: item.snippet || '',
          price: 'N/A', // Would need additional parsing for actual prices
        });
      }
    }

    return {
      query,
      similarListings,
      rawResponse: searchResult,
    };
  } catch (error) {
    console.error('Search API error:', error);
    return {
      query: '',
      similarListings: [],
      rawResponse: {},
    };
  }
}

async function analyzeWithGemini(visionData, searchData, countryCode, currencyCode) {
  try {
    const prompt = `
# CONTEXT
You are "Thrifter's Eye," an expert AI appraiser specializing in items found at thrift stores, garage sales, and flea markets. You are analytical, realistic, and your goal is to help a user understand what they've found and what it might be worth in the ${countryCode} market, with prices in ${currencyCode}.

# TASK
I will provide you with JSON data containing information about an object I scanned. Your task is to analyze this data and return a structured JSON object with your appraisal. You MUST strictly adhere to the requested JSON output format.

# INPUT DATA
Here is the data I have gathered:

## 1. Google Vision AI Analysis:
${JSON.stringify(visionData, null, 2)}

## 2. Similar Listings Found on ${countryCode} Marketplaces:
${JSON.stringify(searchData, null, 2)}

# YOUR ANALYSIS & APPRAISAL
Based on ALL the data above, perform the following actions:
1. Synthesize the Vision data and Search results to determine the most likely identity of the item.
2. Analyze the prices of the similar listings, ignoring outliers, to establish a realistic resale value range in ${currencyCode}.
3. Write a brief, helpful analysis for the user.
4. Generate a draft title and description for a marketplace listing.
5. Provide a confidence score from 0-100 representing your certainty in the valuation.

# REQUIRED OUTPUT FORMAT
Your entire response must be a single, valid JSON object. Do not include any text or markdown before or after the JSON object.

{
  "itemName": "A concise and accurate name for the item.",
  "estimatedValue": "A string representing the value range in ${currencyCode}, e.g., '$25 - $40 ${currencyCode}'.",
  "confidenceScore": 75,
  "aiAnalysis": "A paragraph explaining what the item is, its potential significance or history, and the reasoning behind your valuation. Be realistic about condition and market demand.",
  "listingDraft": {
    "title": "A compelling, keyword-rich title for an online marketplace listing.",
    "description": "A detailed description for the listing, including potential keywords from your analysis."
  }
}
`;

    // Use Gemini API (you would need to implement this with the actual Gemini API)
    const geminiApiKey = functions.config().gemini.api_key;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse the JSON response from Gemini
    let aiResult;
    try {
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
      aiResult = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      // Fallback response
      aiResult = {
        itemName: visionData.primaryObject || 'Unknown Item',
        estimatedValue: `$10 - $30 ${currencyCode}`,
        confidenceScore: 25,
        aiAnalysis: `Unable to complete full analysis. Basic identification suggests this is a ${visionData.primaryObject || 'general item'}. For accurate valuation, please try again or consult with local experts.`,
        listingDraft: {
          title: `${visionData.primaryObject || 'Vintage Item'} - Good Condition`,
          description: 'Item found at thrift store, good condition. Please see photos for details.'
        }
      };
    }

    return aiResult;

  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      itemName: visionData.primaryObject || 'Unknown Item',
      estimatedValue: `$10 - $30 ${currencyCode}`,
      confidenceScore: 25,
      aiAnalysis: `Unable to complete full analysis due to technical issues. Basic identification suggests this is a ${visionData.primaryObject || 'general item'}. For accurate valuation, please try again or consult with local experts.`,
      listingDraft: {
        title: `${visionData.primaryObject || 'Vintage Item'} - Good Condition`,
        description: 'Item found at thrift store, good condition. Please see photos for details.'
      }
    };
  }
}