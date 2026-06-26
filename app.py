from flask import Flask, render_template, request, jsonify
from ultralytics import YOLO
import cv2
import base64
import numpy as np
import os

app = Flask(__name__)
model = YOLO('best_final.pt')

UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'})
    
    file = request.files['image']
    img_bytes = file.read()
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    results = model.predict(img, conf=0.25, iou=0.5, imgsz=800)
    
    result_img = results[0].plot()
    
    detections = []
    if results[0].boxes is not None:
        for box, cls, conf in zip(
            results[0].boxes.xyxy.tolist(),
            results[0].boxes.cls.tolist(),
            results[0].boxes.conf.tolist()
        ):
            class_name = 'Mango' if int(cls) == 0 else 'Tea'
            detections.append({
                'class': class_name,
                'confidence': round(conf * 100, 1)
            })
    
    _, buffer = cv2.imencode('.jpg', result_img)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    
    return jsonify({
        'image': img_base64,
        'detections': detections,
        'count': len(detections)
    })

if __name__ == '__main__':
    app.run(debug=True)