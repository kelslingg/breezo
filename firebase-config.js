// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjDXZVIkcQDi_oIEs74k7e7ucSdrhYhvs",
  authDomain: "breezo-b7351.firebaseapp.com",
  projectId: "breezo-b7351",
  storageBucket: "breezo-b7351.firebasestorage.app",
  messagingSenderId: "929611477966",
  appId: "1:929611477966:web:b828f856c159618795f19f",
  measurementId: "G-QVZBCR59N2"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase app:', error);
}

// Initialize Firebase services
try {
  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();
  
  // Export for use in other files
  window.firebase = firebase;
  window.auth = auth;
  window.db = db;
  window.storage = storage;
  
  console.log('✅ Firebase services initialized successfully');
  console.log('🔐 Auth:', auth);
  console.log('🗄️ Firestore:', db);
  console.log('📁 Storage:', storage);
  
  // Dispatch event when Firebase is ready
  window.dispatchEvent(new CustomEvent('firebaseReady', { 
    detail: { auth, db, storage } 
  }));
  
} catch (error) {
  console.error('❌ Error initializing Firebase services:', error);
}
