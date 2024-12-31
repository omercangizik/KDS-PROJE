from flask import Flask, render_template, request, jsonify
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import numpy as np

app = Flask(__name__)

# Model ve encoder'ları yükleyin
data = pd.read_csv('Tedarikçi-Önem-Ölçeği-Anketi-_Yanıtlar_-_3_ (1).csv')

label_encoders = {}
for column in data.columns[1:]:
    le = LabelEncoder()
    data[column] = le.fit_transform(data[column])
    label_encoders[column] = le

X = data.drop(columns=['tedarikci id', 'tavsiye'])
y = data['tavsiye']

rf_model = RandomForestClassifier()
rf_model.fit(X, y)

@app.route('/')
def index():
    return render_template('index2.html')

@app.route('/predict', methods=['POST'])
def predict():
    # Kullanıcıdan gelen veriyi al
    features = [int(request.form.get('kalite')),
                int(request.form.get('hatali_urun')),
                int(request.form.get('fiyat')),
                int(request.form.get('hiz')),
                int(request.form.get('guvenilir_hizmet')),
                int(request.form.get('belge')),
                int(request.form.get('talep')),
                int(request.form.get('stok')),
                int(request.form.get('gecmis_donem')),
                int(request.form.get('kapasite'))]

    # Veriyi modelin girdi formatına uygun hale getirin
    prediction = rf_model.predict([features])
    prediction_label = label_encoders['tavsiye'].inverse_transform(prediction)
    
    # Tahmin sonucunu döndür
    return jsonify({'tavsiyeniz': prediction_label[0]})

if __name__ == '__main__':
    app.run(debug=True)
