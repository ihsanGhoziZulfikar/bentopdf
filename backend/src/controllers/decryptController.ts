import { Request, Response } from 'express';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs-extra';
import * as pdfjsLib from 'pdfjs-dist';

export const decryptPDF = async (req: Request, res: Response) => {
  let inputPath: string | null = null;

  try {
    // 1. Cek apakah file ada (Multer menaruhnya di req.file)
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded.' });
    }

    inputPath = req.file.path;
    const { password } = req.body; // Diambil dari formData.append('password', ...)

    if (!password) {
      if (inputPath) await fs.unlink(inputPath).catch(() => {});
      return res
        .status(400)
        .json({ message: 'Password is required to unlock this file.' });
    }

    // 2. Baca file dari sistem
    const existingPdfBytes = await fs.readFile(inputPath);

    // 3. Proses Decrypt menggunakan pdfjs-dist untuk handle password
    let pdfDoc;
    try {
      // Gunakan pdfjs untuk unlock encrypted PDF dengan password
      const pdf = await pdfjsLib.getDocument({ data: existingPdfBytes, password: password }).promise;
      
      // Setelah ter-unlock, load ke pdf-lib untuk manipulasi
      pdfDoc = await PDFDocument.load(existingPdfBytes);
    } catch (err: any) {
      // Jika password salah, pdfjs akan melempar error
      return res.status(401).json({
        message: 'The password you entered is incorrect.',
      });
    }

    // 4. Simpan PDF (pdf-lib akan menyimpan tanpa enkripsi secara default jika tidak diset ulang)
    const decryptedPdfBytes = await pdfDoc.save();

    // 5. Setting Header untuk Download
    const outputFilename = `unlocked_${req.file.originalname}`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${outputFilename}"`
    );

    // Kirim binary file
    return res.send(Buffer.from(decryptedPdfBytes));
  } catch (error: any) {
    console.error('🔥 Decrypt Error:', error);
    return res.status(500).json({
      message: 'Failed to process PDF.',
      details: error.message,
    });
  } finally {
    // 6. Cleanup: Hapus file temporary di folder uploads
    if (inputPath) {
      await fs
        .unlink(inputPath)
        .catch((err) => console.error('Cleanup Error:', err));
    }
  }
};
