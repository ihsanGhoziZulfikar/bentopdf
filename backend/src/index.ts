import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import cors from 'cors';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const app = express();
const PORT = 5000;
const execPromise = promisify(exec);

// ======================================================
// 1. CONFIG & SETUP
// ======================================================
const BASE_URL = `http://localhost:${PORT}`;
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const DOWNLOAD_ROUTE = '/dl';

// Pastikan folder uploads ada
fs.ensureDirSync(UPLOAD_DIR);

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Sesuaikan dengan Frontend
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

// Serve Static Files (Agar link download bisa diklik)
app.use(DOWNLOAD_ROUTE, express.static(UPLOAD_DIR));

// Logging Request
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`);
  next();
});

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Bersihkan nama file agar aman di URL
    const safeName = file.originalname.replace(/[^a-zA-Z0-9]/g, '_').replace(ext, '');
    const unique = Date.now();
    cb(null, `${safeName}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Naikkan limit ke 100MB
});

// Helper: Format Size
const formatSize = (bytes: number): string => {
  if (bytes <= 0) return '0 KB';
  if (bytes > 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / 1024).toFixed(2) + ' KB';
};

// ======================================================
// 2. ENDPOINTS
// ======================================================

app.get('/', (_req, res) => {
  res.send('BentoPDF API is Running! 🚀');
});

/**
 * ------------------------------------------------------
 * API 1: COMPRESS PDF
 * Method: POST /api/compress
 * Body: file (binary), level (string: extreme, recommended, low)
 * ------------------------------------------------------
 */
app.post('/api/compress', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  let inputPath: string | null = null;
  let outputPath: string | null = null;

  try {
    // 1. Validasi Input
    if (!req.file) {
      res.status(400).json({ error: 'File binary is required' });
      return;
    }

    inputPath = req.file.path;
    const userLevel = req.body.level || 'recommended';

    // 2. Mapping Level Lebih Agresif
    // - dPDFSETTINGS=/screen (72 dpi, gambar kualitas rendah)
    // - dPDFSETTINGS=/ebook (150 dpi, gambar kualitas sedang)
    // - dPDFSETTINGS=/printer (300 dpi, gambar kualitas tinggi)
    let gsLevel = '/ebook';
    
    // Tambahan: Untuk 'extreme', kita paksa downsample gambar lebih kuat
    let extraParams = ''; 

    if (userLevel === 'extreme') {
      gsLevel = '/screen';
      // Parameter tambahan: Paksa gambar jadi Gray (Hitam Putih) dan resolusi rendah untuk ukuran minimal
      // extraParams = '-dColorImageDownsampleType=/Bicubic -dColorImageResolution=72 -sColorConversionStrategy=Gray -dProcessColorModel=/DeviceGray';
    } else if (userLevel === 'recommended') {
      gsLevel = '/ebook';
    } else if (userLevel === 'low') {
      gsLevel = '/printer'; // 'Low compression' artinya kualitas tinggi
    }

    console.log(`Compressing ${req.file.originalname} | Mode: ${userLevel}`);

    // 3. Setup Output
    const outputFilename = `compressed_${req.file.filename}`;
    outputPath = path.join(UPLOAD_DIR, outputFilename);

    // 4. Ghostscript Path (WINDOWS HARDCODED)
    const isWindows = os.platform() === 'win32';
    // PASTIKAN PATH INI BENAR SESUAI KOMPUTER ANDA
    const windowsPath = '"C:\\Program Files\\gs\\gs10.06.0\\bin\\gswin64c.exe"'; 
    const executable = isWindows ? windowsPath : 'gs';

    // 5. Command Ghostscript (Diupdate agar lebih kompatibel)
    // dCompatibilityLevel=1.4 standard umum agar size lebih kecil dari 1.7
    const gsCommand = `${executable} -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${gsLevel} ${extraParams} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;

    await execPromise(gsCommand);

    // 6. Hitung Size
    const inputStats = await fs.stat(inputPath);
    const outputStats = await fs.stat(outputPath);
    const savedBytes = inputStats.size - outputStats.size;
    const savedSizeStr = formatSize(savedBytes);

    // 7. Auto Delete (15 Menit)
    setTimeout(() => {
      if (outputPath) fs.unlink(outputPath).catch(() => {});
    }, 15 * 60 * 1000);

    // Hapus input segera
    await fs.unlink(inputPath).catch(() => {});

    // 8. Return JSON
    res.status(200).json({
      message: "success compress pdf",
      data: {
        download_url: `${BASE_URL}${DOWNLOAD_ROUTE}/${outputFilename}`,
        saved_size: savedSizeStr,
        original_size: formatSize(inputStats.size),
        compressed_size: formatSize(outputStats.size)
      }
    });

  } catch (err: any) {
    if (inputPath) fs.unlink(inputPath).catch(() => {});
    if (outputPath) fs.unlink(outputPath).catch(() => {});
    console.error('Compress Error:', err);
    res.status(500).json({ error: 'Gagal kompresi PDF', details: err.message });
  }
});

/**
 * ------------------------------------------------------
 * API 2: MERGE PDF
 * Method: POST /api/merge
 * Body: files (array of binary)
 * ------------------------------------------------------
 */
app.post('/api/merge', upload.array('files', 20), async (req: Request, res: Response, next: NextFunction) => {
  let mergedPath: string | null = null;
  const inputFiles: string[] = [];

  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length < 2) {
      res.status(400).json({ error: 'Upload minimal 2 file PDF untuk digabungkan' });
      return;
    }

    console.log(`Merging ${files.length} files...`);

    // Kumpulkan path input untuk cleanup nanti
    files.forEach(f => inputFiles.push(f.path));

    // 1. Proses Merge menggunakan pdf-lib
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const buffer = await fs.readFile(file.path);
      // Load file PDF, abaikan error jika ada file corrupt
      try {
        const pdf = await PDFDocument.load(buffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => mergedPdf.addPage(p));
      } catch (e) {
        console.warn(`Gagal membaca file ${file.originalname}, dilewati.`);
      }
    }

    const mergedBytes = await mergedPdf.save();
    
    // 2. Simpan Hasil Merge ke Disk (Bukan kirim binary langsung, biar sesuai style JSON API)
    const unique = Date.now();
    const outputFilename = `merged_bentopdf_${unique}.pdf`;
    mergedPath = path.join(UPLOAD_DIR, outputFilename);
    
    await fs.writeFile(mergedPath, mergedBytes);

    // 3. Auto Delete (15 Menit)
    setTimeout(() => {
        if (mergedPath) fs.unlink(mergedPath).catch(() => {});
    }, 15 * 60 * 1000);

    // Hapus input segera
    await Promise.all(inputFiles.map(p => fs.unlink(p).catch(() => {})));

    // 4. Return JSON Response (Konsisten dengan API Compress)
    res.status(200).json({
      message: "success merge pdf",
      data: {
        download_url: `${BASE_URL}${DOWNLOAD_ROUTE}/${outputFilename}`,
        total_files: files.length,
        file_size: formatSize(mergedBytes.length)
      }
    });

  } catch (err: any) {
    // Cleanup input jika error
    inputFiles.forEach(p => fs.unlink(p).catch(() => {}));
    if (mergedPath) fs.unlink(mergedPath).catch(() => {});
    
    console.error('Merge Error:', err);
    res.status(500).json({ error: 'Gagal menggabungkan PDF', details: err.message });
  }
});

// ======================================================
// 3. START SERVER
// ======================================================
app.listen(PORT, () => {
  console.log(`-----------------------------------------------`);
  console.log(`🚀 BentoPDF Backend Running at ${BASE_URL}`);
  console.log(`📂 API Compress: POST ${BASE_URL}/api/compress`);
  console.log(`📂 API Merge   : POST ${BASE_URL}/api/merge`);
  console.log(`-----------------------------------------------`);
});