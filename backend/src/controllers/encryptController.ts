import { Request, Response } from 'express';
import qpdf from 'node-qpdf2';
import fs from 'fs-extra';
import path from 'path';

export const encryptPDF = async (req: Request, res: Response) => {
  let inputPath: string | null = null;
  let outputPath: string | null = null;

  try {
    // 1. Validasi file dari Multer
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    inputPath = req.file.path;
    const { userPassword, ownerPassword } = req.body;

    // 2. Password User wajib ada (sesuai logika Frontend Anda)
    if (!userPassword) {
      if (inputPath) await fs.unlink(inputPath).catch(() => {});
      return res.status(400).send('User password is required.');
    }

    // 3. Setup Path Output
    const fileName = `protected_${Date.now()}_${req.file.originalname}`;
    outputPath = path.join('uploads', fileName);
    await fs.ensureDir('uploads');

    // 4. Proses Enkripsi
    // Kita gunakan casting 'as any' pada options untuk menghindari
    // konflik strict type pada 'keyLength' dan 'restrictions'
    const encryptOptions: any = {
      input: inputPath,
      output: outputPath,
      keyLength: 256, // Nilai: 40, 128, atau 256
      password: String(userPassword),
      ownerPassword: String(ownerPassword || userPassword),
      restrictions: {
        print: 'none',
        modify: 'none',
        copy: 'none',
        annotate: 'none',
      },
    };

    await qpdf.encrypt(encryptOptions);

    // 5. Kirim file hasil enkripsi ke Frontend
    if (fs.existsSync(outputPath)) {
      const encryptedBuffer = await fs.readFile(outputPath);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`
      );
      return res.send(encryptedBuffer);
    } else {
      throw new Error('Encrypted file was not created by QPDF');
    }
  } catch (error: any) {
    console.error('🔥 Encryption Error:', error);
    return res.status(500).send(`Encryption failed: ${error.message}`);
  } finally {
    // 6. Pembersihan File Sementara
    try {
      if (inputPath && fs.existsSync(inputPath)) await fs.unlink(inputPath);
      if (outputPath && fs.existsSync(outputPath)) await fs.unlink(outputPath);
    } catch (cleanupError) {
      console.error('Cleanup Error:', cleanupError);
    }
  }
};
