// Firebase Services for BREEZO
class FirebaseServices {
  constructor() {
    // Wait for Firebase to be available
    if (window.firebase && window.auth && window.db && window.storage) {
      this.auth = window.auth;
      this.db = window.db;
      this.storage = window.storage;
      console.log('✅ Firebase Services initialized successfully');
    } else {
      console.error('❌ Firebase not ready yet');
      // Wait for Firebase to be ready
      this.waitForFirebase();
    }
  }

  // Wait for Firebase to be ready
  waitForFirebase() {
    const checkFirebase = () => {
      if (window.firebase && window.auth && window.db && window.storage) {
        this.auth = window.auth;
        this.db = window.db;
        this.storage = window.storage;
        console.log('✅ Firebase Services initialized after waiting');
      } else {
        setTimeout(checkFirebase, 100);
      }
    };
    checkFirebase();
  }

  // Authentication methods
  async signIn(email, password) {
    try {
      if (!this.auth) {
        throw new Error('Firebase Auth not ready');
      }
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signUp(email, password, fullName) {
    try {
      if (!this.auth || !this.db) {
        throw new Error('Firebase services not ready');
      }
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      
      // Update user profile
      await userCredential.user.updateProfile({
        displayName: fullName
      });

      // Save additional user data to Firestore
      await this.db.collection('users').doc(userCredential.user.uid).set({
        email: email,
        fullName: fullName,
        createdAt: new Date(),
        lastLogin: new Date()
      });

      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      if (!this.auth) {
        throw new Error('Firebase Auth not ready');
      }
      await this.auth.signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ML Prediction methods
  async getMLPrediction(symptoms, age, sex) {
    try {
      // Call Firebase Function for ML prediction
      const response = await fetch('https://predict-rcgn52tcdq-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms, age, sex })
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const predictions = await response.json();
      return { success: true, predictions };
    } catch (error) {
      console.error('ML Prediction error:', error);
      return { success: false, error: error.message };
    }
  }

  // AQI methods
  async getAQIData(lat, lon, city) {
    try {
      let url = 'https://getaqi-rcgn52tcdq-uc.a.run.app?';
      if (city) {
        url += `city=${encodeURIComponent(city)}`;
      } else if (lat && lon) {
        url += `lat=${lat}&lon=${lon}`;
      } else {
        throw new Error('Missing location parameters');
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch AQI data');
      }

      const aqiData = await response.json();
      return { success: true, data: aqiData };
    } catch (error) {
      console.error('AQI fetch error:', error);
      return { success: false, error: error.message };
    }
  }

  async getWeatherData(lat, lon, city) {
    try {
      let url = 'https://getweather-rcgn52tcdq-uc.a.run.app?';
      if (city) {
        url += `city=${encodeURIComponent(city)}`;
      } else if (lat && lon) {
        url += `lat=${lat}&lon=${lon}`;
      } else {
        throw new Error('Missing location parameters');
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weatherData = await response.json();
      return { success: true, data: weatherData };
    } catch (error) {
      console.error('Weather fetch error:', error);
      return { success: false, error: error.message };
    }
  }

  // User data methods
  async saveUserData(userId, data) {
    try {
      // Use Firebase Function for saving user data
      const response = await fetch('https://saveuserdata-rcgn52tcdq-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, data })
      });

      if (!response.ok) {
        throw new Error('Failed to save user data');
      }

      return { success: true };
    } catch (error) {
      console.error('Save user data error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserData(userId) {
    try {
      // Use Firebase Function for getting user data
      const response = await fetch(`https://getuserdata-rcgn52tcdq-uc.a.run.app?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get user data');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Get user data error:', error);
      return { success: false, error: error.message };
    }
  }

  // Save all user data to Firestore
  async saveUserData(userId, userData) {
    try {
      if (!this.db) {
        throw new Error('Firestore not ready');
      }
      
      await this.db.collection('users').doc(userId).set({
        ...userData,
        lastUpdated: new Date()
      }, { merge: true });
      
      return { success: true };
    } catch (error) {
      console.error('Save user data error:', error);
      return { success: false, error: error.message };
    }
  }

  // Load all user data from Firestore
  async loadUserData(userId) {
    try {
      if (!this.db) {
        throw new Error('Firestore not ready');
      }
      
      const userDoc = await this.db.collection('users').doc(userId).get();
      
      if (userDoc.exists) {
        return { success: true, data: userDoc.data() };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      console.error('Load user data error:', error);
      return { success: false, error: error.message };
    }
  }

  async saveSymptomReport(userId, report) {
    try {
      if (!this.db) {
        throw new Error('Firestore not ready');
      }
      const reportRef = await this.db.collection('users').doc(userId)
        .collection('symptomReports').add({
          ...report,
          createdAt: new Date()
        });
      return { success: true, reportId: reportRef.id };
    } catch (error) {
      console.error('Save symptom report error:', error);
      return { success: false, error: error.message };
    }
  }

  async getSymptomReports(userId) {
    try {
      if (!this.db) {
        throw new Error('Firestore not ready');
      }
      const snapshot = await this.db.collection('users').doc(userId)
        .collection('symptomReports')
        .orderBy('createdAt', 'desc')
        .get();
      
      const reports = [];
      snapshot.forEach(doc => {
        reports.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, reports };
    } catch (error) {
      console.error('Get symptom reports error:', error);
      return { success: false, error: error.message };
    }
  }

  // Profile photo methods
  async uploadProfilePhoto(userId, file) {
    try {
      if (!this.storage || !this.db) {
        throw new Error('Firebase services not ready');
      }
      const storageRef = this.storage.ref(`profile-photos/${userId}/${file.name}`);
      const snapshot = await storageRef.put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();
      
      // Update user profile with photo URL
      await this.db.collection('users').doc(userId).update({
        profilePhotoURL: downloadURL,
        profilePhotoUpdated: new Date()
      });
      
      return { success: true, photoURL: downloadURL };
    } catch (error) {
      console.error('Upload profile photo error:', error);
      return { success: false, error: error.message };
    }
  }

  // Auth state listener
  onAuthStateChanged(callback) {
    if (!this.auth) {
      console.error('Firebase Auth not ready');
      return null;
    }
    return this.auth.onAuthStateChanged(callback);
  }

  // Get current user
  getCurrentUser() {
    if (!this.auth) {
      console.error('Firebase Auth not ready');
      return null;
    }
    return this.auth.currentUser;
  }
}

// Wait for DOM to be ready, then initialize Firebase services
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit more for Firebase to be fully initialized
  setTimeout(() => {
    // Initialize Firebase services
    const firebaseServices = new FirebaseServices();
    
    // Make it available globally
    window.firebaseServices = firebaseServices;
    
    console.log('🚀 FirebaseServices initialized and available globally:', firebaseServices);
    console.log('🌐 window.firebaseServices:', window.firebaseServices);
    
    // Dispatch a custom event to notify that services are ready
    window.dispatchEvent(new CustomEvent('firebaseServicesReady', { 
      detail: { services: firebaseServices } 
    }));
  }, 1000);
});

// Also try to initialize immediately if Firebase is already ready
if (window.firebase && window.auth && window.db && window.storage) {
  const firebaseServices = new FirebaseServices();
  window.firebaseServices = firebaseServices;
  console.log('🚀 FirebaseServices initialized immediately:', firebaseServices);
}
