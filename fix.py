import re

with open("src/hooks/useFirebaseData.js", "r", encoding="utf-8") as f:
    text = f.read()

pattern1 = r"const mapNode1Sensors = \(rec = \{\}, defaultNode\) => \{.*?(?=const mapNode2Sensors)"
replacement1 = """const mapNode1Sensors = (rec = {}, defaultNode) => {
    const source = rec.nodeA || rec;
    const soilMoisture = source.soilMoisture ?? defaultNode.sensors.soilMoisture.value;
    const humidity = source.humidity ?? defaultNode.sensors.humidity.value;
    const temperature = (source.imuTemperature && source.imuTemperature < 100) ? parseFloat(source.imuTemperature.toFixed(1)) : source.temperature ?? defaultNode.sensors.temperature.value;
    const mq3 = source.MQ3 ?? 0;
    return {
        temperature: { ...defaultNode.sensors.temperature, value: temperature, status: getStatus(temperature, 10, 35) },
        humidity:    { ...defaultNode.sensors.humidity,    value: humidity,     status: getStatus(humidity, 30, 80) },
        soilMoisture: { ...defaultNode.sensors.soilMoisture, value: soilMoisture, status: soilMoisture > 85 ? 'critical' : soilMoisture > 70 ? 'warning' : 'normal' },
        rainfall: { ...defaultNode.sensors.rainfall, value: mq3, unit: 'ppm', status: mq3 > 1500 ? 'critical' : mq3 > 800 ? 'warning' : 'normal' },
    };
};
"""
text = re.sub(pattern1, replacement1, text, flags=re.DOTALL)

pattern2 = r"const toNode1HistoryPoint = \(rec, label\) => (?:\{|\().*?(?=const toNode2HistoryPoint)"
replacement2 = """const toNode1HistoryPoint = (rec, label) => {
    const source = rec.nodeA || rec;
    return {
        time: label,
        temperature: (source.imuTemperature && source.imuTemperature < 100) ? parseFloat(source.imuTemperature.toFixed(1)) : source.temperature ?? 0,
        humidity: source.humidity ?? 0,
        soilMoisture: source.soilMoisture ?? 0,
        rainfall: source.MQ3 ?? 0,
    };
};
"""
text = re.sub(pattern2, replacement2, text, flags=re.DOTALL)

with open("src/hooks/useFirebaseData.js", "w", encoding="utf-8") as f:
    f.write(text)
