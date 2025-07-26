# Thrifter's Eye - React Native iOS App

AI-powered item identification and valuation for thrift store shoppers.

## Features

- **AI-Powered Scanning**: Uses Google Vision API to identify objects and text from photos
- **Marketplace Analysis**: Searches eBay, Etsy, and Facebook Marketplace for similar items
- **Smart Valuation**: Gemini AI provides detailed analysis and pricing estimates
- **Geolocation-Aware**: Adapts to user's country for relevant pricing in local currency
- **Freemium Model**: 5 free scans, unlimited with Pro subscription via RevenueCat
- **User-Specific History**: Stores up to 10 most recent scans per user
- **Firebase Integration**: Authentication, Firestore database, Cloud Functions

## Tech Stack

- **Frontend**: React Native (iOS)
- **Backend**: Google Cloud Functions
- **Database**: Firestore
- **Authentication**: Firebase Auth (Email/Password, Google Sign-In)
- **Subscriptions**: RevenueCat
- **APIs**: Google Vision, Custom Search, Gemini AI
- **Location**: React Native Geolocation

## Project Structure

```
ThriftersEyeApp/
├── src/
│   ├── screens/           # All app screens
│   └── services/          # API and data services
├── functions/             # Google Cloud Functions
├── ios/                   # iOS-specific files
├── android/              # Android-specific files (if needed)
├── assets/               # App assets (icons, images)
├── App.js                # Main app component
├── app.json              # Expo configuration
├── firebase.json         # Firebase configuration
└── package.json          # Dependencies
```

## Setup Instructions

### Prerequisites

1. **Xcode** (for iOS development)
2. **Node.js** (v18 or higher)
3. **Firebase CLI**: `npm install -g firebase-tools`
4. **Expo CLI**: `npm install -g @expo/cli`

### 1. Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password and Google)
3. Enable Firestore Database
4. Enable Functions

### 2. Google APIs Setup

1. **Google Vision API**:
   - Enable Vision API in Google Cloud Console
   - Create service account and download JSON key

2. **Google Custom Search API**:
   - Enable Custom Search API
   - Create a Custom Search Engine at https://cse.google.com/cse/
   - Get API key and Search Engine ID

3. **Gemini API**:
   - Get Gemini API key from Google AI Studio

### 3. RevenueCat Setup

1. Create RevenueCat account
2. Set up iOS app and products
3. Configure entitlements and offerings

### 4. Environment Configuration

Configure Firebase functions with:

```bash
firebase functions:config:set google.search_api_key="YOUR_SEARCH_API_KEY"
firebase functions:config:set google.search_engine_id="YOUR_SEARCH_ENGINE_ID"
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"
```

### 5. Installation

```bash
# Install dependencies
npm install

# Install iOS dependencies
cd ios && pod install && cd ..

# Install function dependencies
cd functions && npm install && cd ..
```

### 6. Deployment

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy Cloud Functions
firebase deploy --only functions

# Run iOS app
npm run ios
```

## Key Features Implementation

### Geolocation-Aware Content

- Requests location permission on app startup
- Determines user's country code and currency
- Passes location data to AI analysis for region-specific pricing

### Freemium Subscription Model

- Tracks scan count in Firestore user documents
- Blocks free users after 5 scans
- RevenueCat integration for Pro subscriptions
- Unlimited scans for Pro users

### User-Specific Scan History

- Efficient Firestore queries filtered by userId
- Limited to 10 most recent scans per user
- Optimized for performance and cost

### AI Analysis Pipeline

1. **Google Vision API**: Object detection and text recognition
2. **Google Custom Search**: Find similar marketplace listings  
3. **Gemini AI**: Synthesize data into detailed appraisal

## Configuration Files

- `GoogleService-Info.plist`: iOS Firebase configuration
- `firestore.rules`: Database security rules
- `firestore.indexes.json`: Database indexes for optimal performance
- `app.json`: Expo/React Native configuration

## Production Deployment

1. **iOS App Store**:
   - Configure app signing in Xcode
   - Build and upload to App Store Connect
   - Submit for review

2. **Backend**:
   - Functions deploy automatically to Firebase
   - Configure production API keys
   - Monitor usage and costs

## API Keys Required

- Google Vision API service account JSON
- Google Custom Search API key + Engine ID  
- Gemini API key
- RevenueCat public API key
- Firebase configuration files

## License

This project is configured for the Thrifter's Eye iOS app.

## Support

For deployment assistance or technical questions, refer to the respective documentation:
- [Firebase Functions](https://firebase.google.com/docs/functions)
- [React Native](https://reactnative.dev/docs/getting-started)
- [RevenueCat](https://docs.revenuecat.com/)
- [Expo](https://docs.expo.dev/)