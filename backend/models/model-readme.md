AI MODEL SPECIFICATIONS — ENVIRONMENTAL INTELLIGENCE NETWORK

1. ENVIRONMENTAL / AIR POLLUTION + INDUSTRIAL HAZARD MODEL

Model File:
best_model.pt

Framework:
PyTorch

Input Shape:
[1, 60, 37]

Input:
60 timesteps × 37 features
Sampling interval: 2 seconds
Total temporal window: 120 seconds

Output:
2 outputs:
1. Air Pollution
2. Industrial Hazard

Architecture:
- Multi-Scale Conv1D (kernel sizes 3, 5, 7)
- Dilated Residual Blocks (dilation 1, 2, 4)
- 2-layer GRU
- Temporal Attention Pooling
- Dense layers: 128 → 64 → 2

37 Input Features (exact order):
1. temperature
2. humidity
3. mq3_raw_adc
4. mq5_raw_adc
5. smoke_raw_adc
6. temperature_diff
7. humidity_diff
8. mq3_raw_adc_diff
9. mq5_raw_adc_diff
10. smoke_raw_adc_diff
11. temperature_roc
12. humidity_roc
13. mq3_raw_adc_roc
14. mq5_raw_adc_roc
15. smoke_raw_adc_roc
16. mq3_rolling_mean
17. mq3_rolling_std
18. mq3_rolling_min
19. mq3_rolling_max
20. mq5_rolling_mean
21. mq5_rolling_std
22. mq5_rolling_min
23. mq5_rolling_max
24. smoke_rolling_mean
25. smoke_rolling_std
26. smoke_rolling_min
27. smoke_rolling_max
28. mq3_baseline_relative
29. mq5_baseline_relative
30. smoke_baseline_relative
31. ratio_mq5_to_smoke
32. ratio_mq3_to_smoke
33. temperature_missing
34. humidity_missing
35. mq3_missing
36. mq5_missing
37. smoke_missing

Preprocessing:
- Missing values are handled before inference.
- Features are standardized using training mean/std parameters.
- Exact feature order must be maintained.

Performance:
Combined Macro F1: ~0.9901
Exact Match Accuracy: 98.84%


--------------------------------------------------

2. FOREST FIRE MODEL

Model File:
best_model.pt

Framework:
PyTorch

Input Shape:
[1, 60, 18]

Input:
60 timesteps × 18 features

Output:
3 classes:
1. NORMAL
2. FIRE_RISK
3. ACTIVE_FIRE

Architecture:
- Input Projection: 18 → 64
- Multi-Scale Conv1D (kernel sizes 3, 5, 7)
- Dilated Residual Blocks (dilation 1, 2, 4)
- 2-layer GRU
- Hidden size: 128
- Temporal Attention Pooling
- Dense layers: 128 → 64 → 3

9 Physical Sensor Features:
1. temperature
2. humidity
3. smoke
4. gas
5. flame
6. rainfall
7. pm1_0
8. pm2_5
9. pm10

Additional 9 Missing Indicators:
10. temperature_missing
11. humidity_missing
12. smoke_missing
13. gas_missing
14. flame_missing
15. rainfall_missing
16. pm1_0_missing
17. pm2_5_missing
18. pm10_missing

Preprocessing:
- Session/sample ordering
- Missing-value indicators
- Intra-session forward fill
- Remaining missing values use training medians
- Standardization using frozen training mean/std

Performance:
Accuracy: ~98.73%
Macro F1: ~98.52%
ACTIVE_FIRE Recall: ~99.46%


--------------------------------------------------

3. FLOOD + LANDSLIDE MODEL

Model File:
flood_landslide_model.keras

Framework:
TensorFlow / Keras

Input Shape:
[1, 15]

Input:
15 engineered features
Sampling interval: 2 seconds
Temporal window: 15 samples = 30 seconds

Output:
2 independent sigmoid outputs:
1. Flood probability
2. Landslide probability

Both hazards can be detected simultaneously.

Architecture:
- Input: 15
- Dense: 32 + ReLU
- Batch Normalization
- Dropout: 0.3
- Dense: 16 + ReLU
- Batch Normalization
- Dropout: 0.3
- Flood sigmoid output
- Landslide sigmoid output

Exact 15 Input Features (order):

1. water_level_mean
2. water_level_slope
3. water_level_stddev
4. rainfall_mean
5. rainfall_slope
6. soil_moisture_mean
7. soil_moisture_slope
8. tilt_mean
9. tilt_slope
10. tilt_stddev
11. vibration_mean
12. vibration_stddev
13. vibration_spike_ratio
14. weather_api_rain_forecast_prob
15. weather_api_humidity

Feature Engineering:
- Water level converted from ultrasonic distance
- Soil moisture converted from ADC
- Tilt calculated from MPU6050 acceleration
- Vibration magnitude calculated from MPU6050
- Temporal mean, slope and standard deviation features
- Vibration spike ratio
- Weather API rainfall forecast probability and humidity

Training:
Loss: Binary Cross Entropy
Optimizer: Adam
Learning Rate: 0.001
Positive-class weighting: approximately 3×


Performance:
Flood F1: ~0.813
Landslide F1: ~0.849
Flood ROC-AUC: ~0.994
Landslide ROC-AUC: ~0.992


--------------------------------------------------

DEPLOYMENT NOTES

Backend should use the original trained model files:

Environmental:
best_model.pt

Forest Fire:
best_model.pt

Flood + Landslide:
flood_landslide_model.keras

For backend inference, model files alone are NOT sufficient.

The backend must also implement the exact:
- Input feature order
- Feature engineering
- Missing-value handling
- Scaling / normalization
- Input tensor shape
- Output interpretation

ESP32 uses converted FP32 TFLite versions of these models for edge inference.

ESP32 input formats:
Environmental: [1, 60, 37] FP32
Forest Fire: [1, 60, 18] FP32
Flood + Landslide: [1, 15] FP32

The backend prediction pipeline should produce results consistent with the ESP32 edge inference pipeline.