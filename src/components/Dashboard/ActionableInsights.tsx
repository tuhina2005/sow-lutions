import { Lightbulb } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Weather {
  main: string;
  description: string;
}

interface Main {
  temp: number;
  humidity: number;
}

interface Wind {
  speed: number;
}

interface WeatherData {
  weather: Weather[];
  main: Main;
  wind: Wind;
  name: string;
}

export default function ActionableInsights() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const city = 'Chennai';

  const insights = [
    {
      title: 'Irrigation Recommendation',
      description: 'Schedule irrigation for tomorrow morning due to forecasted dry conditions',
      priority: 'high'
    },
    {
      title: 'Nutrient Management',
      description: 'Consider applying nitrogen-rich fertilizer in Section A-2',
      priority: 'medium'
    },
    {
      title: 'Pest Control',
      description: 'Monitor aphid situation in Section B-3 closely',
      priority: 'medium'
    }
  ];
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=0f5a2eb7ee228e0d0cc4b7bd3426a17e`
        );
        const data: WeatherData = await response.json();
        setWeatherData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [city]);
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };
  const generateWeatherInsights = () => {
    if (!weatherData) return null;

    const { main, weather, wind, name } = weatherData;

    const insights = [];
    if (weather.some((w) => w.main === 'Rain')) {
      insights.push({
        title: 'Rainfall Alert',
        description: `It is currently raining in ${name}. Consider turning off irrigation systems or water pumps.`,
        priority: 'high',
      });
    }
    if (main.temp > 35) {
      insights.push({
        title: 'High Temperature Warning',
        description: `Current temperature in ${name} is very high. Ensure adequate irrigation and provide shade for crops.`,
        priority: 'high',
      });
    }
    if (main.temp < 5) {
      insights.push({
        title: 'Low Temperature Warning',
        description: `Frost risk detected in ${name}. Protect crops with covers and monitor conditions closely.`,
        priority: 'high',
      });
    }
    if (main.humidity > 80) {
      insights.push({
        title: `High Humidity Alert in ${name}`,
        description: `Humidity levels are very high at ${main.humidity}%. Monitor crops for fungal diseases.`,
        priority: 'medium',
      });
    }
    if (wind.speed > 15) {
      insights.push({
        title: 'High Wind Speed Warning',
        description: `Strong winds detected in ${name}. Secure loose equipment and monitor for potential crop damage.`,
        priority: 'medium',
      });
    }
    if (weather.some((w) => w.main === 'Clear')) {
      insights.push({
        title: 'Clear Sky Advisory',
        description: `Sunny conditions detected in ${name}. Schedule daytime irrigation to minimize evaporation.`,
        priority: 'low',
      });
    }
    if (weather.some((w) => w.main === 'Snow')) {
      insights.push({
        title: 'Snow Alert',
        description: `Snowfall detected in ${name}. Postpone fieldwork and protect livestock and equipment.`,
        priority: 'high',
      });
    }

    return insights.map((insight, index) => (
      <div key={index} className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-800">{insight.title}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(insight.priority)}`}>
            {insight.priority}
          </span>
        </div>
        <p className="text-sm text-gray-600">{insight.description}</p>
      </div>
    ));
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Actionable Insights</h2>
        <Lightbulb className="w-6 h-6 text-yellow-600" />
      </div>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-800">{insight.title}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(insight.priority)}`}>
                {insight.priority}
              </span>
            </div>
            <p className="text-sm text-gray-600">{insight.description}</p>
          </div>
        ))}
        {!loading && generateWeatherInsights()}

      </div>
    </div>
  );
}