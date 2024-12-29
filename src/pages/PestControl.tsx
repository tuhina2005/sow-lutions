import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/shared/PageTransition';
import Card from '../components/shared/Card';
import ImageUpload from '../components/pest-detection/ImageUpload';
import AnalysisResult from '../components/pest-detection/AnalysisResult';
import { analyzePlantImage } from '../services/pestDetection';
import { Loader2 } from 'lucide-react';

export default function PestControl() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    prediction: string;
    confidence: number;
  } | null>(null);

  const handleImageSelect = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setIsAnalyzing(true);

    try {
      const result = await analyzePlantImage(file);
      if (result.success) {
        setAnalysisResult({
          prediction: result.prediction,
          confidence: result.confidence,
        });
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
  };

  const isHealthy = analysisResult?.prediction.includes('healthy') ?? false;

  return (
    <PageTransition>
      <div className="p-6">
        <motion.h1
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Plant Disease Detection
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Upload Plant Image</h2>
            <ImageUpload
              onImageSelect={handleImageSelect}
              selectedImage={selectedImage}
              onClear={handleClear}
            />
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            {isAnalyzing ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                <span className="ml-2 text-gray-600">Analyzing image...</span>
              </div>
            ) : analysisResult ? (
              <AnalysisResult
                prediction={analysisResult.prediction}
                confidence={analysisResult.confidence}
                isHealthy={isHealthy}
              />
            ) : (
              <div className="text-center text-gray-500 p-8">
                Upload an image to see the analysis results
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}