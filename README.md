# BREEZO - Respiratory Health & Air Quality App

BREEZO is a comprehensive respiratory health application that combines machine learning-powered symptom analysis with real-time air quality monitoring to help users make informed decisions about their respiratory health.

## Features

- **ML-Powered Symptom Analysis**: AI-driven disease prediction based on respiratory symptoms
- **Real-time Air Quality Index (AQI)**: Live air quality data for informed outdoor activity decisions
- **Personal Health Tracking**: Symptom reports and health history management
- **User Authentication**: Secure user accounts with Firebase Authentication
- **Responsive Design**: Modern, mobile-friendly interface built with TailwindCSS

## Architecture

BREEZO uses a **Firebase-powered backend** with **GitHub Pages hosting**:

- **Frontend**: HTML/CSS/JavaScript with TailwindCSS
- **Backend**: Firebase Functions (ML predictions, AQI data)
- **Database**: Firestore (user data, symptom reports)
- **Storage**: Firebase Storage (profile photos)
- **Authentication**: Firebase Auth (email/password)
- **Hosting**: GitHub Pages

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- IQAir API token
- OpenWeatherMap API key

### Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/breezo.git
   cd breezo
   ```

2. **Firebase Setup**
   - Follow the [Firebase Setup Guide](FIREBASE_SETUP.md)
   - Update `firebase-config.js` with your Firebase project details
   - Update API keys in `functions/index.js`

3. **Install Dependencies**
   ```bash
   cd functions
   npm install
   ```

4. **Deploy Firebase Functions**
   ```bash
   firebase login
   firebase deploy --only functions
   ```

5. **Deploy to GitHub Pages**
   - Push changes to GitHub
   - Enable GitHub Pages in repository settings

## Project Structure

```
breezo/
├── index.html              # Landing page with loading screen
├── auth.html               # User authentication
├── personaldetails.html    # User profile setup
├── selfdiagnosis.html      # ML symptom analysis
├── profile.html            # User profile management
├── editprofile.html        # Profile editing
├── symptomreports.html     # Health history
├── datasources.html        # Data sources information
├── detailedreport.html     # Detailed health reports
├── help.html               # Help and support
├── privacy.html            # Privacy settings
├── howweuseai.html         # AI usage explanation
├── loading.html            # First-time visitor loading screen
├── firebase-config.js      # Firebase configuration
├── firebase-services.js    # Firebase service utilities
├── firebase.json           # Firebase project configuration
├── functions/              # Firebase Cloud Functions
│   ├── index.js           # ML predictions, AQI, weather APIs
│   └── package.json       # Function dependencies
└── FIREBASE_SETUP.md      # Detailed setup guide
```

## Key Components

### ML Prediction System
- **Firebase Function**: `/predict` endpoint for disease prediction
- **Symptom Analysis**: Processes user symptoms with follow-up questions
- **Disease Classification**: Returns probability-based disease predictions
- **Medical Guidance**: Provides appropriate health recommendations

### Air Quality Monitoring
- **Real-time AQI**: Fetches current air quality data
- **Location-based**: Supports coordinates and city names
- **Weather Integration**: Combines AQI with weather conditions
- **Health Recommendations**: Suggests outdoor activity modifications

### User Management
- **Authentication**: Secure sign-up/sign-in with Firebase
- **Profile Management**: Personal details, photos, preferences
- **Data Persistence**: Firestore database for user information
- **Privacy Controls**: Account deletion and data export

## API Endpoints

### Firebase Functions
- `POST /predict` - ML disease prediction
- `GET /getAQI` - Air quality data
- `GET /getWeather` - Weather information
- `POST /saveUserData` - Save user data
- `GET /getUserData` - Retrieve user data

### External APIs
- **IQAir**: Air quality index data
- **OpenWeatherMap**: Weather information

## Development

### Local Development
```bash
# Start Firebase emulator
firebase emulators:start

# Test functions locally
firebase functions:shell
```

### Testing
- Test ML predictions with various symptom combinations
- Verify AQI data fetching with different locations
- Check user authentication flows
- Validate data persistence in Firestore

## Deployment

### GitHub Pages
- Automatic deployment from main branch
- Static file hosting with Firebase backend
- Custom domain support available

### Firebase
- Functions deployed to Google Cloud
- Automatic scaling and monitoring
- Global CDN distribution

## Security

- **API Keys**: Stored securely in Firebase Functions
- **User Data**: Protected with Firebase security rules
- **Authentication**: Firebase Auth with email verification
- **CORS**: Properly configured for cross-origin requests

## Performance

- **CDN**: Firebase global distribution
- **Caching**: Browser and CDN caching strategies
- **Optimization**: Minified assets and efficient API calls
- **Monitoring**: Firebase Performance Monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

- **Documentation**: [Firebase Setup Guide](FIREBASE_SETUP.md)
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Firebase**: Backend infrastructure and services
- **TailwindCSS**: UI framework and styling
- **IQAir**: Air quality data API
- **OpenWeatherMap**: Weather data API
# Breezo-web
