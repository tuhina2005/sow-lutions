import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface DetectionResult {
  prediction: string;
  confidence: number;
  success: boolean;
}

export class PlantDiseaseDetector {
  private pythonPath: string;
  private scriptPath: string;

  constructor(pythonPath = 'python') {
    this.pythonPath = pythonPath;
    this.scriptPath = path.join(__dirname, 'plant_disease_detector.py');
  }

  async detectDisease(imagePath: string): Promise<DetectionResult> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonPath, [
        this.scriptPath,
        imagePath
      ]);

      let result = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Process exited with code ${code}\n${error}`));
          return;
        }

        try {
          const prediction = JSON.parse(result);
          if (prediction.error) {
            reject(new Error(prediction.error));
          } else {
            resolve(prediction);
          }
        } catch (e) {
          reject(new Error(`Failed to parse result: ${e.message}`));
        }
      });
    });
  }
}