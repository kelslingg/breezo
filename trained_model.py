#!/usr/bin/env python
# coding: utf-8

# In[1]:




# In[2]:


import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer


# In[31]:


df = pd.read_csv("data/respiratory.csv")
df


# In[25]:


df = df.dropna(subset=['Disease'])


df['Symptoms'] = df['Symptoms'].fillna('unknown')
df['Sex'] = df['Sex'].fillna('unknown')


df['Age'] = df['Age'].fillna(df['Age'].median())


df = df.drop(columns=['Treatment', 'Nature'])


df.isnull().sum()


# In[26]:


sex_encoder = LabelEncoder()
df['Sex_encoded'] = sex_encoder.fit_transform(df['Sex'])
from sklearn.preprocessing import LabelEncoder

label_encoders = {}
label_encoders['Sex'] = LabelEncoder()
label_encoders['Sex'].fit(df['Sex'])


disease_encoder = LabelEncoder()
df['Disease_encoded'] = disease_encoder.fit_transform(df['Disease'])


# In[27]:


tfidf = TfidfVectorizer(max_features=300)  # Limit to 300 features for simplicity
symptom_vectors = tfidf.fit_transform(df['Symptoms'])


# In[28]:


from scipy.sparse import hstack
import numpy as np


age_array = np.array(df['Age']).reshape(-1, 1)
sex_array = np.array(df['Sex_encoded']).reshape(-1, 1)


X = hstack([symptom_vectors, age_array, sex_array])


y = df['Disease_encoded']


# In[29]:


from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)


model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)


y_pred = model.predict(X_test)


print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nDetailed Report:\n", classification_report(y_test, y_pred, target_names=disease_encoder.classes_))


# In[24]:


probs = model.predict_proba(X_test)


i = 0 


top_n = 5
top_indices = np.argsort(probs[i])[::-1][:top_n]

print("Symptom:", df.iloc[y_test.index[i]]['Symptoms'])
print("\nTop disease probabilities:")

for idx in top_indices:
    disease = disease_encoder.inverse_transform([idx])[0]
    probability = probs[i][idx]
    print(f"{disease}: {probability:.2%}")


# In[23]:


def predict_disease(symptom_text, age, sex_text, top_n=5):

    symptom_vec = tfidf.transform([symptom_text])
    age_array = np.array([[age]])
    sex_encoded = label_encoders['Sex'].transform([sex_text])
    sex_array = np.array(sex_encoded).reshape(-1, 1)


    input_vector = hstack([symptom_vec, age_array, sex_array])

    probs = model.predict_proba(input_vector)[0]
    top_indices = np.argsort(probs)[::-1][:top_n]

    print(f"\nInput:\nSymptoms: {symptom_text}\nAge: {age}, Sex: {sex_text}\n")
    print("Top disease probabilities:")

    for idx in top_indices:
        disease = disease_encoder.inverse_transform([idx])[0]
        probability = probs[idx]
        print(f"{disease}: {probability:.2%}")


# In[14]:


predict_disease("shortness of breath and coughing", 30, "female")



# In[21]:


from sklearn.preprocessing import LabelEncoder


# In[16]:


predict_disease("shortness of breath and coughing", 30, "female")


# In[20]:


import joblib


joblib.dump(model, "disease_model.pkl")
joblib.dump(tfidf, "tfidf_vectorizer.pkl")
joblib.dump(label_encoders, "label_encoders.pkl")
joblib.dump(disease_encoder, "disease_encoder.pkl")

print("✅ All files saved!")

import joblib

# Save the model
joblib.dump(model, "trained_model.pkl")
