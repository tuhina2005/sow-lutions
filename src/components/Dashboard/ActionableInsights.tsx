import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function ActionableInsights() {
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
      </div>
    </div>
  );
}