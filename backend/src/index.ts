import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import cors from 'cors';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs-extra';
import path from 'path';

const app = express();
const PORT = 5000;

// ======================================================
// 1. CORS (WAJIB SEBELUM ROUTE & MULTER)
// ======================================================
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  })
);

// ======================================================
// 2. LOGGER
// ======================================================
app.use((req, _res, next) => {
  console.log(
    `[REQ] ${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`
  );
  next();
});

// ======================================================
// 3. MULTER SETUP
// ======================================================
const uploadDir = path.join(process.cwd(), 'uploads');
fs.ensureDirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `upload-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// ======================================================
// 4. ROUTES
// ======================================================
app.get('/', (_req, res) => {
  res.send('BentoPDF API OK');
});

app.post(
  '/api/merge',
  upload.array('files', 10),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length < 2) {
        res.status(400).json({ error: 'Upload minimal 2 PDF' });
        return;
      }

      console.log(`Processing ${files.length} files...`);

      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const buffer = await fs.readFile(file.path);
        const pdf = await PDFDocument.load(buffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => mergedPdf.addPage(p));
      }

      const mergedBytes = await mergedPdf.save();

      // Cleanup upload
      await Promise.all(files.map((f) => fs.unlink(f.path).catch(() => {})));

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="bentopdf-merged.pdf"'
      );

      res.status(200).send(Buffer.from(mergedBytes));
    } catch (err) {
      next(err);
    }
  }
);

// ======================================================
// 5. ERROR HANDLER
// ======================================================
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('SERVER ERROR:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: err.message || 'Internal Error' });
  }
});

// ======================================================
// 6. START
// ======================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running http://localhost:${PORT}`);
  console.log(`📂 Upload dir: ${uploadDir}`);
});
