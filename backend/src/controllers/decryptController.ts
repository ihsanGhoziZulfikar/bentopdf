import { Request, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';

interface ApiErrorResponse {
  message: string;
}

export const decryptPDF = async (
  req: Request,
  res: Response
): Promise<void | Response<ApiErrorResponse>> => {
  let inputPath = '';
  let outputPath = '';

  try {
    // Memberikan tipe data pada file dari Multer
    const file = req.file as Express.Multer.File;
    if (!file) {
      return res.status(400).json({ message: 'No PDF file uploaded.' });
    }

    const { password } = req.body as { password?: string };
    if (!password) {
      await fs.remove(file.path);
      return res.status(400).json({ message: 'Password is required.' });
    }

    inputPath = path.resolve(file.path);
    const fileName = `unlocked_${Date.now()}_${file.originalname}`;
    const uploadsDir = path.resolve('uploads');

    await fs.ensureDir(uploadsDir);
    outputPath = path.join(uploadsDir, fileName);

    const qpdfPath = 'C:\\qpdf\\bin\\qpdf.exe';
    const args = ['--decrypt', `--password=${password}`, inputPath, outputPath];

    await new Promise<void>((resolve, reject) => {
      const p = spawn(qpdfPath, args, { windowsHide: true });
      let errorMsg = '';

      p.stderr.on('data', (data: Buffer) => {
        errorMsg += data.toString();
      });

      p.on('close', (code: number) => {
        if (code === 0) resolve();
        else {
          if (errorMsg.toLowerCase().includes('password') || code === 2) {
            reject(new Error('INVALID_PASSWORD'));
          } else {
            reject(new Error(errorMsg || 'Decryption failed'));
          }
        }
      });
    });

    res.download(outputPath, fileName, async (err) => {
      try {
        if (fs.existsSync(inputPath)) await fs.remove(inputPath);
        setTimeout(async () => {
          if (fs.existsSync(outputPath)) await fs.remove(outputPath);
        }, 5000);
      } catch (e) {
        console.error('Cleanup error:', e);
      }
    });
  } catch (error: unknown) {
    if (inputPath && fs.existsSync(inputPath)) await fs.remove(inputPath);

    const err = error as Error;
    if (err.message === 'INVALID_PASSWORD') {
      return res
        .status(401)
        .json({ message: 'Password salah! Silakan periksa kembali.' });
    }
    return res
      .status(500)
      .json({ message: 'Gagal memproses file. Pastikan file PDF valid.' });
  }
};
