import { Request, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';

export const encryptPDF = async (req: Request, res: Response) => {
  let inputPath = '';
  let outputPath = '';

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { userPassword, ownerPassword } = req.body;

    // 1. Tentukan Path secara absolut
    inputPath = path.resolve(req.file.path);
    const fileName = `protected_${Date.now()}.pdf`;
    const uploadDir = path.resolve('uploads');

    // Pastikan folder ada
    await fs.ensureDir(uploadDir);
    outputPath = path.join(uploadDir, fileName);

    const qpdfPath = 'C:\\qpdf\\bin\\qpdf.exe';

    const args = [
      '--encrypt',
      userPassword,
      ownerPassword || userPassword,
      '256',
      '--',
      inputPath,
      outputPath,
    ];

    // 2. RUN QPDF dan tunggu sampai SELESAI
    await new Promise<void>((resolve, reject) => {
      const p = spawn(qpdfPath, args, { windowsHide: true });

      // Tangkap error jika qpdf tidak ditemukan
      p.on('error', (err) => {
        console.error('QPDF Spawning Error:', err);
        reject(new Error('QPDF not found on system'));
      });

      p.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`QPDF exited with code ${code}`));
        }
      });
    });

    // 3. VALIDASI: Cek apakah file fisik benar-benar sudah terbentuk di disk
    if (!fs.existsSync(outputPath)) {
      throw new Error('File output was not created by QPDF');
    }

    const stat = await fs.stat(outputPath);
    if (stat.size === 0) {
      throw new Error('File output is 0 bytes');
    }

    // 4. KIRIM FILE
    // Gunakan res.sendFile agar lebih presisi dalam penanganan path absolut
    res.sendFile(outputPath, async (err) => {
      // Cleanup setelah file terkirim atau error saat kirim
      try {
        if (fs.existsSync(inputPath)) await fs.remove(inputPath);
        if (fs.existsSync(outputPath)) await fs.remove(outputPath);
        console.log('🧹 Cleanup success');
      } catch (cleanupErr) {
        console.error('Cleanup error:', cleanupErr);
      }

      if (err) {
        console.error('SendFile Error:', err);
      }
    });
  } catch (err: any) {
    console.error('🔥 Backend Error:', err.message);

    // Cleanup darurat jika gagal di tengah jalan
    if (inputPath && fs.existsSync(inputPath)) await fs.remove(inputPath);

    if (!res.headersSent) {
      res.status(500).json({ message: err.message });
    }
  }
};
