import { Request, Response } from 'express';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs-extra';

export const repairPDF = async (req: Request, res: Response) => {
  let inputPath: string | null = null;

  try {
    // 1. Cek File
    if (!req.file) {
      res.status(400).json({ message: 'File PDF tidak ditemukan.' });
      return;
    }

    inputPath = req.file.path;

    // 2. Baca File
    const fileBuffer = await fs.readFile(inputPath);

    // 3. Load PDF (Logic Repair)
    // pdf-lib akan mencoba memparsing struktur. Jika berhasil di-load,
    // berarti struktur internalnya sudah dibaca ke memori.
    // Opsi { ignoreEncryption: true } membantu membaca file yang metadata enkripsinya rusak.
    const pdfDoc = await PDFDocument.load(fileBuffer, {
      ignoreEncryption: true,
    });

    // 4. Save Ulang (Re-write)
    // Saat di-save, pdf-lib membuat ulang XREF table yang bersih.
    const repairedPdfBytes = await pdfDoc.save();

    // 5. Kirim Response
    const outputFilename = `repaired_${req.file.originalname}`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${outputFilename}"`
    );
    res.setHeader('Content-Length', repairedPdfBytes.length);

    res.send(Buffer.from(repairedPdfBytes));

    // 6. Cleanup
    await fs.unlink(inputPath).catch(() => {});
  } catch (error: any) {
    // Cleanup
    if (inputPath) await fs.unlink(inputPath).catch(() => {});

    console.error('Repair Error:', error);

    // Jika pdf-lib pun tidak bisa membacanya, berarti file rusak total
    res.status(500).json({
      message: 'Gagal memperbaiki PDF. File mungkin rusak terlalu parah.',
      details: error.message,
    });
  }
};
