import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export interface SoilDataRequest {
  coordinates: {
    lat: number;
    lon: number;
  };
  npk: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  location: {
    state: string;
    district: string;
    tehsil: string;
  };
}

export interface SoilDataResponse {
  success: boolean;
  data?: any;
  error?: string;
  processingTime?: number;
}

export class SoilDataProcessor {
  private readonly scriptPath: string;
  private readonly outputPath: string;

  constructor() {
    this.scriptPath = path.join(process.cwd(), 'src', 'services', 'soil_param_script.py');
    this.outputPath = path.join(process.cwd(), 'src', 'services', 'soil_data_results.json');
  }

  async processSoilData(request: SoilDataRequest): Promise<SoilDataResponse> {
    const startTime = Date.now();
    
    try {
      // Validate input
      this.validateRequest(request);

      // Create a temporary Python script with the coordinates
      const tempScriptPath = await this.createTempScript(request);

      // Execute the Python script
      const result = await this.executePythonScript(tempScriptPath);

      // Read the results
      const soilData = await this.readResults();

      // Insert data into database
      try {
        await this.insertIntoDatabase();
        console.log('✅ Data successfully inserted into database');
      } catch (dbError) {
        console.warn('⚠️ Database insertion failed, but soil data processing completed:', dbError);
        // Don't fail the entire process if database insertion fails
      }

      // Clean up temporary file
      await this.cleanup(tempScriptPath);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          soilData,
          request,
          metadata: {
            processingTime,
            timestamp: new Date().toISOString(),
            scriptVersion: '1.0'
          }
        },
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        processingTime
      };
    }
  }

  private validateRequest(request: SoilDataRequest): void {
    if (!request.coordinates || typeof request.coordinates.lat !== 'number' || typeof request.coordinates.lon !== 'number') {
      throw new Error('Invalid coordinates provided');
    }

    if (!request.npk || typeof request.npk.nitrogen !== 'number' || typeof request.npk.phosphorus !== 'number' || typeof request.npk.potassium !== 'number') {
      throw new Error('Invalid NPK values provided');
    }

    if (!request.location || !request.location.state || !request.location.district || !request.location.tehsil) {
      throw new Error('Invalid location information provided');
    }
  }

  private async createTempScript(request: SoilDataRequest): Promise<string> {
    const tempScriptPath = path.join(process.cwd(), 'temp_soil_script.py');
    
    // Read the original script
    const originalScript = await fs.readFile(this.scriptPath, 'utf-8');
    
    // Replace the coordinates and settings
    const modifiedScript = originalScript
      .replace(/VILLAGE_COORD = \[.*?\]/, `VILLAGE_COORD = [${request.coordinates.lon}, ${request.coordinates.lat}]`)
      .replace(/AOI_MODE = '.*?'/, `AOI_MODE = 'buffer'`)
      .replace(/BUFFER_RADIUS_M = \d+/, `BUFFER_RADIUS_M = 2000`)
      .replace(/OUTPUT_JSON_PATH = '.*?'/, `OUTPUT_JSON_PATH = '${this.outputPath}'`);

    // Write the temporary script
    await fs.writeFile(tempScriptPath, modifiedScript, 'utf-8');
    
    return tempScriptPath;
  }

  private async executePythonScript(scriptPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const pythonPath = path.join(process.cwd(), 'venv', 'bin', 'python');
      const pythonProcess = spawn(pythonPath, [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('Python stdout:', data.toString());
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error('Python stderr:', data.toString());
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Python script executed successfully');
          resolve();
        } else {
          console.error(`Python script exited with code ${code}`);
          reject(new Error(`Python script failed with exit code ${code}. Error: ${stderr}`));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });

      // Set a timeout for the Python script execution
      setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Python script execution timeout (5 minutes)'));
      }, 5 * 60 * 1000); // 5 minutes timeout
    });
  }

  private async insertIntoDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const insertScriptPath = path.join(process.cwd(), 'src', 'services', 'insert_farm_info.py');
      const pythonPath = path.join(process.cwd(), 'venv', 'bin', 'python');
      
      console.log('Running database insertion script...');
      
      const pythonProcess = spawn(pythonPath, [insertScriptPath, this.outputPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          SUPABASE_URL: process.env.SUPABASE_URL,
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('Insert script stdout:', data.toString());
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error('Insert script stderr:', data.toString());
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Database insertion completed successfully');
          resolve();
        } else {
          console.error(`Database insertion script exited with code ${code}`);
          reject(new Error(`Database insertion failed with exit code ${code}. Error: ${stderr}`));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Failed to start database insertion process:', error);
        reject(new Error(`Failed to start database insertion process: ${error.message}`));
      });

      // Set a timeout for the database insertion
      setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Database insertion timeout (2 minutes)'));
      }, 2 * 60 * 1000); // 2 minutes timeout
    });
  }

  private async readResults(): Promise<any> {
    try {
      const results = await fs.readFile(this.outputPath, 'utf-8');
      return JSON.parse(results);
    } catch (error) {
      throw new Error(`Failed to read results file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async cleanup(tempScriptPath: string): Promise<void> {
    try {
      await fs.unlink(tempScriptPath);
    } catch (error) {
      console.warn('Failed to clean up temporary script:', error);
    }
  }
}
