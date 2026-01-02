// src/config/multer.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';

// 1. Tentukan Folder Upload
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// 2. Pastikan folder ada saat aplikasi jalan
fs.ensureDirSync(UPLOAD_DIR);

// 3. Config Storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Bersihkan nama file
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(ext, '');
    const unique = Date.now();
    cb(null, `${safeName}-${unique}${ext}`);
  },
});

// 4. Export instance upload
export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB Limit
});
