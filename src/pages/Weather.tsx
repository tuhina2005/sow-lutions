import React, { useEffect, useState } from 'react';

interface WeatherData {
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    description: string;
    main: string;
    icon: string;
  }[];
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  clouds: {
    all: number;
  };
}

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Yakutsk&units=metric&appid=0f5a2eb7ee228e0d0cc4b7bd3426a17e`
        );
        const data: WeatherData = await response.json();
        setWeather(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!weather) {
    return <div>Error loading weather data.</div>;
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Detailed Weather Information</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {weather.name}, {weather.sys.country}
          </h2>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
            className="w-12 h-12"
          />
        </div>
        <p className="text-gray-600">
          {weather.weather[0].description.charAt(0).toUpperCase() +
            weather.weather[0].description.slice(1)}
        </p>
        <p className="text-4xl font-bold mt-2">
          {Math.round(weather.main.temp)}°C
        </p>
        <p className="text-gray-600">
          Feels like: {Math.round(weather.main.feels_like)}°C
        </p>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {/* Temperature Range */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Min Temperature</div>
            <div className="font-semibold">{Math.round(weather.main.temp_min)}°C</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Max Temperature</div>
            <div className="font-semibold">{Math.round(weather.main.temp_max)}°C</div>
          </div>
          {/* Humidity & Pressure */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Humidity</div>
            <div className="font-semibold">{weather.main.humidity}%</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Pressure</div>
            <div className="font-semibold">{weather.main.pressure} hPa</div>
          </div>
          {/* Wind Details */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Wind Speed</div>
            <div className="font-semibold">{weather.wind.speed} m/s</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Wind Direction</div>
            <div className="font-semibold">{weather.wind.deg}°</div>
          </div>
          {/* Visibility & Clouds */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Visibility</div>
            <div className="font-semibold">{weather.visibility / 1000} km</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Cloud Coverage</div>
            <div className="font-semibold">{weather.clouds.all}%</div>
          </div>
          {/* Sunrise & Sunset */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Sunrise</div>
            <div className="font-semibold">{formatTime(weather.sys.sunrise)}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Sunset</div>
            <div className="font-semibold">{formatTime(weather.sys.sunset)}</div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Actionable Insights</h3>
          <ul className="space-y-3">
            {weather.weather[0].main === 'Rain' && (
              <li className="bg-green-50 p-3 rounded-lg">
                <p>It is currently raining. Turn off irrigation systems to conserve water.</p>
              </li>
            )}
            {weather.main.temp > 35 && (
              <li className="bg-yellow-50 p-3 rounded-lg">
                <p>
                  High temperature detected! Consider additional irrigation and shading for crops.
                </p>
              </li>
            )}
            {weather.main.humidity > 80 && (
              <li className="bg-red-50 p-3 rounded-lg">
                <p>
                  High humidity levels. Monitor crops for fungal diseases and take preventive actions.
                </p>
              </li>
            )}
            {weather.wind.speed > 15 && (
              <li className="bg-orange-50 p-3 rounded-lg">
                <p>
                  Strong winds detected! Secure loose equipment and monitor for potential crop damage.
                </p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}