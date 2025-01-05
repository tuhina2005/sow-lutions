import { Router } from 'express';
import multer from 'multer';
import { config } from '../config/index.js';
import { analyzePlantImage } from '../services/pestDetection.js';

const router = Router();
const upload = multer({ dest: config.upload.dest });

router.post('/analyze', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const result = await analyzePlantImage(req.file.path);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;