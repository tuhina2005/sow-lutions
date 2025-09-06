import { SoilData, AdditionalSoilData, WeatherData, CropData, ManagementData, AgriculturalInsights } from '../data/agricultural-data-types';

export interface CurrentDataInput {
  location: [number, number]; // [longitude, latitude]
  buffer: number; // meters
  date: string;
  soilMoisture: {
    volumetricSoilWater: number;
    surfaceMoisture: number;
  };
  temperature: {
    skinTemperature: number;
  };
  soilProperties: {
    bulkDensity: Record<string, number>;
    cationExchangeCapacity: Record<string, number>;
    clayContent: Record<string, number>;
  };
}

class AgriculturalInsightsService {
  /**
   * Analyze current data and provide insights
   */
  async analyzeCurrentData(data: CurrentDataInput): Promise<{
    insights: AgriculturalInsights;
    missingData: string[];
    recommendations: string[];
    priorityActions: string[];
  }> {
    try {
      // Basic analysis with current data
      const soilHealth = this.analyzeSoilHealth(data);
      const irrigationAdvice = this.analyzeIrrigation(data);
      const cropSuitability = this.analyzeCropSuitability(data);
      
      // Identify missing critical data
      const missingData = this.identifyMissingData();
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(data, missingData);
      
      // Priority actions based on current data
      const priorityActions = this.generatePriorityActions(data);

      return {
        insights: {
          soilHealth,
          cropSuitability,
          irrigationAdvice,
          fertilizationPlan: this.generateBasicFertilizationPlan(data),
          pestRisk: this.assessPestRisk(data),
          yieldOptimization: this.optimizeYield(data),
          sustainability: this.assessSustainability(data)
        },
        missingData,
        recommendations,
        priorityActions
      };
    } catch (error) {
      console.error('Error analyzing agricultural data:', error);
      throw error;
    }
  }

  private analyzeSoilHealth(data: CurrentDataInput): AgriculturalInsights['soilHealth'] {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 70; // Base score

    // Analyze bulk density
    const avgBulkDensity = this.calculateAverage(data.soilProperties.bulkDensity);
    if (avgBulkDensity > 1.6) {
      issues.push('High bulk density indicates soil compaction');
      recommendations.push('Implement deep tillage or subsoiling');
      score -= 15;
    } else if (avgBulkDensity < 1.2) {
      issues.push('Low bulk density may indicate poor soil structure');
      recommendations.push('Add organic matter to improve soil structure');
      score -= 10;
    }

    // Analyze CEC
    const avgCEC = this.calculateAverage(data.soilProperties.cationExchangeCapacity);
    if (avgCEC < 10) {
      issues.push('Low cation exchange capacity limits nutrient retention');
      recommendations.push('Add clay or organic matter to improve CEC');
      score -= 20;
    } else if (avgCEC > 25) {
      issues.push('Very high CEC may indicate excessive clay content');
      recommendations.push('Monitor drainage and aeration');
      score -= 5;
    }

    // Analyze clay content
    const avgClay = this.calculateAverage(data.soilProperties.clayContent);
    if (avgClay > 40) {
      issues.push('High clay content may cause drainage issues');
      recommendations.push('Improve drainage and avoid over-irrigation');
      score -= 10;
    } else if (avgClay < 10) {
      issues.push('Low clay content reduces water and nutrient retention');
      recommendations.push('Add clay or organic matter');
      score -= 15;
    }

    // Analyze soil moisture
    if (data.soilMoisture.volumetricSoilWater > 0.4) {
      issues.push('High soil moisture may cause waterlogging');
      recommendations.push('Improve drainage and reduce irrigation');
      score -= 10;
    } else if (data.soilMoisture.volumetricSoilWater < 0.15) {
      issues.push('Low soil moisture indicates drought stress');
      recommendations.push('Increase irrigation frequency');
      score -= 15;
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      issues,
      recommendations
    };
  }

  private analyzeIrrigation(data: CurrentDataInput): AgriculturalInsights['irrigationAdvice'] {
    const moisture = data.soilMoisture.volumetricSoilWater;
    const temperature = data.temperature.skinTemperature;
    
    let recommendedAmount = 0;
    let frequency = 0;
    let timing = '';
    let method = '';

    // Based on soil moisture
    if (moisture < 0.15) {
      recommendedAmount = 25; // mm
      frequency = 2; // times per week
      timing = 'Early morning (6-8 AM)';
      method = 'Drip irrigation recommended';
    } else if (moisture < 0.25) {
      recommendedAmount = 15;
      frequency = 1;
      timing = 'Early morning';
      method = 'Drip or sprinkler irrigation';
    } else if (moisture > 0.4) {
      recommendedAmount = 0;
      frequency = 0;
      timing = 'Stop irrigation';
      method = 'Improve drainage first';
    } else {
      recommendedAmount = 10;
      frequency = 1;
      timing = 'Early morning';
      method = 'Light irrigation only';
    }

    // Adjust for temperature
    if (temperature > 35) {
      recommendedAmount *= 1.2;
      frequency = Math.min(3, frequency + 1);
    }

    return {
      recommendedAmount: Math.round(recommendedAmount),
      frequency,
      timing,
      method
    };
  }

  private analyzeCropSuitability(data: CurrentDataInput): AgriculturalInsights['cropSuitability'] {
    const avgClay = this.calculateAverage(data.soilProperties.clayContent);
    const avgCEC = this.calculateAverage(data.soilProperties.cationExchangeCapacity);
    const moisture = data.soilMoisture.volumetricSoilWater;
    const temperature = data.temperature.skinTemperature;

    const suitableCrops: string[] = [];
    const unsuitableCrops: string[] = [];
    const reasons: string[] = [];

    // Rice suitability
    if (avgClay > 20 && moisture > 0.3) {
      suitableCrops.push('Rice (Paddy)');
      reasons.push('High clay content and moisture suitable for rice cultivation');
    } else {
      unsuitableCrops.push('Rice (Paddy)');
      reasons.push('Insufficient clay content or moisture for rice');
    }

    // Wheat suitability
    if (avgClay > 15 && avgClay < 35 && moisture < 0.4) {
      suitableCrops.push('Wheat');
      reasons.push('Moderate clay content and good drainage for wheat');
    } else {
      unsuitableCrops.push('Wheat');
      reasons.push('Soil conditions not optimal for wheat');
    }

    // Cotton suitability
    if (avgClay < 30 && moisture < 0.35) {
      suitableCrops.push('Cotton');
      reasons.push('Well-drained soil suitable for cotton');
    } else {
      unsuitableCrops.push('Cotton');
      reasons.push('Soil too heavy or wet for cotton');
    }

    // Sugarcane suitability
    if (avgCEC > 15 && moisture > 0.25) {
      suitableCrops.push('Sugarcane');
      reasons.push('Good nutrient retention and moisture for sugarcane');
    } else {
      unsuitableCrops.push('Sugarcane');
      reasons.push('Insufficient nutrient retention or moisture');
    }

    // Maize suitability
    if (avgClay < 25 && moisture < 0.4) {
      suitableCrops.push('Maize');
      reasons.push('Well-drained soil suitable for maize');
    } else {
      unsuitableCrops.push('Maize');
      reasons.push('Soil conditions not optimal for maize');
    }

    return {
      suitableCrops,
      unsuitableCrops,
      reasons
    };
  }

  private generateBasicFertilizationPlan(data: CurrentDataInput): AgriculturalInsights['fertilizationPlan'] {
    const avgCEC = this.calculateAverage(data.soilProperties.cationExchangeCapacity);
    const avgClay = this.calculateAverage(data.soilProperties.clayContent);
    
    // Basic recommendations without actual NPK data
    let nitrogen = 120; // kg/ha
    let phosphorus = 60; // kg/ha
    let potassium = 80; // kg/ha

    // Adjust based on CEC
    if (avgCEC < 10) {
      nitrogen *= 0.8;
      phosphorus *= 0.7;
      potassium *= 0.6;
    } else if (avgCEC > 20) {
      nitrogen *= 1.2;
      phosphorus *= 1.1;
      potassium *= 1.3;
    }

    // Adjust based on clay content
    if (avgClay > 30) {
      nitrogen *= 1.1;
      phosphorus *= 1.2;
    } else if (avgClay < 15) {
      nitrogen *= 0.9;
      phosphorus *= 0.8;
    }

    return {
      nitrogen: Math.round(nitrogen),
      phosphorus: Math.round(phosphorus),
      potassium: Math.round(potassium),
      micronutrients: ['Zinc', 'Iron', 'Manganese'], // Common deficiencies
      timing: 'Split application: 50% at planting, 25% at tillering, 25% at flowering'
    };
  }

  private assessPestRisk(data: CurrentDataInput): AgriculturalInsights['pestRisk'] {
    const moisture = data.soilMoisture.volumetricSoilWater;
    const temperature = data.temperature.skinTemperature;
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    const potentialPests: string[] = [];
    const preventionMeasures: string[] = [];

    // High moisture increases disease risk
    if (moisture > 0.35) {
      riskLevel = 'high';
      potentialPests.push('Root rot', 'Fungal diseases', 'Bacterial wilt');
      preventionMeasures.push('Improve drainage', 'Avoid over-irrigation', 'Apply fungicides');
    } else if (moisture > 0.25) {
      riskLevel = 'medium';
      potentialPests.push('Fungal diseases');
      preventionMeasures.push('Monitor soil moisture', 'Apply preventive fungicides');
    }

    // High temperature increases pest activity
    if (temperature > 35) {
      if (riskLevel === 'low') riskLevel = 'medium';
      potentialPests.push('Aphids', 'Whiteflies', 'Thrips');
      preventionMeasures.push('Use reflective mulches', 'Apply insecticides', 'Increase irrigation');
    }

    return {
      riskLevel,
      potentialPests,
      preventionMeasures
    };
  }

  private optimizeYield(data: CurrentDataInput): AgriculturalInsights['yieldOptimization'] {
    const soilHealth = this.analyzeSoilHealth(data);
    const irrigation = this.analyzeIrrigation(data);
    
    // Estimate yield based on soil health
    let expectedYield = 3000; // kg/ha base
    const optimizationFactors: string[] = [];
    const actionItems: string[] = [];

    // Adjust based on soil health score
    if (soilHealth.score > 80) {
      expectedYield *= 1.2;
      optimizationFactors.push('Excellent soil health');
    } else if (soilHealth.score > 60) {
      expectedYield *= 1.0;
      optimizationFactors.push('Good soil health');
    } else {
      expectedYield *= 0.8;
      optimizationFactors.push('Soil health needs improvement');
      actionItems.push('Improve soil health before planting');
    }

    // Irrigation optimization
    if (irrigation.recommendedAmount > 0) {
      optimizationFactors.push('Optimal irrigation scheduling');
      actionItems.push(`Apply ${irrigation.recommendedAmount}mm irrigation ${irrigation.frequency} times per week`);
    } else {
      actionItems.push('Stop irrigation and improve drainage');
    }

    return {
      expectedYield: Math.round(expectedYield),
      optimizationFactors,
      actionItems
    };
  }

  private assessSustainability(data: CurrentDataInput): AgriculturalInsights['sustainability'] {
    const soilHealth = this.analyzeSoilHealth(data);
    const soilConservation: string[] = [];
    const waterConservation: string[] = [];
    const environmentalImpact: string[] = [];

    // Soil conservation
    if (soilHealth.score < 70) {
      soilConservation.push('Implement cover cropping');
      soilConservation.push('Practice crop rotation');
      soilConservation.push('Add organic matter');
    }

    // Water conservation
    const moisture = data.soilMoisture.volumetricSoilWater;
    if (moisture < 0.2) {
      waterConservation.push('Implement mulching');
      waterConservation.push('Use drip irrigation');
      waterConservation.push('Improve water storage');
    } else if (moisture > 0.4) {
      waterConservation.push('Improve drainage systems');
      waterConservation.push('Avoid over-irrigation');
    }

    // Environmental impact
    environmentalImpact.push('Monitor soil carbon levels');
    environmentalImpact.push('Reduce chemical inputs');
    environmentalImpact.push('Implement integrated pest management');

    return {
      soilConservation,
      waterConservation,
      environmentalImpact
    };
  }

  private identifyMissingData(): string[] {
    return [
      'Soil pH levels (critical for crop selection)',
      'Organic carbon content (affects soil fertility)',
      'Available NPK levels (essential for fertilization)',
      'Daily rainfall data (affects irrigation planning)',
      'Current crop information (for specific recommendations)',
      'Irrigation schedule (for optimization)',
      'Recent fertilizer applications (for nutrient balance)',
      'Micronutrient levels (Zn, Fe, Mn, Cu, B)',
      'Weather data (humidity, wind, solar radiation)',
      'Pest and disease history',
      'Yield history for comparison'
    ];
  }

  private generateRecommendations(data: CurrentDataInput, missingData: string[]): string[] {
    const recommendations: string[] = [];

    // Immediate actions based on current data
    const soilHealth = this.analyzeSoilHealth(data);
    if (soilHealth.score < 70) {
      recommendations.push('Priority: Improve soil health before next planting season');
    }

    const irrigation = this.analyzeIrrigation(data);
    if (irrigation.recommendedAmount === 0) {
      recommendations.push('Urgent: Stop irrigation and improve drainage immediately');
    }

    // Data collection recommendations
    recommendations.push('Collect soil samples for comprehensive analysis');
    recommendations.push('Set up weather monitoring station');
    recommendations.push('Document current crop and management practices');
    recommendations.push('Establish baseline yield measurements');

    return recommendations;
  }

  private generatePriorityActions(data: CurrentDataInput): string[] {
    const actions: string[] = [];
    const moisture = data.soilMoisture.volumetricSoilWater;
    const temperature = data.temperature.skinTemperature;

    // Immediate actions
    if (moisture > 0.4) {
      actions.push('URGENT: Improve drainage to prevent waterlogging');
    } else if (moisture < 0.15) {
      actions.push('URGENT: Increase irrigation to prevent drought stress');
    }

    if (temperature > 35) {
      actions.push('Monitor crops for heat stress');
      actions.push('Increase irrigation frequency during hot periods');
    }

    // Soil improvement actions
    const avgBulkDensity = this.calculateAverage(data.soilProperties.bulkDensity);
    if (avgBulkDensity > 1.6) {
      actions.push('Plan deep tillage or subsoiling for next season');
    }

    return actions;
  }

  private calculateAverage(values: Record<string, number>): number {
    const nums = Object.values(values);
    return nums.reduce((sum, num) => sum + num, 0) / nums.length;
  }
}

export const agriculturalInsightsService = new AgriculturalInsightsService();
