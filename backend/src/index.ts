import express from 'express';
import cors from 'cors';
import { UPLOAD_DIR } from './config/multer';
import pdfRoutes from './routes/pdfRoutes';

const app = express();
const PORT = 5000;
const DOWNLOAD_ROUTE = '/dl';

// 1. Middleware Global
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS', 'HEAD'], // Tambah HEAD
    allowedHeaders: ['Content-Type', 'Authorization'], // Opsional: perjelas header yg boleh
    credentials: true,
  })
);

app.use(express.json());

// 2. Logging Request
app.use((req, _res, next) => {
  console.log(
    `[REQ] ${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`
  );
  next();
});

// 3. Serve Static Files (DENGAN HEADER EKSPLISIT)
app.use(
  DOWNLOAD_ROUTE,
  express.static(UPLOAD_DIR, {
    setHeaders: (res) => {
      // Ini memaksa browser menerima file meskipun dari port beda
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    },
  })
);

// 4. Test Route
app.get('/', (_req, res) => {
  res.send('BentoPDF API is Running! 🚀');
});

// 5. Routes API
app.use('/api', pdfRoutes);

// 6. Start Server
app.listen(PORT, () => {
  console.log(`-----------------------------------------------`);
  console.log(`🚀 BentoPDF Backend Running at http://localhost:${PORT}`);
  console.log(`📂 API Ready at /api/compress and /api/merge`);
  console.log(`-----------------------------------------------`);
});
