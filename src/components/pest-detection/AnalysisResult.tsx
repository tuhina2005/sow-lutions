import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface AnalysisResultProps {
  prediction: string;
  confidence: number;
  isHealthy: boolean;
}

export default function AnalysisResult({ prediction, confidence, isHealthy }: AnalysisResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg ${
        isHealthy ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}
    >
      <div className="flex items-start space-x-3">
        {isHealthy ? (
          <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-red-500 mt-1" />
        )}
        <div>
          <h3 className={`font-semibold ${isHealthy ? 'text-green-800' : 'text-red-800'}`}>
            {isHealthy ? 'Plant is Healthy' : 'Disease Detected'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Prediction: {prediction}
          </p>
          <div className="mt-2">
            <div className="text-sm text-gray-600 mb-1">Confidence: {(confidence * 100).toFixed(1)}%</div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className={`h-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}