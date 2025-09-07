import { Router, Request, Response } from 'express';
import { SoilDataProcessor, SoilDataRequest } from '../services/soilDataProcessor.js';

const router = Router();
const soilProcessor = new SoilDataProcessor();

// POST /api/soil-data/process
router.post('/process', async (req: Request, res: Response) => {
  try {
    const requestData: SoilDataRequest = req.body;

    console.log('Received soil data request:', {
      coordinates: requestData.coordinates,
      location: requestData.location,
      npk: requestData.npk
    });

    // Process the soil data
    const result = await soilProcessor.processSoilData(requestData);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Soil data processed successfully',
        data: result.data,
        processingTime: result.processingTime
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to process soil data',
        error: result.error,
        processingTime: result.processingTime
      });
    }

  } catch (error) {
    console.error('Error in soil data processing endpoint:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// GET /api/soil-data/status
router.get('/status', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Soil data processing service is running',
    timestamp: new Date().toISOString(),
    version: '1.0'
  });
});

export default router;
