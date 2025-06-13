import os
from flask import Flask, request, render_template, jsonify
import tensorflow as tf
from PIL import Image
import numpy as np
import argparse

app = Flask(__name__)

# Load the model
try:
    # Try loading .keras format first
    model = tf.keras.models.load_model('model/citrus_inceptionv3_finetuned_best.keras')
except Exception as e:
    print(f"Error loading model: {e}")
    raise

# Define class names
class_names = ["Greening", "Canker", "Mealybugs", "Healthy", "Powdery mildew", "Spiny whitefly"]

def preprocess_image(image):
    # Open and preprocess the image
    img = Image.open(image)
    img = img.resize((224, 224))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = img_array.reshape((1, 224, 224, 3))
    img_array = tf.cast(img_array, tf.float32) / 255.0
    
    return img_array

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    image = request.files['image']
    
    try:
        # Preprocess the image
        processed_image = preprocess_image(image)
        
        # Make prediction
        prediction = model.predict(processed_image)
        print(f"prediction: ------ {prediction}")
        predicted_class = class_names[np.argmax(prediction)]
        print(f"predicted_class: ######ßz {predicted_class}")
        confidence = float(np.max(prediction)) * 100
        
        return render_template('index.html', 
                             predicted_class=predicted_class,
                             confidence=f"{confidence:.2f}%")
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=5001, help='Port to run the Flask application on')
    args = parser.parse_args()
    app.run(debug=True, port=args.port) 