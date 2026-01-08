/* ===============================
   0. LOAD ENV
================================ */
import dotenv from 'dotenv';
dotenv.config();

/* ===============================
   1. IMPORT LIBRARY
================================ */
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';

import { UPLOAD_DIR } from './config/multer';
import pdfRoutes from './routes/pdfRoutes';
import analyticsRoutes from './routes/analytics';

const app = express();
const PORT = 5000;

/* ===============================
   2. ENSURE UPLOAD FOLDER
================================ */
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/* ===============================
   3. CORS (PALING ATAS)
================================ */
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
  })
);

/* ===============================
   4. REQUEST LOGGER
================================ */
app.use((req, _res, next) => {
  console.log(
    `[REQ] ${req.method} ${req.originalUrl} | ${new Date().toLocaleTimeString()}`
  );
  next();
});

/* ===============================
   5. ROUTES UPLOAD (SEBELUM BODY PARSER)
   ⛔ JANGAN TARUH express.json DI SINI
================================ */
app.use('/api', pdfRoutes);

/* ===============================
   6. BODY PARSER (SETELAH UPLOAD ROUTES)
================================ */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* ===============================
   7. NON-UPLOAD ROUTES
================================ */
app.use('/api/analytics', analyticsRoutes);

/* ===============================
   8. HEALTH CHECK
================================ */
app.get('/', (_req: Request, res: Response) => {
  res.send('✅ BentoPDF Backend is Running!');
});

/* ===============================
   9. GLOBAL ERROR HANDLER
================================ */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('🔥 SERVER ERROR:', err);

  if (!res.headersSent) {
    res.status(500).json({
      message: err.message || 'Internal Server Error',
    });
  }
});

/* ===============================
   10. RUN SERVER
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
