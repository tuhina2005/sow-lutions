from flask import Flask, request, jsonify
import os
import numpy as np
from flask_cors import CORS
import pandas as pd
import tensorflow as tf
import joblib
from tensorflow.keras.models import load_model
from datetime import datetime, timedelta

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# District and commodity mappings
DISTRICT_NAME_TO_ID = {
    'Coimbatore': 1, 'Thiruvarur': 9, 'Nagapattinam': 16, 'Theni': 24,
    'Cuddalore': 2, 'Kancheepuram': 4, 'Thiruvannamalai': 8, 'Villupuram': 10,
    'Vellore': 29, 'Thanjavur': 7, 'Salem': 22, 'Ramanathapuram': 21,
    'Madurai': 5, 'Nagercoil (Kannyiakumari)': 17, 'Erode': 3, 'Ariyalur': 30,
    'Dindigul': 13, 'Namakkal': 18, 'Thiruvellore': 27, 'Pudukkottai': 20,
    'Virudhunagar': 11, 'Dharmapuri': 12
}

DISTRICT_ID_TO_NAME = {v: k for k, v in DISTRICT_NAME_TO_ID.items()}

COMMODITY_ID_TO_NAME = {2: 'Paddy(Dhan)(Common)',4: 'Maize',5: 'Jowar(Sorghum)',6: 'Bengal Gram(Gram)(Whole)',8: 'Black Gram (Urd Beans)(Whole)'
                       ,9: 'Green Gram (Moong)(Whole)',10: 'Groundnut',207: 'Sesamum(Sesame,Gingelly,Til)',13: 'Soyabean',14: 'Sunflower'
                       ,15: 'Cotton',19: 'Banana',28: 'Bajra(Pearl Millet/Cumbu)',30: 'Ragi (Finger Millet)',36: 'Cashewnuts',
                       39: 'Turmeric',45: 'Coffee',49: 'Arhar (Tur/Red Gram)(Whole)',50: 'Green Peas',74: 'Gur(Jaggery)',
                       92: 'Cowpea (Lobia/Karamani)',111: 'Rubber',114: 'Kulthi(Horse Gram)',115: 'Karamani',116: 'Thinai (Italian Millet)',
                       120: 'T.V. Cumbu',123: 'Castor Seed',126: 'Neem Seed',129: 'Copra',132: 'Dry Chillies',138: 'Coconut',
                       140: 'Arecanut(Betelnut/Supari)',141: 'Tobacco',150: 'Sugarcane',261: 'Tamarind Fruit',
                       264: 'Black Gram Dal (Urd Dal)',265: 'Green Gram Dal (Moong Dal)',268: 'Ground Nut Seed',
                       312: 'Groundnut pods (raw)',314: 'Groundnut (Split)',27: 'Ginger(Dry)',43: 'Coriander(Leaves)',
                       99: 'Cotton Seed',100: 'Tapioca',108: 'Corriander seed',110: 'Pepper ungarbled',117: 'Kodo Millet(Varagu)',
                       119: 'Hybrid Cumbu',262: 'Beaten Rice',269: 'Avare Dal',276: 'Gingelly Oil',296: 'Elephant Yam (Suran)',
                       414: 'Paddy(Dhan)(Basmati)',72: 'Onion',26: 'Chili Red',35: 'Brinjal',38: 'Black pepper',78: 'Tomato',82: 'Bottle gourd',
                       112: 'Coconut Seed',158: 'White Pumpkin',161: 'Raddish',263: 'Bengal Gram Dal (Chana Dal)',342: 'Spinach',
                       362: 'Kabuli Chana(Chickpeas-White)'}

COMMODITY_NAME_TO_ID = {v: k for k, v in COMMODITY_ID_TO_NAME.items()}

class CommodityPricePredictor:
    def __init__(self, models_dir='saved_models', sequence_length=30):
        self.models_dir = models_dir
        self.models_path = os.path.join(models_dir, 'models')
        self.scalers_path = os.path.join(models_dir, 'scalers')
        self.sequence_length = sequence_length
        self.loaded_models = {}

        # Configure GPU memory growth
        gpus = tf.config.experimental.list_physical_devices('GPU')
        if gpus:
            try:
                for gpu in gpus:
                    tf.config.experimental.set_memory_growth(gpu, True)
            except RuntimeError as e:
                print(f"GPU configuration error: {e}")

    def load_district_models(self, district_id):
        print(f"Loading models for district: {district_id}")
        district_models = {}
        model_files = [f for f in os.listdir(self.models_path) if f.startswith(f'district_{district_id}_')]
        print(f"Model files found: {model_files}")
        for model_file in model_files:
            try:
                commodity_id = int(model_file.split('_')[-1].split('.')[0])
                model_path = os.path.join(self.models_path, model_file)
                scaler_path = os.path.join(self.scalers_path, f'district_{district_id}_commodity_{commodity_id}.joblib')
                if not os.path.exists(scaler_path):
                    print(f"Scaler file not found: {scaler_path}")
                    continue
                model = load_model(model_path)
                scaler = joblib.load(scaler_path)
                district_models[commodity_id] = {'model': model, 'scaler': scaler}
            except Exception as e:
                print(f"Error loading model for Commodity {commodity_id}: {str(e)}")
        return district_models

    def prepare_sequence(self, historical_prices, scaler):
        print("Preparing sequence for prediction.")
        if len(historical_prices) < self.sequence_length:
            raise ValueError(f"Need at least {self.sequence_length} historical prices")
        scaled_prices = scaler.transform(historical_prices.reshape(-1, 1))
        sequence = scaled_prices[-self.sequence_length:]
        return sequence.reshape(1, self.sequence_length, 1)

    def predict_future_prices(self, district_id, commodity_id, historical_data, future_days=30):
        print(f"Predicting future prices for district {district_id}, commodity {commodity_id} for {future_days} days.")
        if district_id not in self.loaded_models:
            print(f"Loading models for district {district_id}")
            self.loaded_models[district_id] = self.load_district_models(district_id)
        if not self.loaded_models[district_id]:
            print("No models loaded for district.")
            return None

        model_data = self.loaded_models[district_id].get(commodity_id)
        if not model_data:
            print(f"Model not found for district {district_id} and commodity {commodity_id}")
            return jsonify({'error': f'Model for district {district_id} and commodity {commodity_id} not found'}), 404

        commodity_history = historical_data[
            (historical_data['district_id'] == district_id) &
            (historical_data['commodity_id'] == commodity_id)
        ]['modal_price'].values

        print(f"Commodity history length: {len(commodity_history)}")
        if len(commodity_history) < self.sequence_length:
            print(f"Insufficient data for commodity {commodity_id}. Need at least {self.sequence_length} prices.")
            return None

        sequence = self.prepare_sequence(commodity_history, model_data['scaler'])
        future_predictions = []
        current_sequence = sequence.copy()
        for _ in range(future_days):
            next_pred = model_data['model'].predict(current_sequence, verbose=0)
            future_predictions.append(next_pred[0, 0])
            current_sequence = np.roll(current_sequence, -1, axis=1)
            current_sequence[0, -1, 0] = next_pred[0, 0]
        future_predictions = np.array(future_predictions).reshape(-1, 1)
        future_predictions = model_data['scaler'].inverse_transform(future_predictions)

        return [({
            'predicted_date': (datetime.now() + timedelta(days=i + 1)).strftime('%Y-%m-%d'),
            'predicted_price': price[0]
        }) for i, price in enumerate(future_predictions)]


# Flask routes
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        print(f"Received data: {data}")
        district_name = data.get('region')
        crop_name = data.get('crop')

        if district_name not in DISTRICT_NAME_TO_ID or crop_name not in COMMODITY_NAME_TO_ID:
            print(f"Invalid district or crop name. Received: {district_name}, {crop_name}")
            return jsonify({'error': 'Invalid district or crop name'}), 400

        district_id = DISTRICT_NAME_TO_ID[district_name]
        commodity_id = COMMODITY_NAME_TO_ID[crop_name]

        # Load historical data
        historical_file = 'historical_data.csv'  # Update this path as needed
        if not os.path.exists(historical_file):
            print(f"Historical data file not found: {historical_file}")
            return jsonify({'error': 'Historical data not found'}), 500

        historical_data = pd.read_csv(historical_file, low_memory=False)
        print(f"Historical data loaded. Number of records: {len(historical_data)}")

        # Predict
        predictor = CommodityPricePredictor(models_dir='saved_models')
        print(f"Predicting for district {district_id}, commodity {commodity_id}")
        predictions = predictor.predict_future_prices(
            district_id=district_id,
            commodity_id=commodity_id,
            historical_data=historical_data,
            future_days=100
        )
        print(f"Predictions: {predictions}")
        pp = []
        for prediction in predictions:
    # Convert predicted_price to float if necessary (assuming it's already a float)
            predicted_price = int(prediction['predicted_price'])
            prediction['predicted_price'] = predicted_price
            pp.append(predicted_price)
            print(f"Date: {prediction['predicted_date']}, Price: {predicted_price}")
        if not predictions:
            print("No predictions generated.")
            return jsonify({'error': 'Could not generate predictions'}), 500

        return jsonify({'region': district_name, 'crop': crop_name, 'predictions': predictions,'prices':pp})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(port=1234, debug=True)
