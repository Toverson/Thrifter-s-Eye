# Environment Setup Instructions

This project uses environment variables to manage API keys and sensitive configuration. **You must set up these files before the app will work properly.**

## 🚨 IMPORTANT: Required Setup Steps

### 1. React Native App Environment Variables

**File Location:** `/app/ThriftersEyeApp/.env`

```bash
# Copy the example file
cp /app/ThriftersEyeApp/.env.example /app/ThriftersEyeApp/.env
```

Then edit `/app/ThriftersEyeApp/.env` with your actual values:

```env
# Backend API Configuration
REACT_APP_BACKEND_URL=https://your-actual-backend-url.com

# RevenueCat Configuration (get from https://app.revenuecat.com/)
REVENUECAT_PUBLIC_KEY_IOS=appl_YOUR_ACTUAL_REVENUECAT_KEY_HERE

# Google APIs - configured via Firebase Functions (leave as-is)
GOOGLE_VISION_API_KEY=configured_via_firebase_functions
CUSTOM_SEARCH_API_KEY=configured_via_firebase_functions  
CUSTOM_SEARCH_ENGINE_ID=configured_via_firebase_functions
GEMINI_API_KEY=configured_via_firebase_functions
```

**For Xcode/iOS builds:** You also need to add the `.env` file to your Xcode project:
1. Open your project in Xcode
2. Right-click your project in the navigator
3. Select "Add Files to [ProjectName]"
4. Navigate to `/app/ThriftersEyeApp/.env` and add it

### 2. Backend Environment Variables

**File Location:** `/app/backend/.env`

```bash
# Copy the example file
cp /app/backend/.env.example /app/backend/.env
```

Then edit `/app/backend/.env` with your actual values:

```env
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=thrifters-eye

# Google Cloud APIs (get from Google Cloud Console)
GOOGLE_SEARCH_API_KEY=your_actual_google_search_api_key
GOOGLE_SEARCH_ENGINE_ID=your_actual_search_engine_id  
GEMINI_API_KEY=your_actual_gemini_api_key
```

### 3. Google Service Account Key

**File Location:** `/app/backend/[your-service-account-key].json`

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to IAM & Admin > Service Accounts
3. Create or select a service account
4. Create a new JSON key
5. Download the JSON file
6. Place it in `/app/backend/` directory
7. Update your backend code if the filename differs from the expected name

### 4. Firebase iOS Configuration

**File Location:** `/app/ThriftersEyeApp/ios/GoogleService-Info.plist`

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > General
4. In the "Your apps" section, select your iOS app
5. Click "Download GoogleService-Info.plist"
6. Place the file at `/app/ThriftersEyeApp/ios/GoogleService-Info.plist`
7. Add it to your Xcode project (drag & drop into Xcode)

### 5. iOS Xcode Environment (Optional)

**File Location:** `/app/ThriftersEyeApp/ios/.xcode.env`

```bash
# Copy the example file if needed
cp /app/ThriftersEyeApp/ios/.xcode.env.example /app/ThriftersEyeApp/ios/.xcode.env
```

Add any Xcode-specific environment variables you need.

## 🔒 Security Notes

- **NEVER** commit actual `.env` files, service account keys, or `GoogleService-Info.plist` to Git
- These files are in `.gitignore` but for extra security, they've been completely removed from the repository
- Each developer/deployment needs to set up their own copies with their own API keys

## 📋 Original API Key Values (for reference)

For your convenience, here were the original values found in the codebase:

- **RevenueCat API Key:** `appl_MMOvAgIufEcRcRFvFipcmykdqnA`
- **Backend URL:** `https://your-backend-url.com` (placeholder)
- **Google Service Account:** `gen-lang-client-0045692674-0e08eb99ab10.json` (filename)

Replace these with your actual production values.