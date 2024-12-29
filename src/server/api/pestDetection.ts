import express from 'express';
import multer from 'multer';
import path from 'path';
import { PlantDiseaseDetector } from '../services/PlantDiseaseDetector.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const detector = new PlantDiseaseDetector();

router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const result = await detector.detectDisease(req.file.path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

export default router;