import { Router } from 'express';
import pestDetectionRouter from './pestDetection.js';

const router = Router();

router.use('/pest-detection', pestDetectionRouter);

export default router;