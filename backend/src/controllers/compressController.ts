import { Request, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { UPLOAD_DIR } from '../config/multer';
import { formatSize } from '../utils/formatSize';

const execPromise = promisify(exec);

// Config
const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;
const DOWNLOAD_ROUTE = '/dl';

export const compressPdf = async (req: Request, res: Response) => {
  let inputPath: string | null = null;
  let outputPath: string | null = null;

  try {
    // 1. Cek File Masuk
    if (!req.file) {
      res.status(400).json({ error: 'File binary is required' });
      return;
    }

    inputPath = req.file.path;

    // 2. Ambil Level (Dengan Pengaman jika req.body undefined)
    const body = req.body || {};
    const userLevel = body.level || 'recommended';

    // Logika Level Kompresi
    let gsLevel = '/ebook'; // Default (recommended)

    if (userLevel === 'extreme') {
      gsLevel = '/screen';
    } else if (userLevel === 'low') {
      gsLevel = '/printer';
    }

    console.log(`Compressing ${req.file.originalname} | Mode: ${userLevel}`);

    // Setup Output
    const outputFilename = `compressed_${Date.now()}_${req.file.originalname}`; // Tambah Date.now biar unik
    outputPath = path.join(UPLOAD_DIR, outputFilename);

    // 3. Setup Ghostscript Path (KRUSIAL: CEK PATH INI DI KOMPUTERMU)
    const isWindows = os.platform() === 'win32';
    // Pastikan folder ini benar-benar ada di Windows Explorer kamu!
    const windowsPath = '"C:\\Program Files\\gs\\gs10.06.0\\bin\\gswin64c.exe"';
    const executable = isWindows ? windowsPath : 'gs';

    // 4. Execute Command
    const gsCommand = `${executable} -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${gsLevel} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;

    await execPromise(gsCommand);

    // 5. Hitung Size & Cleanup
    const inputStats = await fs.stat(inputPath);
    const outputStats = await fs.stat(outputPath);
    const savedBytes = inputStats.size - outputStats.size;

    // Auto Delete Output (15 Menit)
    setTimeout(
      () => {
        if (outputPath) fs.unlink(outputPath).catch(() => {});
      },
      15 * 60 * 1000
    );

    // Hapus file input segera
    await fs.unlink(inputPath).catch(() => {});

    // 6. Response Sukses
    res.status(200).json({
      message: 'success compress pdf',
      data: {
        download_url: `${BASE_URL}${DOWNLOAD_ROUTE}/${outputFilename}`,
        saved_size: formatSize(savedBytes),
        original_size: formatSize(inputStats.size),
        compressed_size: formatSize(outputStats.size),
      },
    });
  } catch (err: any) {
    // Cleanup jika error
    if (inputPath) fs.unlink(inputPath).catch(() => {});
    if (outputPath) fs.unlink(outputPath).catch(() => {});

    console.error('Compress Error:', err);
    res.status(500).json({ error: 'Gagal kompresi PDF', details: err.message });
  }
};
