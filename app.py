from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from scipy.sparse import hstack
import numpy as np

# Load saved files
model = joblib.load("trained_model.pkl")
tfidf = joblib.load("tfidf_vectorizer.pkl")
label_encoders = joblib.load("label_encoders.pkl")
disease_encoder = joblib.load("disease_encoder.pkl")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route("/predict", methods=["POST"])
def predict():
    try:
        print("Received prediction request")
        data = request.get_json()
        print(f"Request data: {data}")

        symptoms_text = data["symptoms"]
        age = data["age"]
        sex_text = data["sex"]
        
        print(f"Processing: symptoms='{symptoms_text}', age={age}, sex='{sex_text}'")

        # Encode sex
        sex_encoded = label_encoders['Sex'].transform([sex_text])
        sex_array = np.array(sex_encoded).reshape(-1, 1)
        print(f"Sex encoded: {sex_encoded}")

        # Vectorize symptoms
        symptom_vec = tfidf.transform([symptoms_text])
        print(f"Symptoms vectorized: shape {symptom_vec.shape}")

        # Combine features
        input_vector = hstack([symptom_vec, np.array([[age]]), sex_array])
        print(f"Input vector created: shape {input_vector.shape}")

        # Make prediction
        probs = model.predict_proba(input_vector)[0]
        print(f"Probabilities calculated: {len(probs)} classes")
        
        top_indices = np.argsort(probs)[::-1][:5]  # top 5 diseases

        result = []
        for idx in top_indices:
            disease = disease_encoder.inverse_transform([idx])[0]
            probability = probs[idx]
            result.append({"disease": disease, "probability": float(f"{probability:.2f}")})
            print(f"  {disease}: {probability:.2f}")

        print(f"Returning result: {result}")
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5001)
