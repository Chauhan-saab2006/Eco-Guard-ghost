
import re

with open('src/hooks/useFirebaseData.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'// ---- Real Weather API.*?}, \[\]\);'
replacement = '''// ---- Real Weather API (OpenWeather - Northeastern Manipur) ----
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
                if (!apiKey) return;
                
                const [weatherRes, airRes] = await Promise.all([
                    fetch(\https://api.openweathermap.org/data/2.5/weather?lat=25.1&lon=94.3&appid=\&units=metric\),
                    fetch(\https://api.openweathermap.org/data/2.5/air_pollution?lat=25.1&lon=94.3&appid=\\)
                ]);

                const weatherData = await weatherRes.json();
                const airData = await airRes.json();
                
                if (weatherData && weatherData.main) {
                    let pm25Val = 0;
                    let calculatedAqi = 0;
                    
                    if (airData && airData.list && airData.list[0]) {
                        pm25Val = airData.list[0].components.pm2_5;
                        calculatedAqi = Math.round(pm25Val * 4);
                    }

                    setFirebaseApiData(prev => ({
                        ...prev,
                        provider: 'OpenWeatherMap (Manipur Region)',
                        sensors: {
                            ...prev.sensors,
                            temperature: { ...prev.sensors.temperature, value: weatherData.main.temp },
                            humidity: { ...prev.sensors.humidity, value: weatherData.main.humidity },
                            rainfall: { ...prev.sensors.rainfall, value: weatherData.rain?.['1h'] || 0 },
                            windSpeed: { ...prev.sensors.windSpeed, value: Math.round(weatherData.wind.speed * 3.6) },
                            pressure: { ...prev.sensors.pressure, value: weatherData.main.pressure },
                            visibility: { ...prev.sensors.visibility, value: parseFloat((weatherData.visibility / 1000).toFixed(1)) },
                            aqi: { ...prev.sensors.aqi, value: calculatedAqi },
                            pm25: { ...prev.sensors.pm25, value: pm25Val },
                        }
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch weather API', err);
            }
        };
        fetchWeather();
        const interval = setInterval(fetchWeather, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);'''

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/hooks/useFirebaseData.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Fixed useFirebaseData.js')

