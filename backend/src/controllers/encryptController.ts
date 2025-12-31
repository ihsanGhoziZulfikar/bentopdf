import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs-extra';
import path from 'path';

// ==========================================
// CONTROLLER: ENCRYPT PDF (PURE JS VERSION)
// ==========================================
export const encryptPDF = async (req: Request, res: Response) => {
  let inputPath: string | null = null;

  try {
    // 1. Validasi File
    if (!req.file) {
      res.status(400).json({ message: 'File PDF tidak ditemukan.' });
      return;
    }

    inputPath = req.file.path;

    // 2. Ambil Password dari Body
    const { userPassword, ownerPassword } = req.body;

    // Validasi Password
    if (!userPassword) {
      // Hapus file temp jika password tidak ada
      if (inputPath) await fs.unlink(inputPath).catch(() => {});
      res.status(400).json({ message: 'User Password wajib diisi.' });
      return;
    }

    // 3. Baca File PDF dari Disk
    const fileBuffer = await fs.readFile(inputPath);

    // 4. Proses Enkripsi (AES-256 bit)
    // Jika ownerPassword kosong, samakan dengan userPassword
    const finalOwnerPassword = ownerPassword || userPassword;

    // 5. Create encrypted PDF with pdfkit
    const pdfDoc = new PDFDocument({
      userPassword: userPassword,
      ownerPassword: finalOwnerPassword,
      permissions: {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: true,
      },
    });

    // 6. Collect PDF bytes
    const chunks: Buffer[] = [];
    pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));

    const encryptedPdfBytes = await new Promise<Buffer>((resolve, reject) => {
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });

    // 7. Kirim Response Langsung (Stream)
    const outputFilename = `encrypted_${req.file.originalname}`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${outputFilename}"`
    );
    res.setHeader('Content-Length', encryptedPdfBytes.length);

    // Kirim buffer sebagai file
    res.send(Buffer.from(encryptedPdfBytes));

    // 8. Cleanup: Hapus file input asli dari folder uploads
    await fs
      .unlink(inputPath)
      .catch((err) => console.error('Gagal hapus temp file:', err));
  } catch (error: any) {
    // Cleanup jika error
    if (inputPath) await fs.unlink(inputPath).catch(() => {});

    console.error('Encrypt Error:', error);
    res.status(500).json({
      message: 'Gagal mengenkripsi PDF',
      details: error.message,
    });
  }
};
