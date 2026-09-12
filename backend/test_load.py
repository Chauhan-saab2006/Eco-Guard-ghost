import traceback
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
try:
    import tensorflow as tf
    print("TF imported")
    m = tf.keras.models.load_model('models/flood_model_test.keras')
    m.summary()
    print("Keras loaded successfully!")
except Exception as e:
    print(traceback.format_exc())

