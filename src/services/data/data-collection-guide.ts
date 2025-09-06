// Data Collection Guide for Agricultural AI Insights

export const DATA_COLLECTION_PRIORITY = {
  critical: [
    'Soil pH (0-5cm, 15-30cm layers)',
    'Organic Carbon content',
    'Available Nitrogen, Phosphorus, Potassium',
    'Daily rainfall data',
    'Current crop information',
    'Irrigation schedule',
    'Recent fertilizer applications'
  ],
  important: [
    'Soil texture analysis (sand, silt, clay percentages)',
    'Micronutrients (Zn, Fe, Mn, Cu, B)',
    'Weather data (humidity, wind, solar radiation)',
    'Crop growth stage',
    'Pest and disease history',
    'Yield history',
    'Market prices'
  ],
  optional: [
    'Soil microbial activity',
    'Water table depth',
    'Topography data',
    'Vegetation indices (NDVI)',
    'Economic data',
    'Sustainability metrics'
  ]
};

export const DATA_SOURCES = {
  soil: {
    'Soil Testing Labs': 'Local agricultural universities, Krishi Vigyan Kendras',
    'Government Labs': 'State agricultural departments',
    'Private Labs': 'Commercial soil testing services',
    'Cost': '₹500-2000 per sample',
    'Frequency': 'Every 2-3 years or before major crop changes'
  },
  weather: {
    'IMD (India Meteorological Department)': 'Official weather data',
    'Agricultural Universities': 'Local weather stations',
    'Private Weather Services': 'AccuWeather, Weather.com',
    'Cost': 'Free to ₹5000/month for premium data',
    'Frequency': 'Daily updates'
  },
  crop: {
    'Farm Records': 'Maintain detailed farm logs',
    'Agricultural Apps': 'Kisan Suvidha, mKisan',
    'Government Portals': 'eNAM, Agmarknet',
    'Cost': 'Free to ₹1000/month',
    'Frequency': 'Weekly updates'
  },
  market: {
    'eNAM': 'National Agriculture Market',
    'Agmarknet': 'Government price data',
    'Local Markets': 'Physical market visits',
    'Cost': 'Free',
    'Frequency': 'Daily'
  }
};

export const DATA_INTEGRATION_CHECKLIST = {
  soil: [
    'Collect soil samples from multiple locations within the buffer zone',
    'Test for pH, organic carbon, NPK, micronutrients',
    'Include soil texture analysis',
    'Document sampling depth and date',
    'Note any recent amendments or treatments'
  ],
  weather: [
    'Set up local weather station if possible',
    'Subscribe to IMD data for your region',
    'Track rainfall, temperature, humidity daily',
    'Monitor evapotranspiration rates',
    'Record extreme weather events'
  ],
  crop: [
    'Document current crop variety and planting date',
    'Track growth stages and development',
    'Record irrigation and fertilization schedules',
    'Monitor pest and disease incidence',
    'Document yield and quality parameters'
  ],
  management: [
    'Record all farm operations with dates',
    'Track input usage and costs',
    'Document irrigation efficiency',
    'Monitor soil health indicators',
    'Record environmental observations'
  ]
};

export const INSIGHTS_CAPABILITIES = {
  withCurrentData: [
    'Soil moisture optimization',
    'Basic soil health assessment',
    'Temperature-based crop timing',
    'Drainage recommendations',
    'General soil structure analysis'
  ],
  withAdditionalCriticalData: [
    'Precise fertilization recommendations',
    'Crop-specific irrigation scheduling',
    'pH-based crop suitability analysis',
    'Nutrient deficiency identification',
    'Yield prediction models',
    'Pest risk assessment'
  ],
  withCompleteData: [
    'Advanced yield optimization',
    'Precision agriculture recommendations',
    'Economic analysis and ROI calculations',
    'Sustainability assessments',
    'Climate adaptation strategies',
    'Market timing advice',
    'Risk management strategies'
  ]
};
