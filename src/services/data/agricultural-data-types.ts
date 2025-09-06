// Agricultural Data Types for AI Insights Engine

export interface SoilData {
  // Current data you have
  bulkDensity: {
    '0to5cm': number;
    '5to15cm': number;
    '15to30cm': number;
    '30to60cm': number;
    '60to100cm': number;
    '100to200cm': number;
  };
  cationExchangeCapacity: {
    '0to5cm': number;
    '5to15cm': number;
    '15to30cm': number;
    '30to60cm': number;
    '60to100cm': number;
    '100to200cm': number;
  };
  clayContent: {
    '0to5cm': number;
    '15to30cm': number;
    '100to200cm': number;
  };
  moisture: {
    volumetricSoilWater: number; // ERA5
    surfaceMoisture: number; // SMAP
  };
  temperature: {
    skinTemperature: number; // ERA5
  };
}

export interface AdditionalSoilData {
  // Missing soil properties
  pH: {
    '0to5cm': number;
    '15to30cm': number;
    '30to60cm': number;
  };
  organicCarbon: {
    '0to5cm': number;
    '15to30cm': number;
    '30to60cm': number;
  };
  nitrogen: {
    totalNitrogen: number;
    availableNitrogen: number;
  };
  phosphorus: {
    availablePhosphorus: number;
    totalPhosphorus: number;
  };
  potassium: {
    availablePotassium: number;
    totalPotassium: number;
  };
  micronutrients: {
    zinc: number;
    iron: number;
    manganese: number;
    copper: number;
    boron: number;
  };
  soilTexture: {
    sand: number;
    silt: number;
    clay: number;
  };
  soilStructure: {
    porosity: number;
    permeability: number;
    waterHoldingCapacity: number;
  };
}

export interface WeatherData {
  // Current data you have
  temperature: {
    skinTemperature: number;
    airTemperature?: number;
    minTemperature?: number;
    maxTemperature?: number;
  };
  
  // Missing weather data
  precipitation: {
    dailyRainfall: number;
    cumulativeRainfall: number;
    rainfallIntensity: number;
  };
  humidity: {
    relativeHumidity: number;
    absoluteHumidity: number;
  };
  wind: {
    speed: number;
    direction: number;
  };
  solar: {
    radiation: number;
    sunshineHours: number;
  };
  atmospheric: {
    pressure: number;
    evapotranspiration: number;
  };
}

export interface CropData {
  // Crop-specific information
  currentCrop: {
    name: string;
    variety: string;
    plantingDate: string;
    growthStage: string;
    expectedHarvest: string;
  };
  cropHistory: Array<{
    crop: string;
    season: string;
    year: number;
    yield: number;
    issues: string[];
  }>;
  cropRotation: string[];
}

export interface ManagementData {
  // Farm management practices
  irrigation: {
    method: string; // drip, flood, sprinkler
    frequency: number;
    amount: number;
    lastIrrigation: string;
  };
  fertilization: {
    lastApplication: string;
    fertilizerType: string;
    amount: number;
    method: string;
  };
  pestControl: {
    lastTreatment: string;
    pestType: string;
    treatmentMethod: string;
    effectiveness: number;
  };
  tillage: {
    lastTillage: string;
    method: string;
    depth: number;
  };
}

export interface EconomicData {
  // Market and economic factors
  marketPrices: {
    crop: string;
    currentPrice: number;
    priceTrend: 'increasing' | 'decreasing' | 'stable';
  };
  inputCosts: {
    seeds: number;
    fertilizers: number;
    pesticides: number;
    irrigation: number;
    labor: number;
  };
  yieldPrediction: {
    expectedYield: number;
    confidence: number;
    factors: string[];
  };
}

export interface EnvironmentalData {
  // Environmental factors
  waterTable: {
    depth: number;
    quality: string;
  };
  drainage: {
    surfaceDrainage: string;
    subsurfaceDrainage: string;
  };
  topography: {
    slope: number;
    aspect: number;
    elevation: number;
  };
  vegetation: {
    ndvi: number;
    vegetationIndex: number;
  };
}

export interface AgriculturalInsights {
  soilHealth: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  cropSuitability: {
    suitableCrops: string[];
    unsuitableCrops: string[];
    reasons: string[];
  };
  irrigationAdvice: {
    recommendedAmount: number;
    frequency: number;
    timing: string;
    method: string;
  };
  fertilizationPlan: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    micronutrients: string[];
    timing: string;
  };
  pestRisk: {
    riskLevel: 'low' | 'medium' | 'high';
    potentialPests: string[];
    preventionMeasures: string[];
  };
  yieldOptimization: {
    expectedYield: number;
    optimizationFactors: string[];
    actionItems: string[];
  };
  sustainability: {
    soilConservation: string[];
    waterConservation: string[];
    environmentalImpact: string[];
  };
}

export interface DataCollectionPriority {
  critical: string[]; // Must have for basic insights
  important: string[]; // Needed for comprehensive analysis
  optional: string[]; // Nice to have for advanced features
}
