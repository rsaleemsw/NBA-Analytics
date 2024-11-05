from flask import Flask, request, jsonify
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import json
from flask_cors import CORS

# Initialize the Flask app
app = Flask(__name__)
CORS(app)


# Load the JSON file containing the input data
file_path = 'nba_data.json'
df = pd.read_json(file_path)

# Split data into features (X) and target variable (y)
X = df.drop('points', axis=1)  # Features (all columns except 'points')
y = df['points']  # Target variable ('points')

# Split data into training and testing sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize and train the machine learning model (Linear Regression)
model = LinearRegression()
model.fit(X_train, y_train)

@app.route('/evaluate_model', methods=['GET'])
def evaluate_model():
    try:
        # Make predictions on the testing set
        y_pred = model.predict(X_test)

        # Evaluate model performance
        mse = mean_squared_error(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)

        # Format evaluation metrics as JSON response
        response_data = {
            'Mean Squared Error (MSE)': mse,
            'Mean Absolute Error (MAE)': mae,
            'R-squared (R²)': r2
        }

        # Write predictions to a JSON file
        predictions_data = {
            'predictions': y_pred.tolist()
        }
        with open('nba_predictions.json', 'w') as json_file:
            json.dump(predictions_data, json_file, indent=2)

        return jsonify(response_data)
    except Exception as e:
        return jsonify({'error': str(e)})
