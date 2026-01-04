import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
import multer from 'multer'; // Import library multer untuk cek tipe error
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
 * WRAPPER FUNCTION:
 * Gunanya untuk menangkap error saat upload (seperti 'Unexpected end of form')
 * agar server TIDAK CRASH (mati).
 */
const handleUpload = (multerMiddleware: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    multerMiddleware(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        console.error(`[Multer Error] ${err.message}`);
        return res.status(400).json({
          message: `Upload Error: ${err.message}`,
          code: err.code,
        });
      }

      if (err) {
        console.error(`[Upload Error] ${err.message}`);
        return res.status(400).json({
          message: 'Upload failed. Connection interrupted or file corrupt.',
        });
      }

      next();
    });
  };
};

// Routes dengan Wrapper
router.post('/compress', handleUpload(upload.single('file')), compressPdf);
router.post('/merge', handleUpload(upload.array('files', 10)), mergePdf); // Perhatikan ini array
router.post('/split', handleUpload(upload.single('file')), splitPdf);
router.post('/pdf/encrypt', upload.single('file'), encryptPDF);
router.post('/summarize', upload.single('file'), summarizePdf);
router.post('/repair', handleUpload(upload.single('file')), repairPDF);
router.post('/pdf/decrypt', upload.single('file'), decryptPDF);
router.post('/ocr', handleUpload(upload.single('file')), ocrPDF);
router.post('/pdf-to-word', handleUpload(upload.single('file')), pdfToWord);

export default router;
