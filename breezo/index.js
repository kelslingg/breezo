const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({origin: true});

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Simple ML prediction function
 * @param {string} symptoms - User symptoms
 * @param {number} age - User age
 * @param {string} sex - User biological sex
 * @return {Array} Array of disease predictions
 */
function predictDisease(symptoms, age, sex) {
  // Convert symptoms array to lowercase string for keyword matching
  const symptomKeywords = symptoms.join(' ').toLowerCase();
  const predictions = [];

  if (symptomKeywords.includes("cough") ||
      symptomKeywords.includes("breathing")) {
    predictions.push({disease: "Bronchitis", probability: 0.75});
  }

  if (symptomKeywords.includes("short") &&
      symptomKeywords.includes("breath")) {
    predictions.push({disease: "Asthma", probability: 0.70});
  }

  if (symptomKeywords.includes("fever") ||
      symptomKeywords.includes("flu")) {
    predictions.push({disease: "Influenza", probability: 0.65});
  }

  if (symptomKeywords.includes("chest") &&
      symptomKeywords.includes("pain")) {
    predictions.push({disease: "Pneumonia", probability: 0.60});
  }

  if (symptomKeywords.includes("allergy") ||
      symptomKeywords.includes("sneeze")) {
    predictions.push({disease: "Seasonal Allergies", probability: 0.55});
  }

  // Always return at least 3 predictions
  if (predictions.length >= 3) {
    return predictions.slice(0, 3);
  } else if (predictions.length > 0) {
    // Add generic predictions to reach 3
    const genericPredictions = [
      {disease: "Respiratory Infection", probability: 0.45},
      {disease: "Common Cold", probability: 0.40},
      {disease: "Upper Respiratory Tract Infection", probability: 0.35}
    ];
    
    // Filter out duplicates and add generics
    const existingDiseases = predictions.map(p => p.disease);
    const uniqueGenerics = genericPredictions.filter(g => !existingDiseases.includes(g.disease));
    
    return [...predictions, ...uniqueGenerics].slice(0, 3);
  } else {
    return [
      {disease: "Respiratory Infection", probability: 0.50},
      {disease: "Common Cold", probability: 0.45},
      {disease: "Upper Respiratory Tract Infection", probability: 0.40}
    ];
  }
}

/**
 * ML Prediction endpoint
 */
exports.predict = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({error: "Method not allowed"});
      }

      const {symptoms, age, sex} = req.body;

      if (!symptoms || !age || !sex) {
        return res.status(400).json({error: "Missing required fields"});
      }

      console.log("Received prediction request:", {symptoms, age, sex});

      // Ensure symptoms is an array
      const symptomsArray = Array.isArray(symptoms) ? symptoms : [symptoms];
      const predictions = predictDisease(symptomsArray, age, sex);

      console.log("Returning predictions:", predictions);

      res.status(200).json(predictions);
    } catch (error) {
      console.error("Error in prediction:", error);
      res.status(500).json({error: "Internal server error"});
    }
  });
});

/**
 * AQI Data endpoint - Uses ONLY IQAir API (ed2a35ef-6af9-4905-810d-47875737716d)
 */
exports.getAQI = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {lat, lon, city} = req.query;

      if (!lat && !lon && !city) {
        return res.status(400).json({error: "Missing location parameters"});
      }

      let aqiData;

      if (city) {
        const response = await axios.get(
            `https://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&state=&country=&key=ed2a35ef-6af9-4905-810d-47875737716d`);
        aqiData = response.data;
      } else if (lat && lon) {
        const response = await axios.get(
            `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=ed2a35ef-6af9-4905-810d-47875737716d`);
        aqiData = response.data;
      }

      if (!aqiData || aqiData.status !== 'success' || !aqiData.data) {
        return res.status(404).json({error: "AQI data not found or API error"});
      }

      // Log the raw response for debugging
      console.log('Raw IQAir response:', JSON.stringify(aqiData, null, 2));
      
      // Log the specific values we're trying to extract
      console.log('Key values from IQAir:', {
        aqi: aqiData.data?.current?.pollution?.aqius,
        aqiAlt: aqiData.data?.current?.pollution?.aqi,
        pm25: aqiData.data?.current?.pollution?.pm25,
        temperature: aqiData.data?.current?.weather?.tp,
        humidity: aqiData.data?.current?.weather?.hu,
        city: aqiData.data?.city,
        location: aqiData.data?.location
      });
      
      // Log specific weather data for debugging
      if (aqiData.data?.current?.weather) {
        console.log('Weather data from IQAir:', {
          temperature: aqiData.data.current.weather.tp,
          humidity: aqiData.data.current.weather.hu,
          pressure: aqiData.data.current.weather.pr,
          windSpeed: aqiData.data.current.weather.ws,
          windDirection: aqiData.data.current.weather.wd
        });
      }
      
      // Log the exact structure we're working with
      console.log('AQI data structure:', {
        hasCurrent: !!aqiData.data.current,
        hasPollution: !!aqiData.data.current?.pollution,
        hasWeather: !!aqiData.data.current?.weather,
        pollutionKeys: aqiData.data.current?.pollution ? Object.keys(aqiData.data.current.pollution) : [],
        weatherKeys: aqiData.data.current?.weather ? Object.keys(aqiData.data.current.weather) : []
      });
      
      // Extract the exact values from IQAir without any processing
      const rawAQI = aqiData.data.current.pollution.aqius;
      const rawTemp = aqiData.data.current.weather?.tp;
      const rawHumidity = aqiData.data.current.weather?.hu;
      
      console.log('Raw values from IQAir:', {
        aqi: rawAQI,
        temperature: rawTemp,
        humidity: rawHumidity
      });
      
      const processedData = {
        aqi: rawAQI, // Use exact value from IQAir
        city: city || aqiData.data.city || "Unknown",
        lat: aqiData.data.location?.coordinates?.[1] || null,
        lon: aqiData.data.location?.coordinates?.[0] || null,
        timestamp: new Date().toISOString(),
        pollutants: aqiData.data.current.pollution || {},
        weather: aqiData.data.current.weather || {},
        temperature: rawTemp, // Use exact value from IQAir
        humidity: rawHumidity, // Use exact value from IQAir
      };
      
            // Log the processed data for debugging
      console.log('Processed AQI data:', JSON.stringify(processedData, null, 2));
      
      // Log the final processed data
      console.log('Final processed data:', {
        aqi: processedData.aqi,
        temperature: processedData.temperature,
        humidity: processedData.humidity,
        city: processedData.city
      });
      
      res.status(200).json(processedData);
    } catch (error) {
      console.error("Error fetching AQI:", error);
      res.status(500).json({error: "Failed to fetch AQI data"});
    }
  });
});

/**
 * Weather Data endpoint - Uses ONLY IQAir API (ed2a35ef-6af9-4905-810d-47875737716d)
 */
exports.getWeather = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {lat, lon, city} = req.query;

      if (!lat && !lon && !city) {
        const mockWeather = {
          temperature: 22,
          humidity: 65,
          description: "Partly cloudy",
          icon: "02d",
        };

        return res.status(200).json(mockWeather);
      }

      let aqiData;

      if (city) {
        const response = await axios.get(
            `https://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&state=&country=&key=ed2a35ef-6af9-4905-810d-47875737716d`);
        aqiData = response.data;
      } else if (lat && lon) {
        const response = await axios.get(
            `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=ed2a35ef-6af9-4905-810d-47875737716d`);
        aqiData = response.data;
      }

      if (!aqiData || aqiData.status !== 'success' || !aqiData.data) {
        return res.status(404).json({error: "IQAir data not found or API error"});
      }

      // Extract weather data from IQAir response
      const weatherData = aqiData.data.current.weather;

      const processedWeather = {
        temperature: weatherData?.tp || null,
        humidity: weatherData?.hu || null,
        description: "Weather data from IQAir API",
        icon: "01d", // Default icon since IQAir doesn't provide weather icons
        city: city || aqiData.data.city || "Unknown",
        lat: aqiData.data.location?.coordinates?.[1] || null,
        lon: aqiData.data.location?.coordinates?.[0] || null,
        windSpeed: weatherData?.ws || null,
        pressure: weatherData?.pr || null,
      };

      res.status(200).json(processedWeather);
    } catch (error) {
      console.error("Error fetching weather from IQAir:", error);
      res.status(500).json({error: "Failed to fetch weather data from IQAir"});
    }
  });
});

/**
 * Save user data to Firestore
 */
exports.saveUserData = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({error: "Method not allowed"});
      }

      const {userId, data} = req.body;

      if (!userId || !data) {
        return res.status(400).json({error: "Missing required fields"});
      }

      await admin.firestore()
          .collection("users")
          .doc(userId)
          .set(data, {merge: true});

      res.status(200).json({success: true});
    } catch (error) {
      console.error("Error saving user data:", error);
      res.status(500).json({error: "Failed to save user data"});
    }
  });
});

/**
 * Get user data from Firestore
 */
exports.getUserData = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {userId} = req.query;

      if (!userId) {
        return res.status(400).json({error: "Missing user ID"});
      }

      const doc = await admin.firestore()
          .collection("users")
          .doc(userId)
          .get();

      if (!doc.exists) {
        return res.status(404).json({error: "User data not found"});
      }

      res.status(200).json(doc.data());
    } catch (error) {
      console.error("Error getting user data:", error);
      res.status(500).json({error: "Failed to get user data"});
    }
  });
});
