import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { upload } from '../config/multer';

// Controllers
import { compressPdf } from '../controllers/compressController';
import { mergePdf } from '../controllers/mergeController';
import { splitPdf } from '../controllers/splitController';
import { encryptPDF } from '../controllers/encryptController';
import { repairPDF } from '../controllers/repairController';
import { ocrPDF } from '../controllers/ocrController';
import { summarizePdf } from '../controllers/summarizeController';
import { pdfToWord } from '../controllers/pdfToWordController';
import { decryptPDF } from '../controllers/decryptController';

const router = Router();

/**
 * CORS Middleware Khusus Multer
 * - Harus dipasang sebelum Multer
 * - Menangani preflight OPTIONS
 */
const multerCors = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
};

/**
 * Wrapper Multer
 * - Fokus hanya untuk menangkap error Multer
 */
const handleUpload =
  (
    multerMiddleware: (
      req: Request,
      res: Response,
      callback: (err?: unknown) => void
    ) => void
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    multerMiddleware(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ message: `Upload Error: ${err.message}` });
      }
      if (err) {
        const error = err as Error;
        if (error.message === 'Unexpected end of form') return;
        return res.status(400).json({ message: 'Upload failed.' });
      }
      next();
    });
  };

// ==========================
// ROUTES PDF
// ==========================

// Gunakan multerCors + handleUpload di semua route upload
router.post(
  '/compress',
  multerCors,
  handleUpload(upload.single('file')),
  compressPdf
);
router.post(
  '/merge',
  multerCors,
  handleUpload(upload.array('files', 10)),
  mergePdf
);
router.post(
  '/split',
  multerCors,
  handleUpload(upload.single('file')),
  splitPdf
);
router.post(
  '/encrypt',
  multerCors,
  handleUpload(upload.single('file')),
  encryptPDF
);
router.post(
  '/summarize',
  multerCors,
  handleUpload(upload.single('file')),
  summarizePdf
);
router.post(
  '/repair',
  multerCors,
  handleUpload(upload.single('file')),
  repairPDF
);
router.post(
  '/decrypt',
  multerCors,
  handleUpload(upload.single('file')),
  decryptPDF
);
router.post('/ocr', multerCors, handleUpload(upload.single('file')), ocrPDF);
router.post(
  '/pdf-to-word',
  multerCors,
  handleUpload(upload.single('file')),
  pdfToWord
);

export default router;
