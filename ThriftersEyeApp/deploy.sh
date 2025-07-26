#!/bin/bash

# Thrifter's Eye Deployment Script

echo "🚀 Deploying Thrifter's Eye to Firebase..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Login to Firebase (if needed)
echo "🔐 Checking Firebase authentication..."
firebase login --reauth

# Set Firebase project
echo "📱 Setting Firebase project..."
firebase use thrifters-eye-app

# Install function dependencies
echo "📦 Installing Cloud Function dependencies..."
cd functions
npm install
cd ..

# Deploy Firestore rules and indexes
echo "🔧 Deploying Firestore configuration..."
firebase deploy --only firestore

# Deploy Cloud Functions
echo "⚡ Deploying Cloud Functions..."
firebase deploy --only functions --region us-central1

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure environment variables for Cloud Functions"
echo "2. Test the functions in Firebase Console"
echo "3. Build and deploy the iOS app to App Store"
echo ""
echo "🔧 Configure function environment variables:"
echo "firebase functions:config:set google.search_api_key=\"YOUR_KEY\""
echo "firebase functions:config:set google.search_engine_id=\"YOUR_ID\""
echo "firebase functions:config:set gemini.api_key=\"YOUR_KEY\""