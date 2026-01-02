// src/routes/pdfRoutes.ts
import { Router } from 'express';
import { upload } from '../config/multer';
import { compressPdf } from '../controllers/compressController';
import { mergePdf } from '../controllers/mergeController';
import { splitPdf } from '../controllers/splitController';
import { encryptPDF } from '../controllers/encryptController';
import { repairPDF } from '../controllers/repairController';
import { ocrPDF } from '../controllers/ocrController';

const router = Router();

// Routes
router.post('/compress', upload.single('file'), compressPdf);
router.post('/merge', upload.array('files', 10), mergePdf);
router.post('/split', upload.single('file'), splitPdf);
router.post('/encrypt', upload.single('file'), encryptPDF);
router.post('/repair', upload.single('file'), repairPDF);
router.post('/ocr', upload.single('file'), ocrPDF);

export default router;
