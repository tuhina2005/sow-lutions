import { Router } from 'express';
import pestDetectionRouter from './pestDetection.js';
import soilDataRouter from './soilData.js';

const router = Router();

router.use('/pest-detection', pestDetectionRouter);
router.use('/soil-data', soilDataRouter);

export default router;