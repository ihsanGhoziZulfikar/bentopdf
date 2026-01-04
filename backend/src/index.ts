/* ===============================
   0. LOAD ENVIRONMENT VARIABLES
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
   1. PASTIKAN FOLDER UPLOAD ADA
================================ */
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/* ===============================
   2. CORS (HARUS PALING ATAS)
================================ */
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
  })
);

/* ===============================
   3. LOGGING REQUEST
================================ */
app.use((req, _res, next) => {
  console.log(
    `[REQ] ${req.method} ${req.url} | ${new Date().toLocaleTimeString()}`
  );
  next();
});

/* ===============================
   4. BODY PARSER
================================ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   5. ROUTES
================================ */
// PDF routes (multipart/form-data)
app.use('/api', pdfRoutes);

// ANALYTICS routes (JSON)
app.use('/api/analytics', analyticsRoutes);

/* ===============================
   6. HEALTH CHECK
================================ */
app.get('/', (_req, res) => {
  res.send('BentoPDF Backend is Running!');
});

/* ===============================
   7. GLOBAL ERROR HANDLER
================================ */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('🔥 SERVER ERROR:', err);

  if (!res.headersSent) {
    res.status(500).json({
      message: 'Internal Server Error',
      details: err.message || 'Something went wrong',
    });
  }
});

/* ===============================
   8. RUN SERVER
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
