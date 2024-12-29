export interface AnalysisResult {
  prediction: string;
  confidence: number;
  success: boolean;
}

export async function analyzePlantImage(image: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('image', image);

  try {
    const response = await fetch('http://localhost:3000/api/pest-detection/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Analysis failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}