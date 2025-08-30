#!/bin/bash

# BREEZO Firebase Deployment Script
# This script helps automate the Firebase setup and deployment process

echo "🚀 BREEZO Firebase Deployment Script"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI detected"
fi

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo "❌ Please run this script from the BREEZO project root directory"
    exit 1
fi

echo "✅ BREEZO project detected"

# Install function dependencies
echo "📦 Installing Firebase Function dependencies..."
cd functions
npm install
cd ..

# Check if user is logged into Firebase
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please log in to Firebase first:"
    firebase login
fi

# Initialize Firebase project if not already done
if [ ! -f ".firebaserc" ]; then
    echo "🚀 Initializing Firebase project..."
    firebase init functions
    echo "⚠️  Please select your Firebase project when prompted"
    echo "⚠️  Choose JavaScript and ESLint when asked"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Update firebase-config.js with your Firebase project details"
echo "2. Update API keys in functions/index.js"
echo "3. Deploy Firebase Functions: firebase deploy --only functions"
echo "4. Update firebase-services.js with your function URLs"
echo "5. Push to GitHub and enable GitHub Pages"
echo ""
echo "📚 For detailed instructions, see FIREBASE_SETUP.md"
echo ""
echo "🎯 Ready to deploy! Run: firebase deploy --only functions"
