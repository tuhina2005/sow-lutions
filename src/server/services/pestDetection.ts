import { PlantDiseaseDetector } from './PlantDiseaseDetector.js';

const detector = new PlantDiseaseDetector();

export const analyzePlantImage = async (imagePath: string) => {
  try {
    return await detector.detectDisease(imagePath);
  } catch (error) {
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
};