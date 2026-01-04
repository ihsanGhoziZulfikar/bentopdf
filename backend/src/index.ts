import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { UPLOAD_DIR } from './config/multer';
import pdfRoutes from './routes/pdfRoutes';
import fs from 'fs';

const app = express();
const PORT = 5000;

// 1. PASTIKAN FOLDER UPLOAD ADA
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 2. BODY PARSER (WAJIB)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. CORS (AMAN & REALISTIS)
app.use(
  cors({
    origin: 'http://localhost:3000', // FRONTEND KAMU
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
  })
);

// 4. LOGGING
app.use((req, _res, next) => {
  console.log(
    `[REQ] ${req.method} ${req.url} | Time: ${new Date().toLocaleTimeString()}`
  );
  next();
});

// 5. ROUTES
app.use('/api', pdfRoutes);

app.get('/', (_req, res) => {
  res.send('BentoPDF Backend is Running!');
});

// 6. GLOBAL ERROR HANDLER
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('🔥 SERVER ERROR:', err);

  if (!res.headersSent) {
    res.status(500).json({
      message: 'Internal Server Error',
      details: err.message || 'Something went wrong',
    });
  }
});

// 7. RUN SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
