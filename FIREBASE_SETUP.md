# Firebase Setup Guide for BREEZO

This guide will help you set up Firebase for BREEZO to enable ML predictions and AQI functionality on GitHub Pages.

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **Firebase CLI** (`npm install -g firebase-tools`)
3. **GitHub account** with your BREEZO repository

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `breezo-app` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firebase Services

### Authentication
1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Email/Password"
3. Click "Save"

### Firestore Database
1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (for development)
3. Select a location close to your users
4. Click "Done"

### Storage
1. Go to "Storage" → "Get started"
2. Choose "Start in test mode" (for development)
3. Select a location
4. Click "Done"

### Functions
1. Go to "Functions" → "Get started"
2. Choose "Blaze" plan (required for external API calls)
3. Select a location
4. Click "Done"

## Step 3: Get Firebase Configuration

1. In Firebase Console, go to "Project settings" (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → "Web"
4. Enter app nickname: `breezo-web`
5. Click "Register app"
6. Copy the configuration object

## Step 4: Update Configuration Files

### Update `firebase-config.js`
Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### Update API Keys in `functions/index.js`
Replace the placeholder API keys:

```javascript
// Line ~100: IQAir API token
const response = await axios.get(`https://api.waqi.info/feed/${city}/?token=YOUR_ACTUAL_IQAIR_TOKEN`);

// Line ~130: OpenWeatherMap API key
const apiKey = 'YOUR_ACTUAL_OPENWEATHERMAP_API_KEY';
```

## Step 5: Install Dependencies

```bash
cd functions
npm install
```

## Step 6: Deploy Firebase Functions

```bash
# Login to Firebase (first time only)
firebase login

# Initialize Firebase in your project (first time only)
firebase init

# Select:
# - Functions: Configure a Cloud Functions directory and its files
# - Use an existing project
# - Select your Firebase project
# - Use JavaScript
# - Use ESLint
# - Install dependencies with npm

# Deploy functions
firebase deploy --only functions
```

## Step 7: Update Frontend API Endpoints

The Firebase Functions will be available at:
- ML Predictions: `https://your-region-your-project-id.cloudfunctions.net/predict`
- AQI Data: `https://your-region-your-project-id.cloudfunctions.net/getAQI`
- Weather Data: `https://your-region-your-project-id.cloudfunctions.net/getWeather`

Update `firebase-services.js` to use these endpoints:

```javascript
// Replace the relative paths with full Firebase Function URLs
const response = await fetch('https://your-region-your-project-id.cloudfunctions.net/predict', {
  // ... rest of the code
});
```

## Step 8: Deploy to GitHub Pages

1. Commit and push your changes to GitHub
2. Go to your repository → Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: `main` (or your default branch)
5. Click "Save"

## Step 9: Test Deployment

1. Wait for GitHub Pages to deploy (usually 2-5 minutes)
2. Visit your deployed site
3. Test ML predictions and AQI functionality
4. Check Firebase Console for function logs

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Firebase Functions have CORS enabled
2. **API Key Issues**: Verify all API keys are correctly set
3. **Function Timeout**: Check Firebase Function logs for errors
4. **Authentication Issues**: Verify Firebase Auth is properly configured

### Debug Steps

1. Check browser console for errors
2. Check Firebase Functions logs in console
3. Verify API endpoints are accessible
4. Test functions locally with Firebase emulator

## Security Considerations

1. **API Keys**: Never commit API keys to public repositories
2. **Firestore Rules**: Set up proper security rules for production
3. **Authentication**: Implement proper user authentication flows
4. **Rate Limiting**: Consider implementing rate limiting for ML predictions

## Cost Optimization

1. **Functions**: Monitor function execution time and memory usage
2. **Firestore**: Optimize database queries and storage
3. **Storage**: Compress images before upload
4. **Bandwidth**: Monitor external API usage

## Next Steps

1. **Production Rules**: Set up proper Firestore security rules
2. **Monitoring**: Enable Firebase Analytics and Performance Monitoring
3. **Backup**: Set up automated backups for user data
4. **Scaling**: Monitor usage and scale resources as needed

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Community](https://firebase.google.com/community)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
