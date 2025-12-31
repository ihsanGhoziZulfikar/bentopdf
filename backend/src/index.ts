// src/index.ts
import express from 'express';
import cors from 'cors';
import { UPLOAD_DIR } from './config/multer'; // Kita butuh path folder upload buat static file
import pdfRoutes from './routes/pdfRoutes'; // Import Routes yang sudah kita buat

const app = express();
const PORT = 5000;
const DOWNLOAD_ROUTE = '/dl';

// 1. Middleware Global
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  })
);
app.use(express.json());

// 2. Logging Request (Opsional, biar rapi)
app.use((req, _res, next) => {
  console.log(
    `[REQ] ${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`
  );
  next();
});

// 3. Serve Static Files (Agar file hasil bisa didownload)
// Menggunakan UPLOAD_DIR yang kita import dari config
app.use(DOWNLOAD_ROUTE, express.static(UPLOAD_DIR));

// 4. Test Route
app.get('/', (_req, res) => {
  res.send('BentoPDF API is Running! 🚀');
});

// 5. MENGGUNAKAN ROUTES PDF
// Semua route di pdfRoutes akan diawali dengan /api
app.use('/api', pdfRoutes);

// 6. Start Server
app.listen(PORT, () => {
  console.log(`-----------------------------------------------`);
  console.log(`🚀 BentoPDF Backend Running at http://localhost:${PORT}`);
  console.log(`📂 API Ready at /api/compress and /api/merge`);
  console.log(`-----------------------------------------------`);
});
